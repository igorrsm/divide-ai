import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpa na ordem inversa das dependências, para o seed poder rodar várias vezes
  await prisma.participacao.deleteMany();
  await prisma.despesaRecorrente.deleteMany();
  await prisma.despesa.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.morador.deleteMany();
  await prisma.republica.deleteMany();

  const rep = await prisma.republica.create({ data: { nome: "República Demo" } });

  const ana = await prisma.morador.create({
    data: { nome: "Ana", email: "ana@exemplo.com", republicaId: rep.id },
  });
  const bruno = await prisma.morador.create({
    data: { nome: "Bruno", email: "bruno@exemplo.com", republicaId: rep.id },
  });
  const carla = await prisma.morador.create({
    data: { nome: "Carla", email: "carla@exemplo.com", republicaId: rep.id },
  });

  // Despesa 1: aluguel dividido por todos, marcada como recorrente
  await prisma.despesa.create({
    data: {
      descricao: "Aluguel",
      valorCentavos: 240000, // R$ 2.400,00
      data: new Date("2026-09-05"),
      categoria: "ALUGUEL",
      tipoDivisao: "IGUAL",
      republicaId: rep.id,
      pagadorId: ana.id,
      participacoes: {
        create: [
          { moradorId: ana.id, valorCentavos: 80000 },
          { moradorId: bruno.id, valorCentavos: 80000 },
          { moradorId: carla.id, valorCentavos: 80000 },
        ],
      },
      recorrente: { create: { diaDoMes: 5 } },
    },
  });

  // Despesa 2: mercado dividido só entre Bruno e Carla
  await prisma.despesa.create({
    data: {
      descricao: "Compra do mês no mercado",
      valorCentavos: 15000, // R$ 150,00
      data: new Date("2026-09-10"),
      categoria: "MERCADO",
      tipoDivisao: "IGUAL",
      republicaId: rep.id,
      pagadorId: bruno.id,
      participacoes: {
        create: [
          { moradorId: bruno.id, valorCentavos: 7500 },
          { moradorId: carla.id, valorCentavos: 7500 },
        ],
      },
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());