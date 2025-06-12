import { defineConfig } from "vite";
import reactSwc from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/", // Set the base path for the application
  plugins: [reactSwc()], // Use the SWC-based React plugin
  build: {
    chunkSizeWarningLimit: 1000, // in KB, default is 500
  },
});
