import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/my-learning-hub/", // <-- very important
  plugins: [react()],
});
