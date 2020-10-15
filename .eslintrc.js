module.exports = {
  env: {
    node: true,
    commonjs: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-var": "error",
    "prefer-const": "error",
  },
}
