const eslint = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      'lint-staged.config.js',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: eslint.configs.recommended.rules,
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        NodeModule: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'no-unused-vars': 'off',
    },
  },
];