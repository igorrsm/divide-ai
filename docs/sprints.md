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
