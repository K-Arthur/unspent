module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    'supabase/.temp/',
    'supabase/supabase/.temp/',
  ],
};
