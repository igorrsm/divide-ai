// E2E-1: criar uma república pela tela e adicionar um morador.
// O e-mail é único no banco inteiro e a casa criada fica no e2e.db até o
// próximo seed, então os e-mails levam um número que muda a cada execução:
// assim o teste passa de novo na janela do Cypress sem recriar o banco.
describe("Criar república e adicionar morador", () => {
  it("cria a casa, vira o organizador e adiciona um morador", () => {
    const marca = Date.now();
    const casa = `República E2E ${marca}`;

    cy.visit("/");
    cy.get('[data-cy="atalho-republicas-nova"]').click();

    cy.get('[data-cy="nome-republica"]').type(casa);
    cy.get('[data-cy="nome-organizador"]').type("Duda");
    cy.get('[data-cy="email-organizador"]').type(`duda.${marca}@e2e.exemplo`);
    cy.get('[data-cy="criar-republica"]').click();

    // Volta ao início com a casa nova ativa e a Duda escolhida.
    cy.location("pathname").should("eq", "/");
    cy.get('[data-cy="republica-atual"]').should("have.text", casa);
    cy.get('[data-cy="seletor-morador"]')
      .contains("button", "Duda")
      .should("have.attr", "aria-pressed", "true");

    cy.get('[data-cy="menu-moradores"]').click();
    cy.get('[data-cy="nome-morador"]').type("Eli");
    cy.get('[data-cy="email-morador"]').type(`eli.${marca}@e2e.exemplo`);
    cy.get('[data-cy="adicionar-morador"]').click();

    cy.get('[data-cy="aviso-morador"]').should("contain", "Eli entrou na lista de moradores.");
    cy.get('[data-cy="lista-moradores"] [data-cy="morador"]').should("have.length", 2);
    cy.get('[data-cy="lista-moradores"]').should("contain", "Duda").and("contain", "Eli");
    // O "Quem é você?" também passa a oferecer o morador novo.
    cy.get('[data-cy="seletor-morador"]').contains("button", "Eli");
  });
});
