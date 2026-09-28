import { ErroDeValidacao } from "../erros";

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida o nome da república, que não pode ser vazio. */
export function interpretaNomeRepublica(entrada: unknown): string {
  if (typeof entrada !== "string" && typeof entrada !== "number") {
    throw new ErroDeValidacao("Nome da república é obrigatório.");
  }
  const nome = String(entrada).trim();
  if (nome === "") {
    throw new ErroDeValidacao("Nome da república é obrigatório.");
  }
  return nome;
}

/** Valida o nome do morador/organizador, que não pode ser vazio. */
export function interpretaNomeOrganizador(entrada: unknown): string {
  if (typeof entrada !== "string" && typeof entrada !== "number") {
    throw new ErroDeValidacao("Nome do organizador é obrigatório.");
  }
  const nome = String(entrada).trim();
  if (nome === "") {
    throw new ErroDeValidacao("Nome do organizador é obrigatório.");
  }
  return nome;
}

/** Valida o e-mail, exigindo formato com @ e domínio. Converte para minúsculas. */
export function interpretaEmail(entrada: unknown): string {
  if (typeof entrada !== "string") {
    throw new ErroDeValidacao("E-mail é obrigatório.");
  }
  const email = entrada.trim().toLowerCase();
  if (email === "") {
    throw new ErroDeValidacao("E-mail é obrigatório.");
  }
  if (!PADRAO_EMAIL.test(email)) {
    throw new ErroDeValidacao("E-mail inválido.");
  }
  return email;
}
