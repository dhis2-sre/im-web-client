import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    react({
      babel: {
        plugins: ['styled-jsx/babel']
      }
    })
  ],
  resolve: {
    alias: [
      {
        // Allow moment.js to be used as an ESM module
        find: /^moment$/,
        replacement: path.resolve(__dirname, "./node_modules/moment/moment.js"),
      },
    ],
  },
})
