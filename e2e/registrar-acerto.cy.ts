// E2E-4: registrar o acerto do Bruno pela sugestão de "Como acertar".
// Parte do seed: Ana +R$ 1.600,00, Bruno −R$ 725,00 e Carla −R$ 875,00.

import { naTela } from "./apoio";

function saldo(moradorId: number) {
  return cy.get(`[data-cy="saldo-${moradorId}"] [data-cy="saldo-valor"]`).invoke("text");
}

describe("Registrar acerto", () => {
  // O teste muda os saldos da República Demo: volta ao seed antes, para não
  // depender da ordem dos arquivos nem de ter rodado antes.
  beforeEach(() => {
    cy.task("voltaAoSeed");
  });

  it("registra pela sugestão o acerto do Bruno, que fica quitado", () => {
    cy.visit("/");
    cy.get('[data-cy="menu-saldos"]').click();

    saldo(2).should("match", naTela("− R$ 725,00a pagar"));
    cy.get('[data-cy="acerto"]').should("not.exist");
    cy.get('[data-cy="sugestao-2-1"]').invoke("text").should("match", naTela("Bruno paga R$ 725,00 para Ana"));
    cy.get('[data-cy="sugestao-2-1"] [data-cy="registrar-sugestao"]').click();

    // O formulário abre preenchido com a sugestão.
    cy.location("pathname").should("eq", "/saldos/pagamento");
    cy.get('[data-cy="quem-pagou"] [data-cy="morador-2"]').should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="para-quem"] [data-cy="morador-1"]').should("have.attr", "aria-pressed", "true");
    cy.get('[data-cy="valor"]').should("have.value", "725,00");
    cy.get('[data-cy="salvar-pagamento"]').click();

    cy.location("pathname").should("eq", "/saldos");
    cy.get('[data-cy="aviso-saldos"]').should("have.text", "Pagamento registrado.");
    // Bruno quitado, Ana recebe menos e Carla não muda: a soma segue zero.
    saldo(2).should("match", naTela("R$ 0,00quitado"));
    saldo(1).should("match", naTela("+ R$ 875,00a receber"));
    saldo(3).should("match", naTela("− R$ 875,00a pagar"));

    cy.get('[data-cy="lista-acertos"] [data-cy="acerto"]').should("have.length", 1);
    cy.get('[data-cy="acerto"]').invoke("text").should("match", naTela("Bruno pagou para Ana"))
      .and("match", /\d{2}\/\d{2}\/\d{4}/)
      .and("match", naTela("R$ 725,00"));
    // Da sugestão, sobra só a Carla.
    cy.get('[data-cy="sugestao-2-1"]').should("not.exist");
    cy.get('[data-cy="sugestao-3-1"]').invoke("text").should("match", naTela("Carla paga R$ 875,00 para Ana"));
  });
});
