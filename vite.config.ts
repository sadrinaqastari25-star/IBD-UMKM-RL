import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Base public path, vital for some deployments
    base: './', 
    define: {
      // Stringify the API key so it's inserted as a string literal in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Prevent crash if other process.env vars are accessed
      'process.env': JSON.stringify({}) 
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});