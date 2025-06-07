import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";

   export default defineConfig({
     base: "./", // Ensures assets are loaded correctly on GitLab Pages
     plugins: [react()],
     build: {
       outDir: 'dist',
       assetsDir: 'assets',
       // Ensure source maps for better debugging
       sourcemap: true,
       // Optimize the build output
       rollupOptions: {
         output: {
           assetFileNames: (assetInfo) => {
             const info = assetInfo.name.split('.');
             const ext = info[info.length - 1];
             if (/\.(css)$/i.test(assetInfo.name)) {
               return `assets/css/[name]-[hash][extname]`;
             }
             return `assets/[name]-[hash][extname]`;
           },
         },
       },
     },
   });