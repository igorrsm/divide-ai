# Registro de uso de IA

Este arquivo registra o uso de IA no desenvolvimento do Divide Aí, conforme
exigido pelo enunciado do TP1. Cada sessão de trabalho com IA tem uma entrada,
em ordem cronológica, com o que foi pedido, o que a IA produziu, o que foi
revisado, alterado ou descartado por um humano e observações. O objetivo é um
relato fiel do processo, inclusive dos erros.

**Ferramentas**
- **Claude Code** (CLI da Anthropic, modelo Claude Sonnet 5), em WSL/Ubuntu. É
  a ferramenta que atua no código e nos arquivos do repositório.
- **Claude em modo Cowork** (interface de chat). O Igor usa para planejamento,
  decisões de domínio e revisão, sem acesso ao repositório. A Thalita usa desde
  22/09 com acesso à pasta do projeto: ele escreve código, faz commits e revisa
  PRs (ver as entradas dela).
- **Conector do Notion** no Claude Code, para ler o quadro do TP1 (páginas e
  bancos) e, em 21/09, escrever em três cartões e na página principal.

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

## 2026-09-21 — Igor — Alinhamento do DoD e do CLAUDE.md com o Notion

Retomada após o merge do PR #3: conferência da branch `feat/esqueleto-projeto`,
análise do Definition of Done da Thalita (PR #2) contra o `CLAUDE.md` e leitura
do quadro do TP1 no Notion.

**Pedido à IA**
- Verificar o repositório e atualizar a `feat/esqueleto-projeto` com `--ff-only`.
- Avaliar se o DoD conflita com o `CLAUDE.md` e adaptá-lo.
- Ler a página principal do Notion, os dois bancos e os cartões B2, B4, D1 e D2.
- Aplicar as correções recomendadas, inclusive nos cartões B4 e D1, sem esperar
  retorno do time.
- Mover o cartão T7 para Finalizado e atualizar o espelho do DoD no Notion
  conforme o PR #4, ainda em revisão.

**O que a IA produziu**
- Lista de divergências entre o DoD e o `CLAUDE.md` (sobra, 375 px, contagem das
  100 linhas, escopo).
- Edições em `docs/definition-of-done.md` e no `CLAUDE.md`.
- Novos critérios de aceitação nos cartões B4 (pagador fora do rateio) e D1
  (teste com sobra maior que 1) do Notion.
- Atualização do cartão T7 (status e link do PR #2) e do espelho do DoD na
  página principal do Notion.
- Esta entrada.

**Revisão humana**
- A contagem das 100 linhas não foi discutida pelo grupo; o humano delegou a
  escolha à IA, que definiu adicionadas + removidas, sem `package-lock.json`.
- A IA acrescentou ao DoD um parêntese ("responsividade além disso está fora do
  escopo do TP1") vindo do `CLAUDE.md`. O Notion mostrou que o 375 px é requisito
  do time (DoD e cartão D2), e o parêntese foi revertido. Erro da IA: tratou uma
  regra do `CLAUDE.md` como se fosse do time.
- O `CLAUDE.md` dizia "geração mensal automática" para despesas recorrentes,
  texto que a IA escreveu a partir do README e do schema. O Notion decide sem
  agendador. Corrigido.
- O critério da B4 dizia que a regra de sobra da B2 "continua valendo", o que não
  cobre o pagador fora do rateio. A IA apontou a lacuna, e o humano autorizou a
  alteração dos cartões da B4 (do Lucas) e da D1 sem aguardar o time.

**Observações**
- As mudanças nos cartões do Notion não passam por revisão de PR e ainda não
  foram comunicadas ao Lucas.
- Feitos depois do primeiro registro, ainda em 21/09: cartão T7 movido para
  Finalizado e espelho do DoD no Notion atualizado conforme o PR #4 (em
  revisão), com o caminho corrigido para `docs/definition-of-done.md`.
- Pendentes: formato dos códigos dos cartões nos commits; campos de tempo e
  veredito nas entradas deste arquivo; o README ainda diz que a recorrência é
  automática; tirar o "(em revisão)" do espelho depois do merge do PR #4.
- Tempo economizado ou perdido: não medido.
- Este registro foi escrito antes dos commits; as mudanças foram commitadas na
  branch `docs/ajusta-definition-of-done` e enviadas no PR #4.

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

## 2026-09-22 — Igor — Resolução do conflito no IA.md (PR #5)

O conflito previsto na sessão anterior se confirmou: o PR #4 foi mesclado antes
do #5, e o `IA.md` (as duas entradas de 21/09) e o `CLAUDE.md` divergiram entre
`feat/esqueleto-projeto` e a `main`.

**Pedido à IA**
- Trazer a `main` para a branch com `git merge` (explicitamente, não rebase) e
  resolver o conflito no `IA.md` mantendo as duas entradas, em ordem
  cronológica, já que nenhum lado apagou nada.
- Mostrar o arquivo resolvido antes de commitar.
- Commitar, dar push, conferir se o PR #5 fechou o conflito e avisar a Thalita
  no PR.

**O que a IA produziu**
- `git fetch` + `git merge origin/main`: `CLAUDE.md` e
  `docs/definition-of-done.md` mesclaram sozinhos; só o `IA.md` conflitou.
- Ordem cronológica das duas entradas de 21/09 definida por `git log --date`
  nos commits das branches `docs/ajusta-definition-of-done` (19:53–20:04) e
  `feat/esqueleto-projeto` (20:34–20:59): a entrada do DoD vem antes da do
  esqueleto (T1).
- Arquivo resolvido mostrado ao humano antes do commit.
- Commit de merge (`5dcec6c`) e push da branch.
- Checagem do PR #5 via `gh pr view --json mergeable,mergeStateStatus`:
  `MERGEABLE`, com `mergeStateStatus: BLOCKED` explicado como proteção de
  branch (revisão/checks pendentes), não conflito.
- Comentário no PR #5 avisando a Thalita (`@thalipires`) que o conflito foi
  resolvido.

**Revisão humana**
- O humano pediu confirmação explícita antes de cada ação com efeito externo:
  ver o arquivo resolvido antes do commit, aprovar o commit, aprovar o push e
  só então pedir o aviso no PR. Nenhum passo foi automatizado sem esse aval.
- A ordem cronológica das entradas não foi verificada pelo humano linha a
  linha; a IA se baseou nos timestamps dos commits (`git log`), não em
  suposição.

**Observações**
- Nenhum código foi alterado nesta sessão, só documentação e o merge em si.
- Pendências seguem as mesmas da entrada anterior (healthcheck e proxy do T3,
  tirar "(em revisão)" do espelho do DoD, mover o cartão T1 após o merge).
- Tempo economizado ou perdido: não medido.

## 2026-09-22 — Thalita — Healthcheck ponta a ponta (T3)

Cartão T3: `GET /api/health` respondendo e a tela mostrando o resultado, com
CORS e proxy do Vite resolvidos. Branch `feat/healthcheck`.

**Ferramenta**
- Claude em modo Cowork (modelo Claude Opus 5.5), com acesso à pasta do
  projeto no computador da Thalita. Diferente do que o cabeçalho deste arquivo
  diz sobre o Cowork, nesta sessão ele escreveu o código e fez os commits.

**Pedido à IA**
- Revisar e aprovar o PR #5 (T1) seguindo a DoD, o enunciado e o repositório.
- Ajudar a instalar o Node 24 (nvm-windows) e rodar o projeto no Windows.
- Implementar o T3 e abrir o PR, respeitando o limite de 100 linhas.

**O que a IA produziu**
- Três commits de código: rota `GET /api/health` (4 linhas), proxy do Vite
  para `/api` (7 linhas) e componente `StatusApi` na tela inicial (27 linhas),
  mais este commit de docs.
- CORS resolvido pelo proxy: front e API ficam na mesma origem (porta 5173)
  no desenvolvimento, então não foi instalado o pacote `cors`.
- Verificações: `typecheck` e `lint` sem erro; `build` rodado pela Thalita no
  Windows; tela aberta em 375 px com "API: ok" (requisição a
  `localhost:5173/api/health` com 200) e, com só o `dev:web` no ar, "API: fora
  do ar".

**Revisão humana**
- A Thalita rodou `build`, `npm run dev` e `npm run dev:web` no próprio
  PowerShell e acompanhou os dois testes de tela.
- O texto da aprovação do PR #5 foi editado por ela antes do envio.

**Observações**
- Fricção: a IA sugeriu baixar o `nvm-setup.exe`, mas a release mais recente
  era uma beta publicada minutos antes; a estável (v2.0.0) usa outro nome de
  arquivo. Depois, `node -v` mostrava 22 porque um Node antigo instalado no
  Windows vinha antes do nvm no PATH; resolvido desinstalando o Node antigo.
- Fricção: o `npm` estava bloqueado no ambiente da IA, então o `build` (que
  depende de binários do Windows) só pôde ser rodado pela Thalita.
- No modo de desenvolvimento a tela chama `/api/health` duas vezes por causa
  do `StrictMode` do React; não acontece no build.
- Sem testes automatizados (desconsiderados no TP1).
- Tempo economizado ou perdido: não medido.

## 2026-09-22 — Igor — Revisão do PR #6 e replanejamento do Sprint 2

Revisão do T3 (PR #6, da Thalita), atualização do Notion e repasse do Sprint 1
para o Sprint 2, com o relato em `docs/sprints.md`.

**Pedido à IA**
- Avaliar o PR #6, orientar o teste de tela e redigir o texto da revisão.
- Mover o cartão T3 no Notion depois do merge.
- Planejar e aplicar o repasse do Sprint 1 para o Sprint 2 e registrar as
  dificuldades para começar a programar.

**O que a IA produziu**
- Avaliação do PR: typecheck, lint e build rodados numa cópia temporária da
  branch e `GET /api/health` testado com `curl`; a tela não foi aberta pela IA.
- Passo a passo do teste de tela e explicação do 304 que apareceu no lugar do
  200 esperado (revalidação por ETag do Express).
- Texto da aprovação, com cinco sugestões sobre o `IA.md` da Thalita.
- No Notion: cartão T3 finalizado com o link do PR; seis cartões (A1, A2, A3,
  B1, B2, B3) movidos para o Sprint 2 com nota de repasse; nota de
  replanejamento na página principal; "(em revisão)" retirado do espelho da DoD.
- `docs/sprints.md` e esta entrada.

**Revisão humana**
- O Igor abriu a tela, testou com e sem a API e conferiu os 375 px.
- O Igor rodou typecheck, lint e build na própria máquina e fez um teste
  negativo (erro de tipo proposital no `StatusApi`, detectado pelo `tsc`).
- Decisões do Igor: repassar o Sprint 1 inteiro; manter 30 pontos com ordem de
  corte (C1, depois B4); causas do atraso (agenda do time e dependência em
  cadeia); registrar no Notion e no repositório; manter o T4 no Sprint 0.
- A IA não encontrou registro da causa do atraso e perguntou em vez de supor.

**Observações**
- Fricção: até o PR #6, os resultados de typecheck e lint citados nos PRs
  vinham da IA, sem que um humano os visse rodar. A partir desta revisão, o
  revisor roda as verificações. O T4 (CI) resolve isso de forma automática.
- Erro da IA: o plano dizia que as tarefas do Sprint 0 foram entregues no
  prazo. Ao conferir as datas dos PRs, nenhum foi mesclado entre 12 e 15/09; o
  texto foi corrigido antes do commit.
- Erro da IA: a primeira avaliação do PR #6 não notou a contradição sobre quem
  rodou typecheck e lint; o ponto só apareceu na revisão commit a commit.
- As mudanças nos cartões do Eduardo, do Lucas e da Thalita ainda não foram
  comunicadas a eles.
- Tempo economizado ou perdido: não medido.

## 2026-09-22 — Igor — CI no GitHub Actions (T4)

Cartão T4: workflow que roda lint, typecheck e build em todo PR. Branch
`chore/ci`, PR #14.

**Pedido à IA**
- Criar o workflow conforme o plano aprovado, simular o CI localmente, abrir o
  PR e fazer o teste negativo no próprio PR.

**O que a IA produziu**
- `.github/workflows/ci.yml`: job `verificacoes` com `npm ci`, lint e build
  (que inclui o typecheck), Node lido do `.nvmrc`. Sem passo de testes, porque
  ainda não há testes; ele entra com o D1.
- Simulação numa cópia limpa (sem `.env`, `node_modules` nem client do
  Prisma): passou sem `prisma generate` nem `DATABASE_URL`, o que confirmou a
  suposição do plano.
- No PR #14: primeira execução verde (26 s); commit com variável sem uso,
  check vermelho por `no-unused-vars` no passo de lint; revert, verde de novo.

**Revisão humana**
- O Igor repetiu a simulação na própria máquina, com teste negativo local
  (lint com saída 1), e leu o workflow linha a linha antes do push.
- O Igor escolheu pôr os três colegas como revisores do PR #14.

**Observações**
- Erro da IA: na primeira simulação, um `cp` falhou e, por causa do `;` no
  encadeamento, o `npm ci` rodou na pasta do projeto em vez da cópia. O
  `node_modules` foi reinstalado a partir do mesmo lock; a IA conferiu que o
  `better-sqlite3` carrega e o Prisma CLI funciona, e refez a simulação com
  `||` e `&&` em cada passo.
- O `npm ci` avisa sobre `install-scripts` e sobre 4 vulnerabilidades altas
  (já registradas em 21/09); nenhum dos dois quebra o CI.
- A IA supôs que o login `Peluffo300` é o do Eduardo, por eliminação.
- Esta entrada e a do PR #13 são acrescentadas ao fim do arquivo: o PR que
  for mesclado por último terá conflito aqui.
- Pendente depois do merge: tornar `verificacoes` obrigatório no ruleset
  "Protege a Main".
- Tempo economizado ou perdido: não medido.

## 2026-09-23 — Lucas — Lançar despesa (B1)

História B1 do Sprint 2: lançar despesa com descrição, valor, data e quem
pagou. Sessão inteira no Claude Code, em WSL/Ubuntu.

**Pedido à IA**
- Ler o `CLAUDE.md`, o DoD e o `docs/sprints.md` e propor um plano antes de
  escrever código.
- Remover `categoria` do schema e criar a migration.
- Implementar validação, serviço, rota e formulário, com teste da parte pura.
- "Fazer o commit segundo os padrões do projeto."
- Fazer o push e abrir o Pull Request.
- Desfazer a reescrita das mensagens de commit.

**O que a IA produziu**
- Plano com quatro decisões em aberto, levadas ao humano antes de começar:
  alteração do schema, rateio dentro ou fora de B1, como o front escolhe a
  república, e se haveria teste.
- Migration `remove_categoria_da_despesa` e ajuste do seed.
- `src/despesas/validacao.ts`, `src/despesas/servico.ts`, `src/despesas/rotas.ts`,
  `src/db.ts` e o middleware de erro no `src/server.ts`.
- `web/src/NovaDespesa.tsx` e a rota na home.
- Treze testes em `node:test`, rodados por `npm test`.
- Passo `npx prisma generate` no CI e o PR #15, com a descrição preenchida a
  partir do template do projeto.

**Revisão humana**
- Avaliação do Lucas: a IA rendeu bem para levantar o estado atual do projeto,
  o que compensou a falta de comunicação da equipe. O ponto negativo da sessão
  foi a confusão com os commits, descrita abaixo.
- As quatro decisões de escopo foram do Lucas, não da IA.
- Pendente: ninguém abriu a tela ainda. A IA exercitou o fluxo por `curl`
  através do proxy do Vite e conferiu a página respondendo, mas não viu o
  formulário renderizado. O item "funciona na tela" do DoD continua aberto até
  o revisor do PR abrir e usar.

**Observações**
- Erro da IA, o mais caro da sessão: ao pedido "faça o commit segundo os
  padrões do projeto", a IA não percebeu que o trabalho já estava todo
  commitado. Em vez de relatar isso e parar, foi procurar um desvio, achou a
  falta de acentuação nas mensagens e reescreveu as dez, gerando SHAs novos e
  uma branch de backup. O que o Lucas queria era o push e o PR. Desfazer exigiu
  uma segunda reescrita de histórico e um `push --force-with-lease` num PR já
  aberto. Saldo: duas reescritas de histórico e um force-push para zero
  mudança de conteúdo. O certo era dizer "já está commitado" e perguntar.
- Efeito que ficou: as mensagens desta branch estão em português sem
  acentuação, enquanto o histórico da `main` usa acento. Decisão do Lucas,
  ciente da diferença.
- Achado no passo do push, este com valor real: o CI teria quebrado. O client
  do Prisma é gerado e está no `.gitignore`, e até esta história nenhum arquivo
  de `src/` o importava, então o typecheck do CI passava sem ele. Sem
  `npx prisma generate` o build falha com `TS2307`. A sequência exata do CI foi
  validada num clone limpo, sem `.env`, antes de abrir o PR.
- Erro da IA, corrigido: `prisma migrate dev` não roda em ambiente não
  interativo e pediu confirmação por causa da perda de dados. A saída foi gerar
  o SQL com `prisma migrate diff` e aplicar com `migrate deploy`, sem resetar o
  banco de ninguém.
- Erro da IA, corrigido: um `sed` de limpeza de linhas em branco levantou
  suspeita de ter apagado um comentário do schema. Era leitura errada da saída;
  o arquivo estava intacto. A IA afirmou a perda antes de conferir.
- Bug encontrado só porque a IA testou antes de escrever o teste: o JavaScript
  não rejeita `2026-02-30`, ele desliza para 2 de março. A checagem de `NaN`
  que a IA tinha escrito nunca disparava. Passou a validar por ida e volta no
  ISO.
- Mudança de decisão no meio do caminho: a comparação de data futura começou em
  UTC e passou para o calendário de São Paulo. Em UTC, a data de amanhã era
  aceita durante as três horas finais do dia no Brasil. Há teste fixando isso.
- Achado por teste manual: o seed apaga e recria, então o autoincremento
  avançava a cada execução e a república demo mudava de id. A constante do
  front teria quebrado no segundo seed. Os ids do seed passaram a ser fixos.
- O `node_modules` da máquina era anterior ao T1 e não tinha `tsc` nem
  `eslint`; foi preciso `npm install` antes de qualquer verificação.
- Sem cobertura automatizada: o serviço (que toca o banco) e o componente React
  não têm teste. Só a validação pura tem.
- A despesa nasce sem participações. Até B2 entrar, a soma das participações
  não bate com o valor da despesa.
- Tempo economizado ou perdido: não medido.

## 2026-09-26 — Thalita — Revisão do PR #15, protótipos e layout base (T14)

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto e ao navegador do app (GitHub e Notion logados pela Thalita).

**Pedido à IA**
- Revisar o PR #15 (B1) e mostrar o comentário antes de aprovar.
- Fazer protótipos do front para o grupo escolher (escolhido: C · Mural).
- Criar a issue #16 e o cartão T14 e implementar o layout base.

**O que a IA produziu**
- Revisão do #15: leitura do diff, `npm test` e testes na tela em 375 px
  (valor 0, -10, 19,99 → 1999, data futura, pagador de outra república).
- Três protótipos (Caderno, Extrato, Mural), duas telas cada.
- T14: fontes e cores em `estilo.css`, `Layout.tsx` com cabeçalho e menu
  inferior, rotas provisórias de Saldos e Moradores e `formatarReais`.

**Revisão humana**
- A Thalita editou e aprovou o texto da revisão do #15 antes do envio, pediu
  que o Igor também olhasse e decidiu esperar o merge do #15 antes do T14.
- Plano do T14 aprovado por ela antes de qualquer código (regra do CLAUDE.md).
- Ela rodou `build` e `npm run dev`; a IA conferiu as telas em 375 px (menu,
  item ativo, formulário da B1 dentro do layout, sem rolagem lateral).

**Observações**
- Fricção: `.env` ausente e client do Prisma não gerado travaram o seed na
  revisão do #15; a IA criou o `.env` e o `generate` resolveu.
- Fricção: o git da pasta precisou de permissão para apagar arquivos
  temporários de `.git`; sem ela ficava lixo em `.git/objects`.
- Erro da IA, corrigido antes do push: um commit saiu como `style:`, que em
  Conventional Commits é formatação de código; virou `feat:`.
- `formatarReais` foi testado copiando a lógica para o Node puro, porque o
  `tsx` da pasta tem binário do Windows e não roda no ambiente da IA. Não há
  teste automatizado dele. Negativo sai como "-R$ 763,30".
- A pedido da Thalita, o formulário da B1 (do Lucas) também passou para o
  visual Mural: só os estilos mudaram, a lógica ficou igual. Retestado em
  375 px (valor 0 recusado, 19,99 gravado como 1999).
- A pedido da Thalita, o "API: ok" do T3 saiu da tela inicial: o aviso só
  aparece com a API fora do ar, no visual da página, em qualquer tela.
  Cabeçalho e menu passaram a acompanhar a coluna do conteúdo no computador,
  problema que ela notou numa captura de tela.
- A pedido da Thalita: com a API fora do ar, lançar despesa fica bloqueado
  (botões desativados, status consultado a cada 10 s e destrava sozinho); o
  exemplo do campo de valor virou "0,00"; e há uma tela inicial com texto e
  quatro atalhos (Despesas, Saldos, Moradores e Criar república, esta vazia
  para a A1). Despesas passou para /despesas.
- Achados nos testes da IA, corrigidos: botão desativado mais estreito que o
  link ativo e aviso de erro duplicado no formulário com a API fora do ar.
- O painel do navegador do app aparecia vazio para a Thalita enquanto a IA
  testava; ela acompanhou pelas capturas enviadas no chat e também testou
  as telas na própria máquina.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Igor — Validação dos PRs #15 e #17, testes no CI e correção do JSON malformado

Validação do B1 (PR #15, do Lucas, já mesclado) e do T14 (PR #17, da
Thalita, aberto), com o Igor conduzindo e a IA executando os testes que não
dependem de navegador.

**Pedido à IA**
- Ajudar a validar e testar os dois PRs, porque a fase de código de negócio
  passou do que o Igor consegue revisar sozinho.
- Corrigir num PR o que a validação confirmasse como bug, e fechar o T4.

**O que a IA produziu**
- Ambiente local (`.env`, migrations, client e seed) e, nas duas branches,
  `npm test` (13 de 13), lint e build.
- Bateria de 18 chamadas à API de despesas, com código HTTP esperado e
  obtido. Achado: JSON malformado recebia 500 em vez de 400.
- Contagem das linhas dos 21 commits do #17: todos até 100.
- Roteiro de tela para o Igor e o texto da revisão do #17.
- PR #18: `npm test` no CI, com teste negativo (teste quebrado de propósito
  deixou o check vermelho; o revert voltou ao verde).
- Este PR: 400 para JSON malformado, reexecutando a bateria (18 de 18).
- Resolução do conflito deste PR no `IA.md` com o #17 (`git merge` da `main`).
- No Notion: T14 e B1 finalizados, com critérios e nota de fechamento; T4
  devolvido de Finalizado para "Em revisão (PR)", apontando para o #18.

**Revisão humana**
- O Igor executou o roteiro de tela do #17 (rotas, menu, 375 px, API fora do
  ar e de volta) e confirmou tudo como descrito. Postou a aprovação com o
  texto sugerido pela IA e mesclou o #17.
- As decisões foram do Igor: corrigir ele mesmo num PR, com o Lucas como
  revisor; finalizar T14 e B1; e voltar o T4 para "Em revisão".

**Observações**
- Erro da IA: supôs que valores acima de 2.147.483.647 centavos dariam 500,
  pelo `Int` de 32 bits do Prisma. O teste mostrou que o SQLite com o adapter
  grava e lê esses valores; a suspeita foi descartada antes de virar código.
- Erro da IA: subiu o servidor de teste fora da pasta do projeto, onde o
  `dotenv` não acha o `.env`; percebeu antes de rodar a bateria. Um `pkill`
  com padrão amplo derrubou o próprio shell; os processos passaram a ser
  encerrados pela porta.
- Erro da IA, corrigido antes do commit: na resolução do conflito, a linha
  "Tempo economizado ou perdido", igual no fim das duas entradas, ficou fora
  do bloco de conflito e sumiu da entrada da Thalita. O `git diff` não acusava
  remoção, porque a linha continuava no arquivo; a IA achou ao comparar as
  primeiras 471 linhas com a `main` e recolocou a linha.
- O T4 estava como Finalizado desde o merge do #14, mas o CI ainda não roda
  `npm test` e o check não é obrigatório no ruleset. Volta a Finalizado depois
  do merge do #18, da regra no ruleset e de um PR vermelho bloqueado.
- Não corrigido: as mensagens genéricas da API usam sempre o masculino
  ("Descrição é obrigatório", "República inválido").
- Sem teste automatizado: rotas HTTP, o serviço que toca o banco, os
  componentes React e `formatarReais`.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Igor — Check obrigatório no ruleset (fecho do T4)

Continuação da sessão anterior, depois do merge dos PRs #18 e #19 pela
Thalita.

**Pedido à IA**
- Tornar o check do CI obrigatório na `main`, verificar o bloqueio e fechar o
  cartão T4.

**O que a IA produziu**
- Regra `required_status_checks` no ruleset "Protege a Main", com o check
  `verificacoes` do GitHub Actions, via `gh api`. As três regras anteriores
  foram mantidas. A exigência de branch atualizada com a `main` ficou
  desligada, para não forçar "Update branch" a cada merge.
- PR #20, descartável: um teste quebrado deixou o check vermelho, marcado como
  obrigatório (`isRequired: true`), e o merge ficou `BLOCKED`. Fechado sem
  merge, com a branch apagada.
- Cartão T4 finalizado no Notion, com os dois critérios e nota de fechamento
  (PRs #14, #18 e #20).

**Revisão humana**
- O Igor autorizou a mudança no ruleset e o teste com o PR descartável.

**Observações**
- A IA tentou o merge do #20 pela API para listar as regras violadas; o
  sistema de permissões do Claude Code negou a ação, e a IA não contornou.
  A prova veio de consulta só de leitura (GraphQL), que mostra o check como
  obrigatório.
- Limite da verificação: o #20 também não tinha aprovação, o que por si só
  bloqueia o merge. O que prova a regra nova é o `isRequired: true`.
- A partir daqui, nenhum PR com lint, teste, typecheck ou build quebrado pode
  ser mesclado na `main`.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Igor — Correção do sinal dos acertos na fórmula do saldo

Início do planejamento da D1 (saldo do morador), interrompido para esperar a
Thalita avançar na A3.

**Pedido à IA**
- Planejar a D1. Depois, avaliar se a Thalita dependia de outras pessoas para
  a A3 e a B3. Por fim, corrigir só a fórmula do saldo, adiando o código da D1.

**O que a IA produziu**
- Ao escrever o cálculo, a IA notou que a fórmula do `CLAUDE.md` e do cartão
  D1 tinha o sinal dos acertos invertido: "+ acertos que recebeu − acertos que
  pagou". No seed, se Bruno (−R$ 725,00) paga o que deve à Ana, a fórmula
  escrita o deixaria em −R$ 1.450,00, e não quitado.
- Correção no `CLAUDE.md` e no critério do cartão D1 no Notion: "+ acertos
  que pagou − acertos que recebeu". A regra também passa a avisar que a
  invariante da soma zero não detecta esse erro.
- Análise das dependências da Thalita: A3 e B3 dependem só de dados que já
  existem (rota de moradores e B1 mescladas, seed com participações); a única
  dependência que trava é a D2, que espera a rota de saldos da D1.

**Revisão humana**
- O Igor decidiu corrigir só a regra agora e começar a D1 depois da A3.

**Observações**
- A fórmula errada veio do início do projeto (entrada de 20/09) e passou pelas
  revisões seguintes. Como o teste pedido era só a soma zero, que continua
  valendo com o sinal errado, ela só apareceu quando o código foi escrito.
- O rascunho de `src/saldos/calculo.ts`, com o sinal certo, ficou num
  `git stash` da branch `feat/saldo-consolidado`, sem commit.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Thalita — Seletor "Quem é você?" (A3)

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto e ao navegador do app.

**Pedido à IA**
- Implementar a A3 (#9): escolher qual morador está usando o app, sem login.

**O que a IA produziu**
- `MoradorAtual.tsx`: provedor e hook `useMoradorAtual` que carregam os
  moradores da república e guardam a escolha no `localStorage` (em
  `try/catch`; sem ele, a escolha vale até recarregar).
- `SeletorMorador.tsx`: "Quem é você?" no cabeçalho, um botão por morador com
  `aria-pressed`, no visual do protótipo C. Some com a API fora do ar.
- Nova despesa (B1, do Lucas): "Quem pagou" já vem com o morador escolhido.

**Revisão humana**
- Plano aprovado pela Thalita antes de qualquer código (regra do CLAUDE.md).
- A IA testou no navegador do app em 375 px e 1280 px: escolha mantida depois
  de recarregar, troca de morador, "Quem pagou" preenchido e id salvo que não
  existe mais (a escolha é apagada e volta "Escolha quem você é").
- A Thalita repetiu os testes na própria máquina, inclusive com a API fora do
  ar (aviso aparece, seletor some e volta sozinho quando a API sobe).

**Observações**
- Se o morador for trocado com a tela de nova despesa aberta, "Quem pagou" não
  muda; vale a partir da próxima vez que o formulário abrir.
- A pedido da Thalita, levar para o início e travar a navegação com a API fora
  do ar fica para um PR separado, fora do escopo da #9.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Thalita — Início travado com a API fora do ar

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto.

**Pedido à IA**
- Sugestão da Thalita: como nenhuma tela além do início funciona sem a API,
  voltar para o início quando ela cair e não deixar sair de lá.

**O que a IA produziu**
- Levantamento de quais telas dependem da API (todas, menos o início).
- `Layout.tsx` leva para `/` com a API fora do ar; menu inferior e atalhos do
  início ficam apagados e sem link (classe `.desativado`).

**Revisão humana**
- Plano aprovado pela Thalita antes do código (regra do CLAUDE.md). Ela
  decidiu fazer em PR separado da A3, para a #23 continuar focada na #9.
- A Thalita testou na própria máquina: a tela volta para o início, o menu e
  os atalhos travam e tudo destrava quando a API volta.

**Observações**
- Quem estiver preenchendo uma despesa quando a API cair perde o que digitou;
  sem a API não daria para salvar de qualquer forma. A Thalita foi avisada.
- Quando a API volta, a pessoa continua no início, sem voltar à tela anterior.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Igor — Saldo do morador (D1)

Cartão D1: cálculo do saldo e rota de saldos da república, na branch
`feat/saldo-consolidado`. A tela fica para a D2, da Thalita.

**Pedido à IA**
- Replanejar a D1 depois da correção do sinal (PR #22) e da A3 (PR #23), e
  implementá-la no formato de rota combinado com a Thalita.
- No meio da sessão: pausar a D1 para validar, aprovar e mesclar o PR #24 da
  Thalita, avaliando conflitos com a D1.

**O que a IA produziu**
- `calcularSaldos` (`src/saldos/calculo.ts`): função pura sobre despesas,
  participações e acertos, com a situação "a receber", "a pagar" ou "quitado".
  Veio de um rascunho guardado em `git stash`; na revisão, a IA notou que o
  comentário ainda descrevia a fórmula antiga e o corrigiu.
- 8 testes em `src/saldos/calculo.test.ts` (21 no total), um por critério do
  cartão. Todos conferem a soma zero.
- `GET /api/republicas/:id/saldos` (`servico.ts` e `rotas.ts`), reaproveitando
  o `idDaRepublica` das rotas de despesa.
- Validação do PR #24 numa cópia separada da branch, com a tabela de arquivos
  tocados por ele e pela D1 (só o `IA.md` em comum).

**Revisão humana**
- O Igor pediu para repassar o plano antes de retomar o código e testou na
  tela o PR #24 antes da aprovação e do merge.

**Observações**
- Teste negativo: com o sinal dos acertos invertido de propósito, só o teste
  "pagar a dívida inteira deixa o devedor quitado" falhou (Ana 232500, Bruno
  -145000); a checagem da soma zero continuou passando. Isso confirma que ela
  sozinha não pegaria o erro corrigido no PR #22.
- `curl` com o seed: Ana +160000, Bruno -72500, Carla -87500; república 999
  dá 404 e "abc" dá 400.
- Limitação confirmada pela API: despesa lançada pela tela antes da B2 não tem
  participações, e a soma dos saldos deixa de ser zero (+R$ 100,00 à Carla no
  teste). O cálculo está certo; falta o rateio.
- Conflito evitado: o #24 foi mesclado primeiro e a `main` entrou na branch da
  D1 antes deste registro, então esta entrada vem depois da dela sem conflito.
- Sem teste automatizado: `buscaSaldos` e a rota, que tocam o banco.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Thalita — Nova despesa usa os moradores do contexto

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto e ao navegador do app.

**Pedido à IA**
- Corrigir o que o Igor apontou na revisão do PR #23: o `NovaDespesa.tsx`
  buscava a lista de moradores por conta própria, contra a regra do CLAUDE.md.

**O que a IA produziu**
- `NovaDespesa.tsx` passa a usar os `moradores` do `useMoradorAtual()`; saem o
  `fetch`, o `useEffect` e o tipo `Morador` duplicado. "Quem pagou" é
  calculado a partir da lista, sem efeito extra.
- `MoradorAtual.tsx` expõe `erro`, para o formulário manter o aviso "Não foi
  possível carregar os moradores.".

**Revisão humana**
- Plano aprovado pela Thalita antes do código; ela decidiu esperar o merge do
  #24 para não repetir o conflito no IA.md.
- A IA testou no navegador em 375 px: a tela de nova despesa passou de 4 para
  2 chamadas a `/moradores` (as 2 restantes são o StrictMode do React em modo
  dev, que roda o efeito duas vezes; em produção é 1). "Quem pagou" vem com o
  morador escolhido, troca à mão continua funcionando e um id salvo que não
  existe cai no primeiro morador.
- A Thalita também testou na própria máquina antes do push.

**Observações**
- Erro da IA, percebido no teste: a Thalita tinha voltado para a `main`
  depois do pull, e o primeiro teste rodou o código antigo. A IA conferiu o
  arquivo servido pelo Vite, trocou a pasta para a branch e refez o teste.
- Nenhuma despesa foi lançada no teste, para não mudar os números do seed.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Thalita — Painel de saldos (D2)

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto e ao navegador do app.

**Pedido à IA**
- Implementar a D2 (#26): painel com o saldo de todos os moradores, em cima da
  rota `GET /api/republicas/:id/saldos` da D1 (PR #25, Igor).

**O que a IA produziu**
- `Saldos.tsx`: busca os saldos e mostra um cartão por morador, com inicial,
  nome, valor com sinal ("+ R$", "− R$") e o rótulo `situacao` da API. Assim
  positivo e negativo não dependem só da cor.
- Resumo no topo para o morador escolhido em "Quem é você?" ("Ana, você tem a
  receber R$ 1.600,00"), cartão dele em amarelo claro com "(você)"; sem
  ninguém escolhido, uma dica para escolher.
- Estilos do painel em `estilo.css`, no visual do protótipo C.

**Revisão humana**
- Plano aprovado pela Thalita antes do código; ela esperou o merge do #30.
- A IA testou no navegador: valores do seed (Ana +1.600, Bruno −725, Carla
  −875), destaque e resumo com o Bruno escolhido e 375 px sem rolagem lateral.
- A Thalita testou na própria máquina: sem ninguém escolhido, escolhendo e
  trocando de morador, e no modo celular.
- Ela perguntou se "Criar república" deveria entrar no menu inferior; a IA
  recomendou não (ação de uma vez só, protótipo com três itens, A1 ainda
  vazia) e ela concordou.

**Observações**
- Mudança do plano: a busca e a lista ficaram num commit só, porque a busca
  sozinha não mostrava nada.
- O botão "Registrar pagamento" do protótipo fica para a D3 (Eduardo).
- Até a B2 entrar, despesas lançadas pela tela não têm rateio e a soma dos
  saldos deixa de dar zero; a tela não trata isso como erro.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Igor — Revisão dos PRs #30 e #31 (refactor da B1 e D2)

Revisão de dois PRs da Thalita depois do merge da D1: o #30 (nova despesa
usa os moradores do `useMoradorAtual`) e o #31 (D2, painel de saldos).

**Pedido à IA**
- Avaliar os dois PRs, aprovar e mesclar depois do teste de tela do Igor, e
  registrar a rodada neste arquivo.

**O que a IA produziu**
- Validação de cada PR numa cópia separada da branch (`git worktree`), para
  não mexer no trabalho em andamento: lint, `npm test` (21 de 21), build,
  tamanho dos commits e comparação do `IA.md` com o da `main`.
- No #30: o GitHub mostrava +320 linhas porque a branch tinha incorporado a
  `feat/saldo-consolidado`; o diff real contra a `main` era +56 −27. A
  comparação achou que, no merge dessa branch, a linha "Tempo economizado ou
  perdido" tinha sumido da entrada da D1 (a mesma armadilha dos PRs #19 e
  #23). A IA recolocou a linha num commit na branch da Thalita.
- No #31: conferência de que a tela segue o formato da rota da D1 (tipo,
  `formatarReais(Math.abs(...))`, rótulo pela `situacao`, destaque pelo
  `moradorId`) e de que as variáveis de cor usadas existem.
- Textos das duas aprovações, postados pelo `gh` com o ok do Igor; cartões D2
  finalizado e B1 com nota do refactor no Notion.

**Revisão humana**
- O Igor fez o teste de tela dos dois PRs antes de autorizar aprovação e
  merge: no #30, contou as chamadas a `/moradores` no DevTools (2, antes 4),
  com a IA explicando como filtrar; no #31, conferiu os valores do seed, o
  resumo e o destaque ao trocar de morador, e os 375 px.

**Observações**
- É a terceira vez que um conflito no fim deste arquivo apaga a linha final
  de uma entrada sem o diff acusar. A conferência que pega o erro é comparar
  as primeiras linhas do arquivo com as da `main`; a sugestão foi deixada na
  aprovação do #30.
- Pontos não bloqueantes do #31: cores fixas no CSS em vez de variáveis e o
  resumo antes do `<h1>`.
- Tempo economizado ou perdido: não medido.

## 2026-09-27 — Thalita — Cores em variáveis e título do painel de saldos

Ferramenta: Claude em modo Cowork (Claude Opus 5.5), com acesso à pasta do
projeto e ao navegador do app.

**Pedido à IA**
- Corrigir os dois pontos não bloqueantes da revisão do Igor no PR #31 (D2):
  cores fixas no CSS e o resumo antes do `<h1>`.

**O que a IA produziu**
- Oito cores fixas viraram variáveis no `:root` de `estilo.css`, com os
  mesmos valores: fundos do resumo, cartão de quem está usando, círculos das
  iniciais e os fundos dos avisos de erro e sucesso, que vinham do T14.
- No `Saldos.tsx`, o `<h1>` passou para antes do resumo.

**Revisão humana**
- Plano aprovado pela Thalita antes do código.
- A IA testou em 375 px: título antes do resumo, com e sem morador escolhido,
  e as cores medidas na tela iguais às de antes.
- A Thalita testou na própria máquina.

**Observações**
- Achado no teste da IA: com o título em cima, o resumo ficou colado na
  lista. Corrigido com 20 px de margem, num commit `fix:` separado.
- Aprendizado do #30: depois de resolver conflito no fim deste arquivo,
  comparar com o da `main` para não perder a última linha de uma entrada.
- Tempo economizado ou perdido: não medido.
