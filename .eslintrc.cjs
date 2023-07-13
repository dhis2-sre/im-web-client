/* eslint-env node */

module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        /* NOTE:
         * This used to be a CRA app when switching to Vite these two rules
         * were included in the ESLint config from their template. The rules
         * might be good to enable, but also would require some significant
         * changes to the codebase. Consider enabling them later and fixing
         * lint errors case by case. */

        // 'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'react-app',
        'react-app/jest',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
    },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-non-null-assertion': 'off',
    },
}
