import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* the pre-launch landing: a static site, no API, no proxy — Netlify serves the build and takes the sign-up form's posts */
export default defineConfig({
  plugins: [react()],
  server: { port: 5300, strictPort: true },
  build: { target: 'es2020' },
});
