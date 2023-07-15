module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "project": "./tsconfig.eslint.json"
  },
  "root": true,
  "env": {
    "node": true
  },
  "plugins": [
    "@typescript-eslint",
  ],
  "extends": [
    "eslint:recommended",
  ],
  "ignorePatterns": [
    "node_modules",
    "dist",
    "coverage",
    "lint-staged.config.js"
  ],
  "rules": {
  }
}