// Teste de fumaça (T2-07): confere que a API e a tela sobem juntas e que a
// tela inicial mostra os dados do seed. Os 4 cenários do TP2 vêm depois.
describe("Fumaça", () => {
  it("abre a tela inicial com a república e os moradores do seed", () => {
    cy.visit("/");

    cy.contains("República Demo");
    cy.contains("Quem é você?");
    for (const nome of ["Ana", "Bruno", "Carla"]) {
      cy.contains("button", nome);
    }
  });
});
