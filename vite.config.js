
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // Ensures assets are loaded correctly on GitLab Pages
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: "dist",
  },
});