/**
 * Filtro de despesa não excluída (B6). A exclusão é lógica: a linha continua
 * no banco com `excluidaEm` preenchido. Toda consulta de despesa usa este
 * filtro, e o teste em ativa.test.ts acusa a consulta que esquecer.
 */
export const DESPESA_ATIVA = { excluidaEm: null } as const;
