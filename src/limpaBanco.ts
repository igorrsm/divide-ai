import type { PrismaClient } from "./generated/prisma/client";

/**
 * Apaga todos os dados, na ordem inversa das chaves estrangeiras, e reinicia
 * o autoincremento, para o próximo registro de cada tabela nascer com id 1.
 * Usada pelo seed e pela limpeza do banco de teste; ao criar um model novo,
 * inclua-o aqui.
 */
export async function limpaBanco(cliente: PrismaClient) {
  await cliente.participacao.deleteMany();
  await cliente.despesaRecorrente.deleteMany();
  await cliente.despesa.deleteMany();
  await cliente.pagamento.deleteMany();
  await cliente.convite.deleteMany();
  await cliente.morador.deleteMany();
  await cliente.republica.deleteMany();
  await cliente.$executeRawUnsafe("DELETE FROM sqlite_sequence");
}
