import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/dist", "src/generated", "prisma/migrations"]),
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [tseslint.configs.recommended],
  },
]);
