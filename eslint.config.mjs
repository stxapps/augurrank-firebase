import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import stylistic from "@stylistic/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals", /*"next/typescript", "plugin:tailwindcss/recommended",*/
    ],
  }),
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "prefer-const": [1],
      "@stylistic/semi": [1, "always"],
      "@stylistic/no-extra-semi": [1],
      "@stylistic/comma-dangle": [1, "always-multiline"],
      "@stylistic/quotes": [
        1, "single", { "avoidEscape": true, "allowTemplateLiterals": true }
      ],
      "@stylistic/jsx-quotes": [1, "prefer-double"],
      "react/no-unescaped-entities": [0]
    },
  },
];

export default eslintConfig;
