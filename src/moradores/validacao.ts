import { ErroDeValidacao, ErroNaoEncontrado } from "../erros";
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

/** O que a saída (A4) precisa saber do morador que vai sair. */
export type AlvoDaSaida = { id: number; organizador: boolean; saiuEm: Date | null };

/**
 * Confere se o morador pode ser marcado como "saiu da casa" (A4). `alvo` vem
 * nulo quando o id não é desta república. O organizador não sai: sem ele,
 * ninguém mais adiciona moradores nem marca saídas.
 */
export function validaSaida(alvo: AlvoDaSaida | null): AlvoDaSaida {
  if (!alvo) throw new ErroNaoEncontrado("Morador não encontrado nesta república.");
  if (alvo.organizador) {
    throw new ErroDeValidacao("O organizador não pode marcar a própria saída.");
  }
  if (alvo.saiuEm) throw new ErroDeValidacao("Este morador já saiu da casa.");
  return alvo;
}
