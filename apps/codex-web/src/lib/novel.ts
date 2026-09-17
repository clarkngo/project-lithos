import { marked } from "marked";

const rawNovel = import.meta.glob("../../../../novel/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const chapterArt = import.meta.glob("../../../../art/chapters/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type NovelKind = "front-matter" | "chapter";

export type NovelPiece = {
  book: number;
  bookSlug: string;
  path: string;
  rest: string;
  kind: NovelKind;
  act?: string;
  actLabel?: string;
  filename: string;
  title: string;
  description: string;
  html: string;
  plateSrc?: string;
};

export type NovelBook = {
  number: number;
  slug: string;
  title: string;
  subtitle?: string;
  pieces: NovelPiece[];
  start: NovelPiece;
};

const BOOK_META: Record<number, { title: string; subtitle?: string }> = {
  1: { title: "Book One" },
  2: { title: "Book Two", subtitle: "The Tethering" },
  3: { title: "Book Three", subtitle: "The Spire's Reckoning" },
};

function relativePath(globKey: string): string | null {
  const marker = "/novel/";
  const index = globKey.lastIndexOf(marker);
  if (index === -1) return null;
  return globKey.slice(index + marker.length).replace(/\.md$/, "").replaceAll("\\", "/");
}

function naturalKey(name: string): (string | number)[] {
  return name.split(/(\d+)/).map((part) => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()));
}

function compareNatural(a: string, b: string): number {
  const left = naturalKey(a);
  const right = naturalKey(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const va = left[i];
    const vb = right[i];
    if (va === undefined) return -1;
    if (vb === undefined) return 1;
    if (va === vb) continue;
    if (typeof va === "number" && typeof vb === "number") return va - vb;
    return String(va).localeCompare(String(vb));
  }
  return 0;
}

function headingTitle(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.replace(/\*+/g, "").trim();
}

function fallbackTitle(filename: string): string {
  return filename
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function firstParagraph(markdown: string): string {
  const withoutHeading = markdown.replace(/^#\s+.+$/m, "").trim();
  const block = withoutHeading.split(/\n\s*\n/)[0] ?? "";
  return block.replace(/\s+/g, " ").replace(/\*+/g, "").trim().slice(0, 220);
}

function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false, gfm: true }) as string;
}

function chapterPlateSrc(path: string): string | undefined {
  const needle = `/art/chapters/${path}.png`;
  const match = Object.entries(chapterArt).find(([key]) => key.replaceAll("\\", "/").endsWith(needle));
  return match?.[1];
}

function parsePiece(rel: string, source: string): NovelPiece | null {
  const parts = rel.split("/");
  if (!parts[0]?.startsWith("book-")) return null;

  const book = Number(parts[0].slice("book-".length));
  if (!Number.isInteger(book) || book < 1) return null;

  const folder = parts[1];
  const file = parts[2];
  if (!folder || !file) return null;
  if (folder === "outline" || file === "outline") return null;

  const isFront =
    folder === "front-matter" || folder === "frontmatter" || folder === "front_matter";
  const isChapter = folder.startsWith("act-") && file.startsWith("chapter-");
  if (!isFront && !isChapter) return null;

  const rest = `${folder}/${file}`;
  const title = headingTitle(source) ?? fallbackTitle(file);

  return {
    book,
    bookSlug: parts[0],
    path: rel,
    rest,
    kind: isFront ? "front-matter" : "chapter",
    act: isChapter ? folder : undefined,
    actLabel: isChapter ? `Act ${Number(folder.slice("act-".length))}` : undefined,
    filename: file,
    title,
    description: firstParagraph(source),
    html: renderMarkdown(source),
    plateSrc: chapterPlateSrc(rel),
  };
}

function sortPieces(a: NovelPiece, b: NovelPiece): number {
  if (a.book !== b.book) return a.book - b.book;
  if (a.kind !== b.kind) return a.kind === "front-matter" ? -1 : 1;
  return compareNatural(a.path, b.path);
}

function loadPieces(): NovelPiece[] {
  const pieces: NovelPiece[] = [];
  for (const [globKey, source] of Object.entries(rawNovel)) {
    const rel = relativePath(globKey);
    if (!rel) continue;
    const piece = parsePiece(rel, source);
    if (piece) pieces.push(piece);
  }
  return pieces.sort(sortPieces);
}

const allPieces = loadPieces();

function bookMeta(number: number): { title: string; subtitle?: string } {
  return BOOK_META[number] ?? { title: `Book ${number}` };
}

export function listBooks(): NovelBook[] {
  const numbers = [...new Set(allPieces.map((piece) => piece.book))].sort((a, b) => a - b);
  return numbers
    .map((number) => loadBook(`book-${number}`))
    .filter((book): book is NovelBook => Boolean(book));
}

export function loadBook(bookSlug: string): NovelBook | undefined {
  const pieces = allPieces.filter((piece) => piece.bookSlug === bookSlug);
  const start = pieces[0];
  if (!start) return undefined;
  const meta = bookMeta(start.book);
  return {
    number: start.book,
    slug: bookSlug,
    title: meta.title,
    subtitle: meta.subtitle,
    pieces,
    start,
  };
}

export function loadPiece(bookSlug: string, rest: string): NovelPiece | undefined {
  return allPieces.find((piece) => piece.bookSlug === bookSlug && piece.rest === rest);
}

export function neighbors(piece: NovelPiece): { prev?: NovelPiece; next?: NovelPiece } {
  const book = loadBook(piece.bookSlug);
  if (!book) return {};
  const index = book.pieces.findIndex((item) => item.path === piece.path);
  if (index === -1) return {};
  return {
    prev: book.pieces[index - 1],
    next: book.pieces[index + 1],
  };
}

export function groupByAct(book: NovelBook): { label: string; pieces: NovelPiece[] }[] {
  const groups: { label: string; pieces: NovelPiece[] }[] = [];
  const front = book.pieces.filter((piece) => piece.kind === "front-matter");
  if (front.length) groups.push({ label: "Front matter", pieces: front });

  for (const piece of book.pieces) {
    if (piece.kind !== "chapter" || !piece.actLabel) continue;
    const last = groups[groups.length - 1];
    if (last?.label === piece.actLabel) last.pieces.push(piece);
    else groups.push({ label: piece.actLabel, pieces: [piece] });
  }

  return groups;
}
