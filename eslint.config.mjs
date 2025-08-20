// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';
import nocommentedcode from 'eslint-plugin-no-commented-code';

// Flat config combining JavaScript and TypeScript recommended rules,
// plus project-specific ignores and rules.
export default [
  // Global ignore patterns
  {
    ignores: [
      '**/temp.js',
      'build/',
      'node_modules/',
      'temp/**',
      'library/**',
      'profiles/**',
      'settings/**',
      '**/*.d.ts',
      'extensions*',
    ],
  },

  // ESLint core recommended rules for JavaScript
  eslint.configs.recommended,

  // TypeScript-ESLint recommended presets
  ...tseslint.configs.recommended,

  {
    plugins: {
      '@stylistic': stylistic,
      unicorn,
      nocommentedcode,
    },
    rules: {
      '@stylistic/indent': ['error', 4],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'any', prev: 'directive', next: 'directive' },
        // Require a blank line after a closing '}' of blocks and block-like statements
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      '@stylistic/lines-between-class-members': ['error', 'always', { 'exceptAfterOverload': false }],
      '@stylistic/no-multiple-empty-lines': ['error',{ 'max': 1, 'maxEOF': 1, 'maxBOF': 1 }],
      // Semicolons required
      '@stylistic/semi': ['error', 'always'],

      'nocommentedcode/no-commented-code': 'error',

      // Braces and spacing rules to keep "{" on same line and spaces around keywords/blocks
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/spaced-comment': ['error', 'always'],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/switch-colon-spacing': ['error', { after: true, before: false }],

      // Equality and control flow
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      // Object/array creation preferences
      'no-new-object': 'error',
      'no-array-constructor': 'error',
      'object-shorthand': ['error', 'always'],
      // Disallow unnecessary extra braces (including inside switch/case)
      'no-lone-blocks': 'error',
      // Require braces only when needed for lexical declarations in cases
      'no-case-declarations': 'error',

      // Strings: forbid backslash multi-line, do not force template literals
      'no-multi-str': 'error',
      'prefer-template': 'off',

      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Default for variables, functions, parameters, properties
        {
          selector: 'variableLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Explicitly allow UPPER_CASE for exported constants
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['UPPER_CASE'],
        },
        // Types, classes, enums, interfaces in PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Enum members typically UPPER_CASE
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'caughtErrors': 'all',
          'caughtErrorsIgnorePattern': '^_',
          'destructuredArrayIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
          'ignoreRestSiblings': true,
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          'default': [
            // Index signature
            'signature',
            'call-signature',

            // Fields
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            '#private-static-field',

            'public-decorated-field',
            'protected-decorated-field',
            'private-decorated-field',

            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            '#private-instance-field',

            'public-abstract-field',
            'protected-abstract-field',

            'public-field',
            'protected-field',
            'private-field',
            '#private-field',

            'static-field',
            'instance-field',
            'abstract-field',

            'decorated-field',

            'field',

            // Static initialization
            'static-initialization',

            // Constructors
            'public-constructor',
            'protected-constructor',
            'private-constructor',

            'constructor',

            // Accessors
            'public-static-accessor',
            'protected-static-accessor',
            'private-static-accessor',
            '#private-static-accessor',

            'public-decorated-accessor',
            'protected-decorated-accessor',
            'private-decorated-accessor',

            'public-instance-accessor',
            'protected-instance-accessor',
            'private-instance-accessor',
            '#private-instance-accessor',

            'public-abstract-accessor',
            'protected-abstract-accessor',

            'public-accessor',
            'protected-accessor',
            'private-accessor',
            '#private-accessor',

            'static-accessor',
            'instance-accessor',
            'abstract-accessor',

            'decorated-accessor',

            'accessor',

            // Getters
            [
              'public-static-get',
              'protected-static-get',
              'private-static-get',
              '#private-static-get',

              'public-decorated-get',
              'protected-decorated-get',
              'private-decorated-get',

              'public-instance-get',
              'protected-instance-get',
              'private-instance-get',
              '#private-instance-get',

              'public-abstract-get',
              'protected-abstract-get',

              'public-get',
              'protected-get',
              'private-get',
              '#private-get',

              'static-get',
              'instance-get',
              'abstract-get',

              'decorated-get',

              'get',

              // Setters
              'public-static-set',
              'protected-static-set',
              'private-static-set',
              '#private-static-set',

              'public-decorated-set',
              'protected-decorated-set',
              'private-decorated-set',

              'public-instance-set',
              'protected-instance-set',
              'private-instance-set',
              '#private-instance-set',

              'public-abstract-set',
              'protected-abstract-set',

              'public-set',
              'protected-set',
              'private-set',
              '#private-set',

              'static-set',
              'instance-set',
              'abstract-set',

              'decorated-set',

              'set',
            ],

            // Methods
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            '#private-static-method',

            'public-decorated-method',
            'protected-decorated-method',
            'private-decorated-method',

            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
            '#private-instance-method',

            'public-abstract-method',
            'protected-abstract-method',

            'public-method',
            'protected-method',
            'private-method',
            '#private-method',

            'static-method',
            'instance-method',
            'abstract-method',

            'decorated-method',

            'method',
          ],
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': 'error',
    },
  },

  // Enforce PascalCase filenames for TypeScript source files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'pascalCase' }],
    },
  },

  // Override: use 2-space indent for this config file itself
  {
    files: ['eslint.config.mjs'],
    rules: {
      '@stylistic/indent': ['error', 2],
    },
  },
];
