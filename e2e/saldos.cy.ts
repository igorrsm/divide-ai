// E2E-3: ver os saldos da casa e conferir que a soma é zero.
// Ponto de partida: o seed (Ana 1, Bruno 2 e Carla 3).
// Ana: + R$ 1.600,00 (a receber)
// Bruno: − R$ 725,00 (a pagar)
// Carla: − R$ 875,00 (a pagar)

import { naTela } from "./apoio";

function saldo(moradorId: number) {
  return cy.get(`[data-cy="saldo-${moradorId}"] [data-cy="saldo-valor"]`).invoke("text");
}

describe("Ver saldos e soma zero", () => {
  beforeEach(() => {
    cy.task("voltaAoSeed");
  });

  it("mostra os saldos corretos de cada morador e a soma fecha em zero", () => {
    cy.visit("/");
    cy.get('[data-cy="menu-saldos"]').click();
    cy.location("pathname").should("eq", "/saldos");

    // Confere os três saldos e suas situações após o seed
    saldo(1).should("match", naTela("+ R$ 1.600,00a receber"));
    saldo(2).should("match", naTela("− R$ 725,00a pagar"));
    saldo(3).should("match", naTela("− R$ 875,00a pagar"));

    // Soma zero na tela: converte os textos exibidos para centavos e confere a soma
    cy.get('[data-cy^="saldo-"] [data-cy="saldo-valor"] strong').then(($valores) => {
      const centavos = [...$valores].map((el) => {
        const texto = el.innerText.trim();
        const sinal = texto.startsWith("−") || texto.startsWith("-") ? -1 : 1;
        const limpo = texto.replace(/[^\d]/g, "");
        return sinal * Number(limpo);
      });
      const somaTela = centavos.reduce((acc, c) => acc + c, 0);
      expect(somaTela).to.eq(0);
    });

    // Soma zero na API: consulta GET /api/republicas/:id/saldos e confere saldoCentavos
    cy.request("/api/republicas/1/saldos").then((resposta) => {
      const saldos = resposta.body as Array<{ saldoCentavos: number }>;
      expect(saldos).to.have.length(3);
      const somaApi = saldos.reduce((acc, s) => acc + s.saldoCentavos, 0);
      expect(somaApi).to.eq(0);
    });
  });
});
