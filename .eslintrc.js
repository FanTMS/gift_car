module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'off'
  }
} 