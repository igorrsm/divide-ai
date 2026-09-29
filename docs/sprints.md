# Registro dos sprints

Resultado de cada sprint e mudanças de planejamento. O quadro e os critérios de
aceitação ficam no Notion; aqui fica o histórico, com datas tiradas dos PRs e das
issues do GitHub.

## Sprint 0 · 12–15/09

**Meta:** o esqueleto sobe e roda ponta a ponta na máquina dos quatro.

Nenhum PR foi mesclado dentro da janela do sprint. As tarefas foram concluídas
depois:

| Código | Tarefa | PR | Mesclado em |
|---|---|---|---|
| T2 | Schema Prisma e primeira migration | #1 | 17/09 |
| T7 | Definition of Done | #2 | 21/09 |
| T5, T6 | Proteção da `main`, template de PR e `IA.md` | #3 | 21/09 |
| T1 | Esqueleto (Express, React + Vite, TypeScript) | #5 | 22/09 |
| T3 | Healthcheck ponta a ponta | #6 | 22/09 |
| T8 | Issues do Sprint 1 abertas no GitHub | — | 22/09 |
| T4 | CI no GitHub Actions | — | pendente |

## Sprint 1 · 16–22/09

**Meta:** dá para cadastrar a república, os moradores e lançar uma despesa rateada
igualmente.

**Resultado: 0 de 13 pontos entregues.** Nenhuma das seis histórias começou, porque
todas dependiam do esqueleto e do healthcheck, mesclados no último dia do sprint.

| Código | História | Responsável | Pontos |
|---|---|---|---|
| A1 | Criar república | Eduardo | 2 |
| A2 | Adicionar morador | Eduardo | 2 |
| A3 | Escolher qual morador eu sou | Thalita | 1 |
| B1 | Lançar despesa | Lucas | 3 |
| B2 | Dividir a despesa igualmente | Lucas | 3 |
| B3 | Ver a lista de despesas | Thalita | 2 |

## Dificuldades para começar a programar

- **Agenda do time.** A disponibilidade dos integrantes no Sprint 0 foi menor que a
  planejada, e o esqueleto (T1) não saiu na janela de 12–15/09.
- **Dependência em cadeia.** O T1 travava o T3, e os dois travavam todas as histórias
  do Sprint 1. Sem servidor e sem front ligados, nenhuma história podia começar.
- **Repasse do gargalo.** Em 21/09 o T1 passou do Eduardo para o Igor, para destravar
  a cadeia. O T1 e o T3 foram mesclados em 22/09.
- **Ambiente de desenvolvimento.** Ao começar o código apareceram problemas de
  instalação: Node ausente no WSL, Node antigo à frente do nvm no PATH do Windows e
  versão do TypeScript incompatível com o `typescript-eslint`. Estão registrados no
  `IA.md` (entradas de 21 e 22/09). Não foram a causa do atraso, mas consumiram parte
  dos dois últimos dias.

## Replanejamento do Sprint 2 · 23–29/09

Decidido em 22/09: as seis histórias do Sprint 1 passam para o Sprint 2.

- **Pontos:** 17 planejados + 13 repassados = **30**.
- **Meta mantida:** dá para saber quem deve a quem e registrar o acerto.
- **Ordem de corte se atrasar:**
  1. **C1** (marcar despesa recorrente), porque não é necessária para a meta;
  2. **B4** (escolher participantes), por último, porque é o diferencial da proposta.
- **Velocidade do Sprint 1: 0.** O número entra na retrospectiva e na calibragem dos
  pontos. Os 30 pontos do Sprint 2 estão acima da meta de 17; o corte acima é o que
  protege a meta.

## Sprint 2 · 23–29/09

**Meta:** dá para saber quem deve a quem e registrar o acerto. **Atingida:** D1,
D2 e D3 foram mescladas até 28/09.

**Resultado: 30 de 30 pontos planejados entregues.** A ordem de corte não precisou
ser usada.

| Código | História | Entregue por | Pontos | PR | Mesclado em |
|---|---|---|---|---|---|
| B1 | Lançar despesa | Lucas | 3 | #15 | 26/09 |
| A3 | Escolher qual morador eu sou | Thalita | 1 | #23 | 27/09 |
| D1 | Saldo de cada morador | Igor | 5 | #25 | 27/09 |
| D2 | Painel de saldos | Thalita | 3 | #31 | 27/09 |
| B2 | Dividir a despesa igualmente | Lucas | 3 | #34 | 27/09 |
| B3 | Lista de despesas e detalhe | Thalita | 2 | #36 | 27/09 |
| B4 | Escolher quem participa | Lucas | 3 | #37 | 28/09 |
| A1 | Criar república | Eduardo | 2 | #49 | 28/09 |
| D3 | Registrar pagamento | Thalita | 3 | #51 | 28/09 |
| C1 | Marcar despesa recorrente | Thalita | 3 | #53 | 28/09 |
| A2 | Adicionar morador | Thalita | 2 | #52 | 28/09 |

A D3, a A2 e a C1 eram do Eduardo, que não conseguiu fazê-las; a Thalita assumiu.

### Puxadas durante o sprint

No Notion, a propriedade "Entrada" separa o planejado do que foi puxado depois, para
a velocidade planejada não ficar inflada.

- **Primeira leva (14 pontos, mesclada):** a Thalita tinha terminado as atividades
  dela e puxou B5 (#47), B6 (#40), E1 (#42) e E2 (#44), todas mescladas em 28/09. A
  T14 (layout base, tarefa técnica) foi criada em 26/09 e mesclada no #17 em 27/09.
- **Segunda leva (23 pontos, em revisão em 29/09):** o time decidiu fechar o backlog
  restante. O Igor implementou com a IA, uma história por vez, e a Thalita revisa:
  D5 (#59), C2 (#60), A4 (#61), A5 (#62) e E3 (#63). Os PRs estão empilhados e entram
  nessa ordem.
- **Fora do TP1:** B7 (anexar comprovante), porque upload está fora do escopo.

### Ainda no sprint

- T9 a T13 (diagramas, slides de IA, retrospectiva e ensaio da demo), para 29/09.
- A T4 (CI), pendente desde o Sprint 0, entrou no #14 em 23/09 e passou a rodar os
  testes no #18 em 27/09.
