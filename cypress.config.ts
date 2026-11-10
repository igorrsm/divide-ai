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
  },
});
