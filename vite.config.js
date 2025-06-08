import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/my-learning-hub/", // Set the base path for the application
  plugins: [react()],
});
