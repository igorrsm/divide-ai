/**
 * Os testes rodam no fuso de São Paulo, carregado pelo `npm test` com
 * --import. O CI roda em UTC, onde `new Date("2026-01-01")` ainda mostra o dia
 * 1º; num fuso negativo ele vira 31/12. Sem isto, os testes de formatarData e
 * diaDa não pegariam quem voltasse a usar Date para mostrar datas.
 *
 * Fica num arquivo, e não como `TZ=... node` no script, porque no Windows o
 * npm roda os scripts pelo cmd, onde essa sintaxe não funciona.
 */
process.env.TZ = "America/Sao_Paulo";
