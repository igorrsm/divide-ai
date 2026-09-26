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
- Os campos do formulário da B1 ainda usam o estilo padrão do navegador.
- Tempo economizado ou perdido: não medido.
