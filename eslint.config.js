import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "next-env.d.ts"],
  },
  {
    plugins: {
      "@next/next": nextPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "warn",
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);