import { ErroDeValidacao } from "../erros";
import { interpretaEmail } from "../republicas/validacao";

export type EntradaMorador = { nome?: unknown; email?: unknown };

/**
 * Valida o morador que o organizador adiciona (A2): nome sem espaços nas
 * pontas e e-mail no mesmo formato da A1, em minúsculas.
 */
export function montaMorador(entrada: EntradaMorador): { nome: string; email: string } {
  const nome =
    typeof entrada.nome === "string" || typeof entrada.nome === "number"
      ? String(entrada.nome).trim()
      : "";
  if (nome === "") {
    throw new ErroDeValidacao("Nome do morador é obrigatório.");
  }
  return { nome, email: interpretaEmail(entrada.email) };
}
