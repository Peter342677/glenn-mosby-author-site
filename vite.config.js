import { defineConfig } from 'vite';
import { resolve } from 'path';

const API_PORT = process.env.API_PORT || 3120;

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        book: resolve(__dirname, 'src/book.html'),
        author: resolve(__dirname, 'src/author.html'),
        contact: resolve(__dirname, 'src/contact.html'),
      },
      output: {
        manualChunks: {
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText'],
          lenis: ['lenis'],
        },
      },
    },
  },
});
