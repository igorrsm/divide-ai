import { execSync } from "node:child_process";
import { defineConfig } from "cypress";

// Testes E2E: o `npm run e2e` sobe a API e a tela com o banco e2e.db (recriado
// pelo seed a cada execução) antes de chamar o Cypress.
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "e2e/**/*.cy.ts",
    supportFile: false,
    fixturesFolder: false,
    screenshotsFolder: "e2e/prints",
    downloadsFolder: "e2e/downloads",
    video: false,
    setupNodeEvents(on) {
      on("task", {
        // Volta o e2e.db ao seed com a API no ar: o teste que muda os dados
        // chama cy.task("voltaAoSeed") no beforeEach, para não depender da
        // ordem dos arquivos nem de ter rodado antes (FIRST).
        voltaAoSeed() {
          execSync("npx cross-env DATABASE_URL=file:./e2e.db prisma db seed", { stdio: "pipe" });
          return null;
        },
      });
    },
  },
});
