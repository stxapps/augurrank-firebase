import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

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
      "eslint:recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "google",
      "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: ["tsconfig.json"],
      sourceType: "module",
    },
    ignorePatterns: [
      "/lib/**/*", // Ignore built files.
      "/generated/**/*", // Ignore generated files.
      "eslint.config.mjs",
    ],
    plugins: [
      "@typescript-eslint",
      "import",
    ],
  }),
  {
    files: ["**/*.js", "**/*.ts"],
    rules: {
      "quotes": ["error", "single"],
      "indent": ["error", 2],
      "import/no-unresolved": 0,
      "max-len": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "object-curly-spacing": 0,
      "one-var": 0,
      "no-prototype-builtins": 0,
      "arrow-parens": 0,
      "no-invalid-this": 0,
      "@typescript-eslint/no-this-alias": 0,
      "require-jsdoc": 0,
      "@typescript-eslint/no-unused-vars": 0,
    },
  },
];

export default eslintConfig;
