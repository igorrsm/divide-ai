# Atributos `data-cy` para os testes E2E

Os testes E2E acham os elementos pelo atributo `data-cy`, e não pelo texto ou pelo
CSS, para não quebrarem quando um texto ou uma classe muda. No Cypress:
`cy.get('[data-cy="lancar-despesa"]')`. Os ids são os do seed: Ana = 1, Bruno = 2,
Carla = 3.

| Tela | `data-cy` |
|---|---|
| Cabeçalho e menu | `republica-atual`, `seletor-morador` com `morador-{id}`, `menu-despesas`, `menu-saldos`, `menu-moradores` |
| Início | `atalho-despesas`, `atalho-saldos`, `atalho-moradores`, `atalho-republicas-nova` |
| Criar república | `nome-republica`, `nome-organizador`, `email-organizador`, `criar-republica`, `aviso-erro` |
| Moradores | `lista-moradores` com uma linha `morador` por pessoa, `nome-morador`, `email-morador`, `adicionar-morador`, `aviso-morador` |
| Nova despesa e edição | `descricao`, `valor`, `data`, `quem-pagou` com `morador-{id}`, `divisao-IGUAL`, `divisao-VALOR`, `divisao-PERCENTUAL`, `participante-{id}`, `recorrente-sim`, `recorrente-nao`, `lancar-despesa`, `aviso-despesa`, `rateio` com `rateio-{id}` |
| Saldos | `aviso-saldos`, `abrir-pagamento`, `saldo-{id}` com `saldo-valor` dentro, `sugestao-{pagador}-{recebedor}` com `registrar-sugestao`, `lista-acertos` com uma linha `acerto` por acerto |
| Registrar pagamento | `quem-pagou` e `para-quem`, cada um com `morador-{id}`, `valor`, `data`, `salvar-pagamento` |

Os grupos de pílulas e o campo de data repetem o rótulo: `morador-2` aparece em
`seletor-morador` e em `quem-pagou`, então escreva o grupo antes:
`cy.get('[data-cy="quem-pagou"] [data-cy="morador-1"]')`.

Elemento novo usado por um teste E2E ganha `data-cy` e entra nesta tabela.
