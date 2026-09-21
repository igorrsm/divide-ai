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
- **Conector do Notion** no Claude Code, para ler o quadro do TP1 (páginas e
  bancos) e, em 21/09, escrever em dois cartões.

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

**O que a IA produziu**
- Lista de divergências entre o DoD e o `CLAUDE.md` (sobra, 375 px, contagem das
  100 linhas, escopo).
- Edições em `docs/definition-of-done.md` e no `CLAUDE.md`.
- Novos critérios de aceitação nos cartões B4 (pagador fora do rateio) e D1
  (teste com sobra maior que 1) do Notion.
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
- Pendentes: espelho do DoD no Notion (cita `DEFINITION_OF_DONE.md`, caminho
  errado) e cartão T7; formato dos códigos dos cartões nos commits; campos de
  tempo e veredito nas entradas deste arquivo; o README ainda diz que a
  recorrência é automática.
- Tempo economizado ou perdido: não medido.
- Nada commitado nesta sessão até este registro; as mudanças estão na branch
  `docs/ajusta-definition-of-done`.
