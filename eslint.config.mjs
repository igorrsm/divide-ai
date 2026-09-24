import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist", "src/generated", "prisma/migrations"]),
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [tseslint.configs.recommended],
    rules: {
      // O middleware de erro do Express só é reconhecido com os quatro
      // parâmetros, mesmo quando o último não é usado.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
]);
