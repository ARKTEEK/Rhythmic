import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    port: 5174,
    host: '127.0.0.1',
  },
  plugins: [
    react(),
    tailwindcss(),
    mkcert()],
})
