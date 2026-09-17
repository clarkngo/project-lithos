import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const repoName = "project-lithos";
const base =
  process.env.PUBLIC_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" ? `/${repoName}/` : "/");

export default defineConfig({
  site: "https://clarkngo.github.io",
  base,
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [fileURLToPath(new URL("../..", import.meta.url))],
      },
    },
  },
});
