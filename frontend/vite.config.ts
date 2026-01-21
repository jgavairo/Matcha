import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@app-types": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@forms": path.resolve(__dirname, "./src/components/forms"),
      "@layout": path.resolve(__dirname, "./src/components/layout"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 3000,
    https: (fs.existsSync(path.resolve(__dirname, 'certs/key.pem')) && fs.existsSync(path.resolve(__dirname, 'certs/cert.pem'))) ? {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
    } : undefined,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'https://backend:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'https://backend:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
            proxy.on("error", () => {});
        },
      }
    }
  }
})
