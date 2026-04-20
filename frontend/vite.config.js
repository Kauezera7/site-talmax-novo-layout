import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const normalizeBasePath = (value = '/') => {
  const trimmed = String(value || '/').trim()

  if (!trimmed || trimmed === '/') {
    return '/'
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')

  return {
    base: normalizeBasePath(env.VITE_PUBLIC_BASE_PATH || '/'),
    plugins: [react()],
  }
})
