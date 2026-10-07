import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],

  build: {
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        invitation: resolve(root, "invitation.html"),
      },
    },
  },
});
