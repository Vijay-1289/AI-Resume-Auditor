import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
        },
      },
      external: ['pdfjs-dist/build/pdf.worker.min.js'], // Externalize the worker file to prevent build error
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  // Removed assetsInclude and publicDir as the worker is externalized and loaded via CDN
  // assetsInclude: ['**/*.worker.min.js'],
  // publicDir: 'public',
}));
