import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // Set the base path for the application
  plugins: [react()], // Use the React plugin for Vite
  build: {
    chunkSizeWarningLimit: 1000, // in KB, default is 500
  },
});
