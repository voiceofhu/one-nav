import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore build outputs and vendor dirs
  {
    ignores: [
      "**/.next/**",
      "dist/**",
      "dist-ext/**",
      "node_modules/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
];

export default eslintConfig;
