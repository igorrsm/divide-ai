// E2E-2: lançar uma despesa só para Bruno e Carla, com a sobra de 1 centavo.
// Seed: Ana (1), Bruno (2) e Carla (3).

import { naTela } from "./apoio";

describe("Lançar despesa", () => {
  // O teste muda os saldos da República Demo: volta ao seed antes, para não
  // depender da ordem dos arquivos nem de ter rodado antes.
  beforeEach(() => {
    cy.task("voltaAoSeed");
  });

  it("Ana paga R$ 100,01 só para Bruno e Carla: Bruno R$ 50,01 e Carla R$ 50,00", () => {
    cy.visit("/despesas/nova");

    cy.get('[data-cy="descricao"]').type("Pizza");
    cy.get('[data-cy="valor"]').type("100,01");
    cy.get('[data-cy="quem-pagou"] [data-cy="morador-1"]').click();
    // Quem pagou fica fora do rateio: desmarca a Ana.
    cy.get('[data-cy="participante-1"]').uncheck();
    cy.get('[data-cy="participante-2"]').should("be.checked");
    cy.get('[data-cy="participante-3"]').should("be.checked");
    cy.get('[data-cy="divisao-IGUAL"]').should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="recorrente-nao"]').check();
    cy.get('[data-cy="lancar-despesa"]').click();

    cy.get('[data-cy="aviso-despesa"]').should("have.text", 'Despesa "Pizza" lançada.');
    // 10001 centavos entre dois dá 5000 e sobra 1. Quem pagou não participa,
    // então a sobra vai para o participante de menor id: o Bruno.
    cy.get('[data-cy="rateio"] li').should("have.length", 2);
    cy.get('[data-cy="rateio-2"]').invoke("text").should("match", naTela("BrunoR$ 50,01"));
    cy.get('[data-cy="rateio-3"]').invoke("text").should("match", naTela("CarlaR$ 50,00"));
    cy.get('[data-cy="rateio-1"]').should("not.exist");
  });
});
