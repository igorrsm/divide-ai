import { prisma } from "../db";
import { interpretaId } from "../despesas/validacao";
import { ErroDeValidacao, ErroSemPermissao } from "../erros";
import { montaMorador, type EntradaMorador } from "./validacao";

/**
 * Só o organizador adiciona moradores (A2, decisão da Thalita). Sem login,
 * quem está usando é o morador de "Quem é você?", que a tela manda como
 * moradorId: é uma trava de uso, como a da B6, não de segurança.
 */
async function exigeOrganizador(republicaId: number, moradorId: unknown) {
  if (moradorId === undefined || moradorId === null || moradorId === "") {
    throw new ErroDeValidacao('Escolha quem você é em "Quem é você?" antes de adicionar moradores.');
  }
  const id = interpretaId(moradorId, "Id de quem está usando o app");
  const quem = await prisma.morador.findFirst({
    where: { id, republicaId },
    select: { organizador: true },
  });
  if (!quem?.organizador) {
    throw new ErroSemPermissao("Só o organizador pode adicionar moradores.");
  }
}

/** Adiciona um morador à república (A2). O e-mail não pode se repetir. */
export async function adicionarMorador(
  republicaId: number,
  entrada: EntradaMorador & { moradorId?: unknown },
) {
  await exigeOrganizador(republicaId, entrada.moradorId);
  const { nome, email } = montaMorador(entrada);
  // O e-mail é único no banco inteiro, como na criação da república (A1).
  if (await prisma.morador.findUnique({ where: { email } })) {
    throw new ErroDeValidacao("Já existe um morador com este e-mail.");
  }
  return prisma.morador.create({
    data: { nome, email, republicaId },
    select: { id: true, nome: true, email: true, organizador: true },
  });
}
