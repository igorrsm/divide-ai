# Definition of Done

Uma história só está pronta quando todos os itens abaixo forem atendidos.

- [ ] PR aberto e aprovado por outro integrante (nenhum push direto na `main`)
- [ ] Sem erro de TypeScript e sem warning de lint
- [ ] Funciona **na tela**, não só na API: quem revisou abriu e usou
- [ ] Valor monetário em centavos inteiros, nunca em `float`
- [ ] Sobra de arredondamento com destino definido (fica com quem pagou)
- [ ] Tela legível em 375 px de largura
- [ ] Trecho gerado por IA foi compreendido por quem abriu o PR; se houve
      fricção, ela está no `IA.md` no mesmo dia
- [ ] Commits em Conventional Commits, com até 100 linhas cada
- [ ] Cartão movido no Notion

## Testes

No TP1, testes automatizados não são exigidos e não travam o CI. Mesmo assim,
a lógica de saldo (`RelatorioService`) deve ter testes, porque protegem a regra
de que a soma dos saldos de todos os moradores é zero.
