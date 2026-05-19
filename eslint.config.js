import js from '@eslint/js'
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import preferArrowPlugin from 'eslint-plugin-prefer-arrow'
import globals from 'globals'

export default tseslint.config(
    { ignores: ['dist/**', 'src/types/generated/**'] },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            ...fixupConfigRules(reactPlugin.configs.flat.recommended),
            reactHooksPlugin.configs.flat['recommended-latest'],
            importPlugin.flatConfigs.recommended,
            prettierPluginRecommended,
        ],
        plugins: {
            'prefer-arrow': preferArrowPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.es2020,
            },
            parserOptions: {
                ecmaVersion: 2018,
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: {
            'react': { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'max-params': ['error', { max: 3 }],
            'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
            'no-mixed-spaces-and-tabs': ['error'],
            'import/order': [
                'error',
                {
                    'newlines-between': 'never',
                    'alphabetize': { order: 'asc', caseInsensitive: true },
                },
            ],
            'curly': ['error'],
            'import/extensions': ['error', 'ignorePackages', { '': 'never' }],
            'preserve-caught-error': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/preserve-caught-error': 'off',
            'react/sort-prop-types': [
                'error',
                {
                    requiredFirst: true,
                    sortShapeProp: true,
                    callbacksLast: true,
                },
            ],
            'react/no-unused-prop-types': 'error',
            'prefer-arrow/prefer-arrow-functions': [
                'error',
                {
                    disallowPrototype: true,
                    singleReturnOnly: false,
                    classPropertiesAllowed: false,
                },
            ],
            'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
            'func-style': ['error', 'expression', { allowArrowFunctions: true }],
        },
    }
)
