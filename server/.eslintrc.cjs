module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked'
  ],
  plugins: ['@typescript-eslint'],
  env: {
    es2023: true,
    node: true
  },
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false
        }
      }
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type']
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  }
};
