import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const sourceFiles = ["**/*.{ts,tsx}"];

export default tseslint.config(
  { ignores: ["node_modules/**", "dist/**", "public/**", ".expo/**"] },
  { ...js.configs.recommended, files: sourceFiles },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: sourceFiles })),
  { ...reactHooks.configs.flat.recommended, files: sourceFiles },
  {
    files: sourceFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/immutability": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-useless-assignment": "off",
    },
  },
);
