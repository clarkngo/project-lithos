#!/usr/bin/env python3
"""Compile /novel markdown chapters into a single EPUB and PDF via pandoc.

Reads from /novel only. Never writes into that directory.

Walk order per book:
  1. front-matter/ (or frontmatter/), if present
  2. act-* directories, numeric order
  3. chapter-*.md inside each act, numeric order

If a matching plate exists at art/chapters/<same relative path>.png, it is
inserted after the chapter heading in a staging copy (the manuscript on disk
is not edited). Volume covers at art/covers/book-N.png are used as the EPUB
cover image and prepended as page one of the PDF.

Usage:
  python3 tools/export-manuscript.py
  python3 tools/export-manuscript.py --outdir dist/manuscript --book 1
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOVEL_ROOT = ROOT / "novel"
ART_CHAPTERS = ROOT / "art" / "chapters"
ART_COVERS = ROOT / "art" / "covers"
SERIES_POSTER = ROOT / "art" / "characters" / "key-art-cast.png"
DEFAULT_OUTDIR = ROOT / "exports"
TITLE = "The Last Lithoi"
AUTHOR = "Clark Ngo"

SPLIT_DIGITS = re.compile(r"(\d+)")
HEADING = re.compile(r"^# .+$", re.M)

PDF_ENGINES = ("typst", "weasyprint", "xelatex", "lualatex", "pdflatex", "wkhtmltopdf")


def natural_key(name: str) -> list:
    parts = SPLIT_DIGITS.split(name)
    key = []
    for part in parts:
        if part.isdigit():
            key.append(int(part))
        else:
            key.append(part.lower())
    return key


def require_pandoc() -> str:
    path = shutil.which("pandoc")
    if not path:
        sys.stderr.write(
            "error: pandoc is not installed or on PATH.\n"
            "Install pandoc (https://pandoc.org/installing.html) and retry.\n"
        )
        sys.exit(1)
    return path


def book_dirs(book: int | None) -> list[Path]:
    if not NOVEL_ROOT.is_dir():
        sys.stderr.write(f"error: novel directory not found: {NOVEL_ROOT}\n")
        sys.exit(1)

    if book is not None:
        path = NOVEL_ROOT / f"book-{book}"
        if not path.is_dir():
            sys.stderr.write(f"error: {path} does not exist.\n")
            sys.exit(1)
        return [path]

    found = sorted(
        (p for p in NOVEL_ROOT.iterdir() if p.is_dir() and p.name.startswith("book-")),
        key=lambda p: natural_key(p.name),
    )
    if not found:
        sys.stderr.write(
            f"error: no novel/book-* directories under {NOVEL_ROOT}\n"
        )
        sys.exit(1)
    return found


def front_matter_files(book: Path) -> list[Path]:
    for name in ("front-matter", "frontmatter", "front_matter"):
        directory = book / name
        if directory.is_dir():
            return sorted(
                (p for p in directory.glob("*.md") if p.is_file()),
                key=lambda p: natural_key(p.name),
            )
    return []


def act_dirs(book: Path) -> list[Path]:
    return sorted(
        (p for p in book.iterdir() if p.is_dir() and p.name.startswith("act-")),
        key=lambda p: natural_key(p.name),
    )


def chapter_files(act: Path) -> list[Path]:
    return sorted(
        (p for p in act.glob("chapter-*.md") if p.is_file()),
        key=lambda p: natural_key(p.name),
    )


def collect_sources(books: list[Path]) -> list[Path]:
    files: list[Path] = []
    for book in books:
        files.extend(front_matter_files(book))
        for act in act_dirs(book):
            files.extend(chapter_files(act))
    if not files:
        sys.stderr.write("error: no chapter markdown found to export.\n")
        sys.exit(1)
    return files


def art_for(source: Path) -> Path | None:
    rel = source.relative_to(NOVEL_ROOT).with_suffix(".png")
    candidate = ART_CHAPTERS / rel
    return candidate if candidate.is_file() else None


def inject_figure(markdown: str, image_name: str) -> str:
    figure = f"\n\n![]({image_name})\n\n"
    match = HEADING.search(markdown)
    if not match:
        return figure + markdown
    return markdown[: match.end()] + figure + markdown[match.end() :]


def stage_sources(sources: list[Path], staging: Path) -> list[Path]:
    staged: list[Path] = []
    for source in sources:
        rel = source.relative_to(NOVEL_ROOT)
        dest = staging / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        body = source.read_text(encoding="utf-8")
        plate = art_for(source)
        if plate:
            image_dest = dest.with_suffix(".png")
            shutil.copy2(plate, image_dest)
            image_rel = image_dest.relative_to(staging).as_posix()
            body = inject_figure(body, image_rel)
        dest.write_text(body, encoding="utf-8")
        staged.append(dest)
    return staged


def find_pdf_engine() -> str | None:
    for engine in PDF_ENGINES:
        if shutil.which(engine):
            return engine
    return None


def output_stem(book: int | None) -> str:
    if book is None:
        return "the-last-lithoi"
    return f"the-last-lithoi-book-{book}"


def cover_image(book: int | None) -> Path | None:
    """Prefer authored volume covers (title art + Clark Ngo) for EPUB/PDF."""
    if book is not None:
        for name in (f"book-{book}-authored.png", f"book-{book}.png"):
            candidate = ART_COVERS / name
            if candidate.is_file():
                return candidate
    for name in ("book-1-authored.png", "book-1.png"):
        first = ART_COVERS / name
        if first.is_file():
            return first
    if SERIES_POSTER.is_file():
        return SERIES_POSTER
    return None


def page_size_pt(pdf_path: Path) -> tuple[float, float]:
    from pypdf import PdfReader

    box = PdfReader(str(pdf_path)).pages[0].mediabox
    return float(box.width), float(box.height)


def compile_cover_pdf(cover_png: Path, dest_pdf: Path, work: Path, width_pt: float, height_pt: float) -> None:
    typst = shutil.which("typst")
    if not typst:
        sys.stderr.write("error: typst is required to stamp a cover onto the PDF.\n")
        sys.exit(1)

    shutil.copy2(cover_png, work / "cover.png")
    source = work / "cover.typ"
    source.write_text(
        (
            f"#set page(width: {width_pt}pt, height: {height_pt}pt, margin: 0pt)\n"
            '#image("cover.png", width: 100%, height: 100%, fit: "cover")\n'
        ),
        encoding="utf-8",
    )
    result = subprocess.run(
        [typst, "compile", str(source), str(dest_pdf)],
        cwd=str(work),
        check=False,
    )
    if result.returncode != 0 or not dest_pdf.is_file():
        sys.stderr.write("error: typst failed to compile the PDF cover page.\n")
        sys.exit(result.returncode or 1)


def prepend_cover_pdf(cover_png: Path, body_pdf: Path, work: Path) -> None:
    from pypdf import PdfReader, PdfWriter

    width_pt, height_pt = page_size_pt(body_pdf)
    cover_pdf = work / "cover.pdf"
    compile_cover_pdf(cover_png, cover_pdf, work, width_pt, height_pt)

    body = PdfReader(str(body_pdf))
    writer = PdfWriter()
    for page in PdfReader(str(cover_pdf)).pages:
        writer.add_page(page)
    for page in body.pages:
        writer.add_page(page)
    # Cover merge via pypdf drops pandoc/Typst metadata; restore author + title.
    meta = body.metadata or {}
    writer.add_metadata(
        {
            "/Author": str(meta.get("/Author") or AUTHOR),
            "/Title": str(meta.get("/Title") or ""),
            "/Creator": str(meta.get("/Creator") or "pandoc"),
            "/Producer": "project-lithos export-manuscript",
        }
    )
    stamped = work / "stamped.pdf"
    with stamped.open("wb") as handle:
        writer.write(handle)
    shutil.move(stamped, body_pdf)


def run_pandoc(pandoc: str, args: list[str]) -> None:
    result = subprocess.run([pandoc, *args], check=False)
    if result.returncode != 0:
        sys.stderr.write(
            f"error: pandoc exited {result.returncode}: {' '.join(args)}\n"
        )
        sys.exit(result.returncode)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--outdir",
        type=Path,
        default=DEFAULT_OUTDIR,
        help=f"directory for EPUB/PDF output (default: {DEFAULT_OUTDIR})",
    )
    parser.add_argument(
        "--book",
        type=int,
        default=None,
        help="export a single book-N directory (default: all books, in order)",
    )
    parser.add_argument(
        "--format",
        choices=("all", "epub", "pdf"),
        default="all",
        help="which artifacts to build (default: all)",
    )
    args = parser.parse_args()

    if args.outdir.resolve().is_relative_to(NOVEL_ROOT.resolve()):
        sys.stderr.write("error: refusing to write output inside /novel.\n")
        sys.exit(1)

    pandoc = require_pandoc()
    sources = collect_sources(book_dirs(args.book))
    args.outdir.mkdir(parents=True, exist_ok=True)
    stem = output_stem(args.book)

    print("Sources, in order:")
    for source in sources:
        marker = " [art]" if art_for(source) else ""
        print(f"  {source.relative_to(ROOT)}{marker}")

    metadata = [
        "--metadata",
        f"title={TITLE}",
        "--metadata",
        f"author={AUTHOR}",
        "--toc",
    ]
    cover = cover_image(args.book)
    if cover:
        metadata.extend(["--epub-cover-image", str(cover)])
        print(f"Cover: {cover.relative_to(ROOT)}")
    print(f"Author: {AUTHOR}")

    with tempfile.TemporaryDirectory(prefix="lithos-export-") as tmp:
        staging = Path(tmp)
        staged = stage_sources(sources, staging)
        source_args = [str(path) for path in staged]
        resource_path = str(staging)

        if args.format in ("all", "epub"):
            epub_path = args.outdir / f"{stem}.epub"
            print(f"\nWriting {epub_path}")
            run_pandoc(
                pandoc,
                [
                    *metadata,
                    f"--resource-path={resource_path}",
                    "-o",
                    str(epub_path),
                    *source_args,
                ],
            )

        if args.format in ("all", "pdf"):
            engine = find_pdf_engine()
            if not engine:
                sys.stderr.write(
                    "error: pandoc is installed, but no PDF engine was found on PATH.\n"
                    f"Install one of: {', '.join(PDF_ENGINES)}.\n"
                    "EPUB export can still be run with: python3 tools/export-manuscript.py --format epub\n"
                )
                sys.exit(1)
            pdf_path = args.outdir / f"{stem}.pdf"
            print(f"\nWriting {pdf_path} (engine: {engine})")
            run_pandoc(
                pandoc,
                [
                    "--metadata",
                    f"title={TITLE}",
                    "--metadata",
                    f"author={AUTHOR}",
                    "--toc",
                    f"--pdf-engine={engine}",
                    f"--resource-path={resource_path}",
                    "-o",
                    str(pdf_path),
                    *source_args,
                ],
            )
            if cover:
                print(f"Stamping PDF cover from {cover.relative_to(ROOT)}")
                prepend_cover_pdf(cover, pdf_path, staging)

    print("\nDone.")


if __name__ == "__main__":
    main()
