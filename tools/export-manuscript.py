#!/usr/bin/env python3
"""Compile /novel markdown chapters into a single EPUB and PDF via pandoc.

Reads from /novel only. Never writes into that directory.

Walk order per book:
  1. front-matter/ (or frontmatter/), if present
  2. act-* directories, numeric order
  3. chapter-*.md inside each act, numeric order

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
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOVEL_ROOT = ROOT / "novel"
DEFAULT_OUTDIR = ROOT / "dist" / "manuscript"
TITLE = "The Last Lithoi"

SPLIT_DIGITS = re.compile(r"(\d+)")


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
            "error: pandoc is not installed or not on PATH.\n"
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


def find_pdf_engine() -> str | None:
    for engine in ("xelatex", "lualatex", "pdflatex", "wkhtmltopdf", "weasyprint"):
        if shutil.which(engine):
            return engine
    return None


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

    print("Sources, in order:")
    for source in sources:
        print(f"  {source.relative_to(ROOT)}")

    source_args = [str(path) for path in sources]
    metadata = ["--metadata", f"title={TITLE}", "--toc"]

    if args.format in ("all", "epub"):
        epub_path = args.outdir / "the-last-lithoi.epub"
        print(f"\nWriting {epub_path}")
        run_pandoc(pandoc, [*metadata, "-o", str(epub_path), *source_args])

    if args.format in ("all", "pdf"):
        engine = find_pdf_engine()
        if not engine:
            sys.stderr.write(
                "error: pandoc is installed, but no PDF engine was found on PATH.\n"
                "Install one of: xelatex, lualatex, pdflatex, wkhtmltopdf, weasyprint.\n"
                "EPUB export can still be run with: python3 tools/export-manuscript.py --format epub\n"
            )
            sys.exit(1)
        pdf_path = args.outdir / "the-last-lithoi.pdf"
        print(f"\nWriting {pdf_path} (engine: {engine})")
        run_pandoc(
            pandoc,
            [
                *metadata,
                f"--pdf-engine={engine}",
                "-o",
                str(pdf_path),
                *source_args,
            ],
        )

    print("\nDone.")


if __name__ == "__main__":
    main()
