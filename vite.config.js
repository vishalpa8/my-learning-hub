import { defineConfig } from "vite";
import reactSwc from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/", // Set the base path for the application
  plugins: [reactSwc()], // Use the SWC-based React plugin
  test: {
    globals: true,
    environment: "jsdom",
    watch: false,
    setupFiles: "./src/tests/setup.js",
  },
});
