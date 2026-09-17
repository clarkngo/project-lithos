import matter from "gray-matter";
import { marked } from "marked";

const rawDocs = import.meta.glob("../../../../docs/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  seeAlso?: string[];
};

export type DocPage = {
  collection: string;
  slug: string;
  title: string;
  role?: string;
  description?: string;
  order: number;
  spoiler: boolean;
  html: string;
  terms: GlossaryTerm[];
};

type DocFrontmatter = {
  title?: string;
  role?: string;
  description?: string;
  collection?: string;
  order?: number;
  spoiler?: boolean;
  terms?: GlossaryTerm[];
};

const COLLECTIONS = new Set([
  "characters",
  "factions",
  "magic-system",
  "timeline",
  "glossary",
]);

function parseLocation(globKey: string): { collection: string; slug: string } | null {
  const marker = "/docs/";
  const index = globKey.lastIndexOf(marker);
  if (index === -1) return null;

  const rel = globKey.slice(index + marker.length).replace(/\.md$/, "");
  if (rel === "README") return null;

  if (!rel.includes("/")) {
    return {
      collection: rel === "glossary" ? "glossary" : "root",
      slug: rel,
    };
  }

  const [collection, slug] = rel.split("/");
  return { collection, slug };
}

function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false, gfm: true }) as string;
}

function loadAll(): DocPage[] {
  const pages: DocPage[] = [];

  for (const [globKey, source] of Object.entries(rawDocs)) {
    const location = parseLocation(globKey);
    if (!location || !COLLECTIONS.has(location.collection)) continue;

    const parsed = matter(source);
    const data = parsed.data as DocFrontmatter;
    const title = data.title ?? location.slug;

    pages.push({
      collection: data.collection ?? location.collection,
      slug: location.slug,
      title,
      role: data.role,
      description: data.description,
      order: data.order ?? 99,
      spoiler: Boolean(data.spoiler),
      html: renderMarkdown(parsed.content),
      terms: data.terms ?? [],
    });
  }

  return pages.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

const allPages = loadAll();

export function loadCollection(collection: string): DocPage[] {
  return allPages.filter((page) => page.collection === collection);
}

export function loadPage(collection: string, slug: string): DocPage | undefined {
  return allPages.find((page) => page.collection === collection && page.slug === slug);
}

export function loadGlossary(): { page: DocPage | undefined; terms: GlossaryTerm[] } {
  const page = allPages.find((item) => item.collection === "glossary");
  return { page, terms: page?.terms ?? [] };
}
