import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv';

// Determine if we're in production mode
const isProd = process.env.NODE_ENV === 'production' || process.env.MODE === 'production';
const mode = isProd ? 'production' : 'development';

// Load the appropriate environment variables based on mode
dotenv.config({ path: `.env.${mode}` });

console.log(`Running in ${mode} mode, using .env.${mode}`);

// https://vite.dev/config/
export default defineConfig(({ mode: configMode }) => {
  // configMode will be set by the --mode flag or default to development
  const isProduction = configMode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.VITE_PORT || '5173'),    
    },
    // Additional production settings if needed
    ...(isProduction && {
      build: {
        // Production build settings
        minify: 'terser',
        sourcemap: false,
      }
    })
  }
})
