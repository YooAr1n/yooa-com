module.exports = {
  root: true,
  env: {
    node: true,
    "es2020": true,
    "amd": true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "vue/multi-word-component-names": "off",
    "no-mixed-spaces-and-tabs": 0,
    "no-unused-vars": 0,
    "no-redeclare": "off",
    "no-undef": "off",
    "no-empty": "off",
    "vue/no-parsing-error": ["error", {
      "x-invalid-end-tag": false,
    }]
  }
}
