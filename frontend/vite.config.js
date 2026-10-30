import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The backend does not send CORS headers, so the dev server forwards these
// prefixes to Spring Boot to keep browser calls same-origin.
const BACKEND_URL = 'http://localhost:8080'
const BACKEND_PREFIXES = ['/api', '/employe', '/pointage', '/soldeConge', '/demandeConge']

// `/employe` is both an API prefix and an application route: page navigations
// must reach the SPA instead of the backend.
function bypassForPageNavigation(req) {
  if ((req.headers.accept || '').includes('text/html')) return req.url
  return undefined
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: Object.fromEntries(
      BACKEND_PREFIXES.map((prefix) => [
        prefix,
        { target: BACKEND_URL, changeOrigin: true, bypass: bypassForPageNavigation },
      ]),
    ),
  },
})
