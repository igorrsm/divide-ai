# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do projeto

Divide Aí é um sistema de despesas compartilhadas para repúblicas (projeto de faculdade, README em português). **Hoje o repositório contém apenas a camada de dados** (Prisma + SQLite): não há `src/` versionado, servidor Express, frontend React, scripts em `package.json` nem testes. O README descreve o stack planejado (React 18 + Vite no front, Express + TypeScript no back, API REST, migração futura para PostgreSQL via Docker Compose). O `npm run dev` citado no README ainda não existe.

Código, schema e mensagens de commit são em português; mantenha esse idioma e o padrão de nomes do domínio (`Republica`, `Morador`, `Despesa`, `Participacao`, `Pagamento`).

## Comandos

Node 24 (`.nvmrc`; o README pede 20+).

```bash
npm install
npx prisma migrate dev          # aplica migrations e cria o banco SQLite
npx prisma generate             # gera o client em src/generated/prisma (gitignored)
npx prisma db seed              # roda prisma/seed.ts via tsx (idempotente: limpa tudo antes)
npx prisma migrate dev --name <nome>   # após alterar schema.prisma
```

Requer um `.env` com `DATABASE_URL` (ex.: `file:./dev.db`). Não há `.env.example`. `prisma.config.ts` lê `DATABASE_URL` sem fallback, enquanto `seed.ts` cai em `file:./dev.db`.

Prisma 7: o client vem de `src/generated/prisma/client` (não de `@prisma/client`) e é instanciado com o driver adapter `@prisma/adapter-better-sqlite3` — veja `prisma/seed.ts` como exemplo. Arquivos `*.db` e `src/generated/` estão no `.gitignore`, então o client precisa ser regerado após clonar ou mudar o schema.

## Modelo de dados (`prisma/schema.prisma`)

- **Valores monetários são `Int` em centavos** (`valorCentavos`), nunca float.
- Uma `Despesa` tem um `pagadorId` e N `Participacao` (chave composta `despesaId + moradorId`), cada uma com o `valorCentavos` que aquele morador deve. O rateio já vem materializado por participante; `tipoDivisao` (`IGUAL`/`VALOR`/`PERCENTUAL`) só registra como foi calculado. Portanto, a soma das participações deve bater com o valor da despesa, e essa invariante não é garantida pelo banco — precisa ser garantida na camada de serviço.
- Saldo de um morador não é armazenado: deve ser derivado de despesas pagas, participações e `Pagamento` (acertos entre dois moradores, com relações nomeadas `PagamentosFeitos`/`PagamentosRecebidos`).
- `DespesaRecorrente` usa herança por tabela de subclasse: seu `id` é ao mesmo tempo PK e FK de `Despesa` (relação 1:1, `onDelete: Cascade`). Uma despesa é recorrente se tiver essa linha associada; `diaDoMes`, `ativa`, `dataFim` e `ultimaGeracao` controlam a geração dos lançamentos do mês, que é disparada por ação explícita do morador (história C2 do Notion), não por agendador.
- `Morador.email` é único globalmente e cada morador pertence a uma única `Republica`.

## Convenções (README)

- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Máximo de 100 linhas por commit; exceções justificadas na mensagem.
- Nenhum push direto na `main`: toda mudança entra por Pull Request revisado.

## Idioma

Responda sempre em português do Brasil. Código, comentários, mensagens de commit,
descrições de PR e documentação também em português.

## Contexto do trabalho

Projeto acadêmico: TP1 de Engenharia de Software I (UFMG, 2026/2). Equipe de quatro
(Igor, Thalita, Eduardo, Lucas). Apresentação em 28 ou 30/09/2026.

Fatia do Igor neste TP: CI, proteção de branch e template de PR, `IA.md`, história do
saldo, diagramas de classes e de sequência no README, slides de uso de IA.

O projeto é avaliado pelo processo, não só pelo produto. Histórico de commits, PRs
revisados e registro de uso de IA valem nota. Prefira sempre o caminho que deixa rastro
verificável.

## Regras de domínio (decisões já tomadas — não reabrir)

- **Dinheiro é `Int` em centavos.** Nunca `Float`, nunca `Decimal`, nunca string.
  Formatação para reais acontece só na camada de apresentação.
