import { defineConfig } from "vite";
                                import react from "@vitejs/plugin-react";

                                export default defineConfig({
                                  base: "./", // Ensures assets are loaded correctly on GitLab Pages
                                  plugins: [react()],
                                  css: {
                                    // Add this section to handle CSS properly
                                    modules: {
                                      localsConvention: 'camelCase'
                                    },
                                    postcss: {
                                      plugins: []
                                    }
                                  },
                                  build: {
                                    outDir: 'dist',
                                    assetsDir: 'assets',
                                    cssCodeSplit: false, // This will bundle all CSS into one file
                                    sourcemap: true,
                                    rollupOptions: {
                                      output: {
                                        manualChunks: undefined
                                      }
                                    }
                                  }
                                });