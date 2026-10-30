import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// NOTE: Never share or host a dist/ built with a real key! Client bundles expose injected defines.
const defines: Record<string, string> = {};
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
  defines['process.env.GEMINI_API_KEY'] = JSON.stringify(process.env.GEMINI_API_KEY);
}

export default defineConfig({
  plugins: [react()],
  define: defines,
  server: {
    port: 5173,
    host: true
  }
});