- **Sobra de arredondamento fica com quem pagou.** Ao dividir uma despesa em partes
  iguais, a divisão inteira pode deixar resto (R$ 100,00 entre 3 → 3333 + 3333 + 3333 =
  9999, sobra 1 centavo). Esse resto é somado à participação do pagador. A soma das
  participações tem que bater exatamente com `valorCentavos` da despesa.
- **Pagador fora do rateio: a sobra vai para um participante.** Se quem pagou não
  participa da despesa (ex.: Carla paga R$ 100,01 dividido só entre Ana e Bruno), ele
  não tem participação onde somar o resto, e **nunca se cria participação para quem não
  participa**. Nesse caso o resto inteiro (pode ser mais de 1 centavo com 3+
  participantes) vai para o participante de menor `moradorId`, critério determinístico
  que não depende da ordem da lista recebida. O resto não é distribuído entre vários.
  Decisão do Igor: fica silencioso, sem gerar estranhamento para quem lê o lançamento
  depois. Os testes de rateio devem cobrir esse caso, com resto maior que 1.
- **Saldo de um morador** = (total que ele pagou em despesas) − (soma das participações
  dele) + (acertos que recebeu) − (acertos que pagou). Saldo positivo significa que ele
  tem a receber; negativo, que ele deve.
- **A soma dos saldos de uma república é sempre zero.** É a invariante que vale como
  teste: qualquer bug de arredondamento ou de rateio aparece aqui.
- O saldo não é armazenado em nenhuma tabela. É sempre derivado.
- Papéis: **morador** (cadastra despesas, registra acertos, vê o próprio saldo) e
  **organizador** (morador que criou a república e pode convidar outros).

## Fora de escopo do TP1

Não implemente, não sugira e não deixe preparado:

- autenticação real, sessão, JWT, hash de senha, recuperação de senha;
- envio de e-mail (o convite por e-mail das histórias é apenas o cadastro do endereço);
- upload de comprovantes, anexos ou imagens;
- notificações, push, integração com WhatsApp;
- agendador automático (cron): a despesa recorrente é gerada por ação explícita do morador;
- app mobile, PWA ou responsividade além do básico;
- deploy, Docker, PostgreSQL (a migração está prevista, mas não é escopo desta entrega);
- simplificação de dívidas (é a "possível extensão" do README — só se sobrar tempo).

O enunciado pede um projeto pequeno e bem-feito. Escopo a mais é risco, não mérito.

## Regras de commit e de fluxo

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
  Mensagem em português, no imperativo: `feat: calcula saldo consolidado do morador`.
- **Máximo de 100 linhas por commit.** Se a mudança for maior, quebre em commits
  menores e coerentes. Exceção precisa ser justificada no corpo da mensagem.
- **Nunca faça push direto na `main`.** Toda mudança entra por Pull Request revisado por
  outro membro.
- Uma branch por história ou tarefa, nomeada `feat/saldo-consolidado`, `chore/ci`, etc.
- Antes de abrir o PR, rode o que existir de teste e lint e relate o resultado.
- A Definition of Done está em `docs/definition-of-done.md`, que é a fonte oficial; a
  página do Notion é só um espelho. Uma história só termina quando cumpre todos os itens.

## Alterações no schema do Prisma

`prisma/schema.prisma` é compartilhado pelos quatro membros e uma migration mal feita
quebra a máquina de todo mundo. Antes de alterar o schema ou criar migration, **pare e
avise**, explicando o que pretende mudar e por quê. Só siga depois da confirmação.

## Registro de uso de IA (`IA.md`)

O enunciado exige um registro do uso de IA no desenvolvimento, e ele vale nota.

Ao final de cada sessão de trabalho, atualize `IA.md` na raiz do repositório com uma
entrada contendo: data, tarefa, o que foi pedido à IA, o que ela gerou, o que foi
alterado ou descartado na revisão humana, e o que foi aprendido ou corrigido.

Seja específico e honesto: código aceito sem revisão deve ser registrado como tal. O
valor do arquivo está em ser um relato fiel do processo, não uma peça de marketing.

## Como quero trabalhar

- Antes de escrever código, explique o plano e espere aprovação.
- Prefira a solução mais simples que resolve. Não introduza biblioteca, abstração ou
  padrão novo sem dizer que alternativa está descartando e por quê.
- Quando algo for suposição sua e não fato verificado no repositório, diga isso
  explicitamente.
- Ao terminar, aponte o que ficou sem teste ou sem cobertura.
