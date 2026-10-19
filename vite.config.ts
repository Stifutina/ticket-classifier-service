import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The third argument '' means: read ALL variables (not only VITE_ ones),
  // from .env files and from the build environment (Vercel).
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.API_URL || env.VITE_API_URL || ''

  return {
    plugins: [react()],
    // Replaces __API_URL__ in the code with this string while building.
    define: { __API_URL__: JSON.stringify(apiUrl) },
  }
})
