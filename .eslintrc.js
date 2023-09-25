module.exports = {
  extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:svelte/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
      project: 'tsconfig.json',
      extraFileExtensions: ['.svelte'],
      sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/quotes': [
          'error',
          'single',
          { avoidEscape: true, allowTemplateLiterals: false }
      ],
      curly: ['error', 'all'],
      eqeqeq: 'error',
      'prefer-arrow-callback': 'error'
  },
  overrides: [
      {
          files: ['**/*.svelte'],
          parser: 'svelte-eslint-parser',
          parserOptions: {
            parser: '@typescript-eslint/parser'
      }
        //   processor: 'svelte-eslint-parser'
      }
  ]
};
