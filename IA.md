# Registro de uso de IA

Este arquivo registra o uso de IA no desenvolvimento do Divide Aí, conforme
exigido pelo enunciado do TP1. Cada sessão de trabalho com IA tem uma entrada,
em ordem cronológica, com o que foi pedido, o que a IA produziu, o que foi
revisado, alterado ou descartado por um humano e observações. O objetivo é um
relato fiel do processo, inclusive dos erros.

**Ferramentas**
- **Claude Code** (CLI da Anthropic, modelo Claude Sonnet 5), em WSL/Ubuntu. É
  a ferramenta que atua no código e nos arquivos do repositório.
- **Claude em modo Cowork** (interface de chat), usado para planejamento,
  discussão de decisões de domínio e revisão. Não tem acesso ao repositório e
  não gera código do projeto.

## 2026-09-20 — Igor — Configuração inicial do Claude Code e do CLAUDE.md

Sessão de configuração inicial do Claude Code no projeto, em WSL/Ubuntu.

**Pedido à IA**
- Rodar `/init` para gerar o `CLAUDE.md` a partir do repositório.
- Explicar, sem ler arquivos, a regra da sobra de arredondamento e as
  restrições de commit.
- Atualizar o `CLAUDE.md` com a decisão sobre pagador fora do rateio.
- Redigir este arquivo.
- Redigir o template de pull request.

**O que a IA produziu**
- `CLAUDE.md` inicial, a partir da leitura do repositório: estado do projeto
  (só a camada de dados), comandos do Prisma, modelo de dados e convenções do
  README.
- Resposta sobre a sobra de arredondamento, apontando um caso não coberto pela
  especificação e três alternativas de tratamento.
- Resposta sobre as regras de commit.
- Nova regra no `CLAUDE.md` para o pagador fora do rateio.
- Rascunho deste arquivo, mostrado ao humano antes de ser criado.
- `.github/pull_request_template.md`, com as seções de contexto, checklist de
  commits e declaração de uso de IA.

**Revisão humana**
- O conteúdo gerado pelo `/init` foi mantido. O humano acrescentou à mão as
  regras de domínio, o escopo excluído, as regras de commit e a rotina de
  atualizar este arquivo.
- Na primeira tentativa, o texto colado perdeu a formatação markdown e um
  sinal "+" na fórmula do saldo. O erro foi detectado em conferência manual com
  `grep` e corrigido reescrevendo o trecho.
- Caso do pagador fora do rateio: a IA identificou que, quando o pagador não é
  participante da despesa, não havia regra sobre onde o resto entra. O humano
  descartou a alternativa de criar uma participação para quem não participa
  (geraria estranhamento a quem lê o lançamento depois) e decidiu que o resto
  vai para um participante. O critério (menor `moradorId`) e a regra de que o
  resto inteiro vai para uma só pessoa foram propostos pela IA, tanto em sessão
  do Claude Code quanto em sessão de Cowork (esta última informada pelo humano,
  sem registro no repositório). O humano aceitou e registrou no `CLAUDE.md`.
- O corpo do PR #3 foi preenchido à mão pelo humano, porque o
  `gh pr create --fill` sobrescreve o template.

**Observações**
- A decisão sobre o pagador fora do rateio ainda será levada ao grupo; por ora
  consta apenas no `CLAUDE.md`.
- Em aberto: "máximo de 100 linhas por commit" não define se conta só linhas
  adicionadas ou adicionadas + removidas. Apontado pela IA.
- As respostas sobre sobra e commits vieram do contexto da sessão, não de
  código: o repositório ainda tem só schema Prisma e seed.

## 2026-09-21 — Igor — Esqueleto do projeto (T1)

Cartão T1: Express, React + Vite e TypeScript, na branch `feat/esqueleto-projeto`.

**Pedido à IA**
- Verificar se a Thalita tinha branch no remoto e apagar as branches mescladas.
- Propor o plano do esqueleto e implementá-lo em commits com `Refs: T1`.
- Preparar o ambiente (Node no WSL) e registrar a sessão neste arquivo, neste
  mesmo PR.

**O que a IA produziu**
- Plano aprovado e cinco commits: TypeScript e Express, servidor, app React com
  Vite e Router, ESLint, e `npm run dev` com `concurrently`.
- Verificações: `npm ci` limpo, `typecheck`, `lint`, `build`, e `npm run dev`
  (API responde 404 sem rotas; o Vite serve o HTML com `#root`).
- Atualização do `CLAUDE.md` com os comandos novos e esta entrada.
- Depois do registro: cartão T1 no Notion movido para "Em revisão (PR)", com o
  link do PR #5, e comentário no PR #5 avisando a Thalita, ambos a pedido.

**Revisão humana**
- O Node existia só no Windows: o `npm` aparecia no WSL, mas o `node` não. A IA
  apontou; o humano instalou o nvm e o Node 24.21.0 no WSL. A sessão do Claude
  Code, aberta antes disso, seguiu sem enxergar o Node, e a IA contornou
  prefixando o PATH nos comandos.
- O `typescript` mais recente (7.0.2) não é aceito pelo `typescript-eslint`
  (`<6.1.0`). A IA fixou `~6.0.3` conferindo os peers, e a instalação passou sem
  `ERESOLVE`.
- O Vite avisou que o `vite.config.ts` usava ESM carregado como CommonJS. A IA
  renomeou para `.mts`, sem mudar o `package.json` inteiro para ESM.
- Ao encerrar o `npm run dev` com `kill`, a API e o Vite continuaram nas portas
  3000 e 5173. A IA notou pela checagem de portas e encerrou os processos.
- O humano mudou o plano: o commit de docs entra neste PR, e não depois do merge
  do PR #4, porque o `CLAUDE.md` exige registro no mesmo dia e o template de PR
  tem o item "O IA.md foi atualizado". A IA havia sugerido esperar o merge, por
  causa do conflito no fim deste arquivo, que os dois PRs alteram.
- O README pedia "Node.js 20 ou superior", mas o Vite 8 e o ESLint 10 exigem
  Node 20.19 ou mais (o `.nvmrc` é 24). A IA apontou ao ler o cartão T1, e o
  humano pediu para atualizar o README para Node 24.

**Observações**
- Conflito esperado neste arquivo (e possivelmente no `CLAUDE.md`) no PR que for
  mesclado por último.
- `npm audit` acusa 4 vulnerabilidades altas na cadeia `prisma` → `mysql2`;
  `audit fix --force` rebaixaria o Prisma para 6.x, então não foi aplicado. O npm
  11.19 também avisa sobre `allowScripts` (`better-sqlite3`, `esbuild`,
  `prisma`); nada quebrou.
- Sem testes no esqueleto. A página React foi verificada por `curl` e `build`,
  não visualmente. `prisma/seed.ts` e `prisma.config.ts` só passam pelo lint.
- Tempo economizado ou perdido: não medido.
- Pendentes: healthcheck e proxy (T3); tirar o "(em revisão)" do espelho do DoD e
  mover o cartão T1 depois do merge.
