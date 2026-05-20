import path from 'path'
// eslint-disable-next-line import/no-unresolved
import react from '@vitejs/plugin-react'
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'build',
    },
    plugins: [
        react({
            babel: {
                plugins: ['styled-jsx/babel'],
            },
        }),
    ],
    resolve: {
        alias: [
            {
                // Allow moment.js to be used as an ESM module
                find: /^moment$/,
                replacement: path.resolve(import.meta.dirname, './node_modules/moment/moment.js'),
            },
            {
                // Vite 8's CJS interop returns the namespace object for react-moment's default,
                // so all `import Moment from 'react-moment'` callsites get an unrenderable value.
                // Route them through a shim that unwraps the default export.
                find: /^react-moment$/,
                replacement: path.resolve(import.meta.dirname, './src/react-moment-shim.ts'),
            },
        ],
    },
})
