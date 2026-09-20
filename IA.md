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
