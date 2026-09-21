# Divide Aí

Sistema de gestão de despesas compartilhadas para pessoas que dividem moradia.

## Objetivo

Quem divide apartamento acaba controlando as contas da casa em grupos de
WhatsApp e planilhas improvisadas, onde é fácil perder um lançamento e difícil
saber quem está devendo quanto. O Divide Aí centraliza as despesas de uma
república: cada conta é registrada com quem pagou e entre quem deve ser
dividida — porque nem toda despesa é rateada por todos — e o sistema mantém o
saldo de cada morador atualizado, mostrando quanto cada um deve e a quem.
Também trata contas recorrentes, como aluguel e internet, que hoje precisam
ser relançadas manualmente todo mês.

## Equipe

| Nome completo | Papel |
|---|---|
| Igor Rodrigues da Silva Machado | Fullstack |
| Thalita Fernandes Pires | Fullstack |
| Eduardo Soares Peluffo | Backend |
| Lucas Araujo Pinto Resende | Backend |

## Tecnologias

- **Frontend:** React 18 + TypeScript, Vite, React Router
- **Backend:** Node.js + Express + TypeScript, API REST
- **Banco de dados:** SQLite + ORM Prisma, com migração programada para PostgreSQL
- **Agente de IA:** Claude Code

Justificativa: adotamos uma linguagem única (TypeScript) em todo o stack, para
que todos os membros consigam atuar e revisar tanto backend quanto frontend,
conforme exigido no enunciado. React e Node.js são as tecnologias web mais
utilizadas do mercado (44,7% e 48,7% — Stack Overflow Developer Survey 2025).

O projeto começa em SQLite para eliminar atrito de instalação e garantir que os
quatro membros consigam executá-lo desde o primeiro dia. Está prevista a
migração para PostgreSQL (banco mais utilizado do mercado, 55,6% na mesma
pesquisa), orquestrado por Docker Compose, ainda durante o desenvolvimento.
Como todo o acesso a dados passa pelo ORM Prisma, a migração se restringe ao
provider e à string de conexão, sem alteração no código da aplicação. A decisão
é deliberada: queremos ter contato com as duas ferramentas e registrar a
migração como parte do aprendizado.

## Como rodar localmente

```bash
git clone https://github.com/igorrsm/divide-ai.git
cd divide-ai
npm install
npx prisma migrate dev      # cria o arquivo do banco e as tabelas
npm run dev
```

Pré-requisito: Node.js 24, conforme o `.nvmrc` (com o nvm, rode `nvm install` na pasta do projeto).

> Após a migração para PostgreSQL, esta seção passa a incluir
> `docker compose up -d` e a configuração do arquivo `.env`.

## Histórias de usuário

1. Como morador, quero criar uma república e convidar colegas por e-mail, para
   que todos enxerguem as mesmas contas.
2. Como morador, quero cadastrar uma despesa informando valor, data, categoria
   e quem pagou, para registrar um gasto da casa.
3. Como morador, quero escolher quais moradores participam de cada despesa,
   porque nem toda conta é dividida por todos.
4. Como morador, quero dividir uma despesa em partes iguais ou por
   valores/percentuais customizados, para refletir acordos diferentes.
5. Como morador, quero ver meu saldo consolidado — quanto devo e quanto tenho
   a receber — para saber minha situação sem precisar fazer contas.
6. Como morador, quero registrar um acerto de pagamento com outro morador,
   para que os saldos sejam atualizados.
7. Como morador, quero cadastrar despesas recorrentes (aluguel, internet),
   para que sejam lançadas automaticamente todo mês.
8. Como morador, quero ver o extrato do mês, com o total da casa e o total por
   pessoa, para conferir e fechar o mês.

### Possível extensão
Simplificação de dívidas: em vez de A→B, B→C e C→A, o sistema calcula o menor
número de transferências que zera todos os saldos.

## Convenções de desenvolvimento

- Commits seguindo Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Máximo de 100 linhas por commit; exceções justificadas na mensagem do commit
- Nenhum push direto na `main` — toda mudança entra por Pull Request revisado
- Todo código gerado por IA é revisado e compreendido por ao menos um membro
  antes do merge
