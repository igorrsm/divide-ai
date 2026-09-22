# Definition of Done

Uma história (user story do Scrum, no Notion) só está pronta quando todos os
itens abaixo forem atendidos.

- [ ] PR aberto e aprovado por outro integrante (nenhum push direto na `main`)
- [ ] Sem erro de TypeScript e sem warning de lint
- [ ] Funciona **na tela**, não só na API: quem revisou abriu e usou
- [ ] Valor monetário em centavos inteiros (`Int`), nunca `float`, `Decimal`
      nem string
- [ ] Sobra de arredondamento com destino definido: fica com quem pagou; se ele
      não participa da despesa, vai inteira para o participante de menor
      `moradorId`
- [ ] Tela legível em 375 px de largura
- [ ] Trecho gerado por IA foi revisado e compreendido por ao menos um membro;
      se houve fricção, ela está no `IA.md` no mesmo dia
- [ ] Commits em Conventional Commits, com até 100 linhas cada (adicionadas +
      removidas, sem contar `package-lock.json`), ou exceção justificada na
      mensagem do commit
- [ ] Cartão movido no Notion

## Testes

No TP1, testes automatizados não são exigidos e não travam o CI. Mesmo assim,
a lógica de saldo (`RelatorioService`) deve ter testes, porque protegem a regra
de que a soma dos saldos de todos os moradores é zero. O rateio também deve ter
testes, incluindo o caso do pagador fora do rateio com resto maior que 1.
