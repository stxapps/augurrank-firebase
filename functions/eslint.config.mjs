import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.config({
    root: true,
    env: {
      es6: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'google',
      'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['tsconfig.json', 'tsconfig.dev.json'],
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
      'import',
    ],
  }),
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: [
      '/lib/**/*', // Ignore built files.
      '/generated/**/*', // Ignore generated files.
    ],
    rules: {
      'quotes': ['error', 'single'],
      'import/no-unresolved': 0,
      'indent': ['error', 2],
      'max-len': 0,
      '@typescript-eslint/no-explicit-any': 0,
      'object-curly-spacing': 0,
      'one-var': 0,
      'no-prototype-builtins': 0,
      'arrow-parens': 0,
    },
  },
];

export default eslintConfig;
