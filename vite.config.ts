import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The GitHub Actions workflow sets VITE_BASE_PATH automatically
// (e.g. "/my-repo/"). Locally it falls back to "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})
