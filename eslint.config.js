import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from '@eslint-react/eslint-plugin'
import globals from 'globals'

export default defineConfig(
  {
    ignores: ['**/.next/**', 'node_modules/**', '**/dist/**', '**/next-env.d.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'unused-imports': unusedImportsPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    files: ['apps/web-app/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      ...reactPlugin.configs['recommended-typescript'].plugins,
      ...reactPlugin.configs.jsx.plugins,
    },
    settings: reactPlugin.configs['recommended-typescript'].settings,
    rules: {
      ...reactPlugin.configs['recommended-typescript'].rules,
      ...reactPlugin.configs.jsx.rules,
    },
  },
)
