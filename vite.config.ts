
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically define the API_KEY to ensure it's replaced during the build process
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
