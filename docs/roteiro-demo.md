# Roteiro da apresentação do TP1 (30/09, 14:55)

São 20 minutos: demo (10), slides de uso de IA (5), histórias entregues (1) e a
participação de cada um (1 por pessoa). Os quatro precisam estar presentes. Chegar 10
minutos antes, com o laptop pronto.

## Antes de começar

```bash
git pull
npx prisma migrate dev && npx prisma generate
npx prisma db seed          # volta ao estado inicial: Ana, Bruno e Carla
npm run dev                 # deixar rodando; abrir http://localhost:5173
```

Os slides ficam abertos em outra aba. Se a demo falhar, o plano B são screenshots das
telas principais, tirados no ensaio.

Saldos depois do seed: Ana tem R$ 1.600,00 a receber, Bruno deve R$ 725,00 e Carla
deve R$ 875,00.

## Demo (10 min)

| Tempo | Tela | O que fazer e o que mostrar |
|---|---|---|
| 1 min | Início | Em "Quem é você?", escolher **Ana** (organizadora). O cabeçalho mostra a República Demo |
| 2 min | Despesas → "Lançar despesa" | "Pizza", R$ 100,01, Ana pagou, só **Bruno e Carla** participam, "Por igual". No detalhe: Bruno R$ 50,01 e Carla R$ 50,00. **A sobra de 1 centavo vai para o participante de menor id, porque quem pagou não participa** |
| 1 min | Despesas | Lista com os filtros: período no calendário do site e moradores em pílulas |
| 2 min | Saldos | Ana tem R$ 1.700,01 a receber, Bruno deve R$ 775,01 e Carla R$ 925,00. **A soma é zero.** Em "Como acertar", clicar em "Registrar" na linha do Bruno: o pagamento abre preenchido. Salvar: Bruno fica quitado e o acerto aparece na lista |
| 2 min | Despesas → "Ver extrato do mês" | Em setembro, "Gerar as recorrentes": o aluguel de 05/09 entra. Clicar de novo mostra "Nada a gerar neste mês." Mostrar "A pagar" e "Pago" por morador e "⬇ Exportar CSV" |
| 2 min | Moradores | "Gerar link de convite". Abrir o link em outra aba e cadastrar um morador novo, que aparece na lista. Marcar a saída dele: some de "Quem é você?", mas o histórico fica |

Se sobrar tempo: editar a pizza (só quem pagou pode editar ou excluir) ou criar uma
república nova.

## Histórias entregues (1 min)

As 8 histórias do README e a extensão foram entregues. As diferenças em relação ao
texto original estão na tabela "Situação das histórias ao fim do TP1" do README:

- a despesa não tem categoria;
- o convite é por link, sem envio de e-mail;
- as recorrentes são geradas por botão, sem agendador.

## Participação (1 min cada)

Commits na `main` em 29/09, sem contar os merges. São 277 no total.

| Membro | Commits | Cartões |
|---|---|---|
| Thalita | ~153 (55%) | A2, A3, B3, B5, B6, C1, D2, D3, E1, E2 e o layout base (T14) |
| Igor | ~84 (30%) | D1, D5, C2, A4, A5, E3, CI, template de PR, `IA.md`, diagramas UML |
| Lucas | ~31 (11%) | B1, B2, B4 e revisões de PR |
| Eduardo | ~9 (3%) | A1 |

O enunciado pede no mínimo 15% dos commits por membro, e o Lucas e o Eduardo ficaram
abaixo disso. Isso deve ser dito com clareza, sem esconder:

- a Thalita terminou os cartões dela e puxou vários outros do backlog;
- o Eduardo teve problemas de configuração no começo e fez a parte dele dentro do
  possível.

Os números finais saem de `git shortlog -sn --no-merges main` no dia.
