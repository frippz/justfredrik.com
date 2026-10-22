import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      '**/build/',
      '**/.svelte-kit/',
      '**/test-results/',
      '**/playwright-report/',
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      // The site has no base path, and links to routes not built yet are fine
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
  {
    files: ['apps/web/src/**'],
    rules: {
      // All content goes through the content source, never its implementations
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['#lib/server/content/*', '**/server/content/*'],
              message: 'Import content through #lib/server/content.',
            },
          ],
        },
      ],
    },
  },
)
