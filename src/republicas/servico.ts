import { prisma } from "../db";
import { ErroDeValidacao } from "../erros";
import {
  interpretaEmail,
  interpretaNomeOrganizador,
  interpretaNomeRepublica,
} from "./validacao";

export type EntradaNovaRepublica = {
  nome?: unknown;
  nomeOrganizador?: unknown;
  emailOrganizador?: unknown;
};

/** Busca os dados básicos de uma república pelo id. */
export function buscaRepublica(id: number) {
  return prisma.republica.findUnique({
    where: { id },
    select: { id: true, nome: true, criadaEm: true },
  });
}

/**
 * Cria uma nova república e seu primeiro morador como organizador (A1).
 *
 * A criação acontece em transação aninhada pelo Prisma: a república e o
 * organizador nascem juntos, garantindo que não exista república sem
 * organizador nem morador sem república.
 */
export async function criarRepublica(entrada: EntradaNovaRepublica) {
  const nome = interpretaNomeRepublica(entrada.nome);
  const nomeOrganizador = interpretaNomeOrganizador(entrada.nomeOrganizador);
  const emailOrganizador = interpretaEmail(entrada.emailOrganizador);

  const existente = await prisma.morador.findUnique({
    where: { email: emailOrganizador },
  });
  if (existente) {
    throw new ErroDeValidacao("Já existe um morador com este e-mail.");
  }

  return prisma.republica.create({
    data: {
      nome,
      moradores: {
        create: {
          nome: nomeOrganizador,
          email: emailOrganizador,
          organizador: true,
        },
      },
    },
    include: {
      moradores: {
        select: { id: true, nome: true, email: true, organizador: true },
      },
    },
  });
}
