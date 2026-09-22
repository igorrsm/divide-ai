import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Repassa /api para o Express: o front e a API ficam na mesma origem
    // (porta 5173) durante o desenvolvimento, então não é preciso CORS.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
