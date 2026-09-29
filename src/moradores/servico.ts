import { prisma } from "../db";
import { diaDa } from "../despesas/dia";
import { hojeNaCasa, interpretaId } from "../despesas/validacao";
import { ErroDeValidacao, ErroSemPermissao } from "../erros";
import { montaMorador, validaSaida, type EntradaMorador } from "./validacao";

/**
 * Só o organizador adiciona moradores (A2, decisão da Thalita). Sem login,
 * quem está usando é o morador de "Quem é você?", que a tela manda como
 * moradorId: é uma trava de uso, como a da B6, não de segurança.
 */
async function exigeOrganizador(
  republicaId: number,
  moradorId: unknown,
  acao = "adicionar moradores",
) {
  if (moradorId === undefined || moradorId === null || moradorId === "") {
    throw new ErroDeValidacao(`Escolha quem você é em "Quem é você?" antes de ${acao}.`);
  }
  const id = interpretaId(moradorId, "Id de quem está usando o app");
  const quem = await prisma.morador.findFirst({
    where: { id, republicaId },
    select: { organizador: true },
  });
  if (!quem?.organizador) {
    throw new ErroSemPermissao(`Só o organizador pode ${acao}.`);
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

/**
 * Marca que o morador saiu da casa (A4): só o organizador. Nada é apagado;
 * a data de saída tira o morador das escolhas de despesa nova, e ele continua
 * no histórico e no saldo enquanto houver o que acertar.
 */
export async function marcarSaida(
  republicaId: number,
  alvoId: number,
  moradorId: unknown,
  hoje: Date = new Date(),
) {
  await exigeOrganizador(republicaId, moradorId, "marcar a saída de um morador");
  const alvo = validaSaida(
    await prisma.morador.findFirst({
      where: { id: alvoId, republicaId },
      select: { id: true, organizador: true, saiuEm: true },
    }),
  );
  const saiu = await prisma.morador.update({
    where: { id: alvo.id },
    // Meia-noite UTC do dia da casa, como as datas das despesas.
    data: { saiuEm: new Date(`${hojeNaCasa(hoje)}T00:00:00.000Z`) },
    select: { id: true, nome: true, saiuEm: true },
  });
  return { ...saiu, saiuEm: diaDa(saiu.saiuEm!) };
}
