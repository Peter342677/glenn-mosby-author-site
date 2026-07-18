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
        shop: resolve(__dirname, 'src/shop.html'),
        contact: resolve(__dirname, 'src/contact.html'),
        productColoringBook: resolve(__dirname, 'src/product-coloring-book.html'),
        productCanvasKit: resolve(__dirname, 'src/product-canvas-kit.html'),
        cart: resolve(__dirname, 'src/cart.html'),
        checkout: resolve(__dirname, 'src/checkout.html'),
        checkoutSuccess: resolve(__dirname, 'src/checkout-success.html'),
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
