import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Use the current directory for environment variables
const envDir = path.resolve(__dirname)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable React DevTools in development
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@providers': path.resolve(__dirname, './src/providers'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  // Development server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
    // Enable CORS for development
    cors: true,
    // HMR configuration
    hmr: {
      overlay: true, // Show error overlay
    },
  },
  // Build configuration for better debugging
  build: {
    sourcemap: true, // Enable source maps for debugging
    // Generate more readable output
    minify: 'esbuild',
    target: 'esnext',
    // Better error messages
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Enable optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Explicitly set envDir to use the parent directory's .env file
  envDir: envDir,
  // Define global constants
  define: {
    __DEV__: JSON.stringify(true),
  },
  // Enable esbuild for better performance
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}))
