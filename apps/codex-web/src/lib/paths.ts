export function withBase(path = ""): string {
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = path.replace(/^\/+/, "");
  if (!trimmed) {
    return base.endsWith("/") ? base : `${base}/`;
  }
  return `${base.endsWith("/") ? base : `${base}/`}${trimmed}`;
}
