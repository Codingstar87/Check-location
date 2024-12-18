import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { // Add the leading slash
        target: "http://localhost:8000", // Backend server URL
        changeOrigin: true, // Allows for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Removes '/api' prefix in requests
      },
    },
  },
});

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'


// export default defineConfig({
//   plugins: [react()],

// })
