import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }],
      'react/jsx-no-duplicate-props': ['error'],
      'react/jsx-key': ['error'],
      'react/jsx-no-undef': ['error'],
      'react/no-unknown-property': ['error'],
      'jsx-a11y/aria-props': ['error'],
      'jsx-a11y/aria-proptypes': ['error'],
      'jsx-a11y/role-supports-aria-props': ['error'],
      'jsx-a11y/aria-unsupported-elements': ['error'],
      'jsx-a11y/aria-role': ['error'],
      'jsx-a11y/aria-activedescendant-has-tabindex': ['error'],
      'jsx-a11y/no-noninteractive-element-interactions': ['off'],
      'jsx-a11y/no-noninteractive-tabindex': ['error'],
      'jsx-a11y/interactive-supports-focus': ['error'],
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }),
]

export default eslintConfig 