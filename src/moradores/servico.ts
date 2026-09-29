import { prisma } from "../db";
import { diaDa } from "../despesas/dia";
import { hojeNaCasa, interpretaId } from "../despesas/validacao";
import { ErroDeValidacao, ErroSemPermissao } from "../erros";
import { randomUUID } from "node:crypto";
import { montaMorador, validaConvite, validaSaida, type EntradaMorador } from "./validacao";

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

/** Gera um link de convite de uso único (A5): só o organizador. */
export async function gerarConvite(republicaId: number, moradorId: unknown) {
  await exigeOrganizador(republicaId, moradorId, "gerar convites");
  // randomUUID é do próprio Node: 122 bits aleatórios, sem biblioteca nova.
  return prisma.convite.create({
    data: { token: randomUUID(), republicaId },
    select: { token: true },
  });
}

function buscaConvite(token: string) {
  return prisma.convite.findUnique({
    where: { token },
    select: { republicaId: true, usadoEm: true, republica: { select: { id: true, nome: true } } },
  });
}

/** O que a página do convite mostra antes do cadastro: o nome da casa. */
export async function consultaConvite(token: string) {
  const { republica } = validaConvite(await buscaConvite(token));
  return { republica };
}

/**
 * Quem recebeu o link completa o próprio cadastro (A5), com as regras da A2.
 * Marcar o convite como usado é uma atualização condicional, na mesma
 * transação da criação: dois envios ao mesmo tempo não criam dois moradores.
 */
export async function usarConvite(token: string, entrada: EntradaMorador) {
  const { republica } = validaConvite(await buscaConvite(token));
  const { nome, email } = montaMorador(entrada);
  if (await prisma.morador.findUnique({ where: { email } })) {
    throw new ErroDeValidacao("Já existe um morador com este e-mail.");
  }
  const morador = await prisma.$transaction(async (tx) => {
    const marcou = await tx.convite.updateMany({
      where: { token, usadoEm: null },
      data: { usadoEm: new Date() },
    });
    if (marcou.count === 0) throw new ErroDeValidacao("Este convite já foi usado.");
    return tx.morador.create({
      data: { nome, email, republicaId: republica.id },
      select: { id: true, nome: true },
    });
  });
  return { morador, republica };
}
