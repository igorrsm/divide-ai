import type { SaldoMorador } from "./calculo";

/** Um acerto sugerido: no mesmo formato da lista de pagamentos (D3). */
export type Transferencia = {
  pagador: { id: number; nome: string };
  recebedor: { id: number; nome: string };
  valorCentavos: number;
};

type Pendente = { id: number; nome: string; centavos: number };

/** O maior valor; no empate, o menor id, para a sugestão não depender da ordem. */
function maior(lista: Pendente[]): Pendente {
  return lista.reduce((a, b) =>
    b.centavos > a.centavos || (b.centavos === a.centavos && b.id < a.id) ? b : a,
  );
}

/**
 * Sugestão de acertos que zera todos os saldos (D5).
 *
 * Guloso: o maior devedor paga ao maior credor o menor dos dois valores, e
 * repete. Cada passo zera pelo menos um dos dois, então são no máximo N − 1
 * transferências para N moradores com saldo. Não promete o mínimo absoluto
 * (achar o mínimo é um problema difícil); por isso a tela fala em "sugestão".
 * Como a soma dos saldos é zero, devedores e credores acabam juntos.
 */
export function sugerirTransferencias(saldos: SaldoMorador[]): Transferencia[] {
  const devedores: Pendente[] = saldos
    .filter((s) => s.saldoCentavos < 0)
    .map((s) => ({ id: s.moradorId, nome: s.nome, centavos: -s.saldoCentavos }));
  const credores: Pendente[] = saldos
    .filter((s) => s.saldoCentavos > 0)
    .map((s) => ({ id: s.moradorId, nome: s.nome, centavos: s.saldoCentavos }));

  const transferencias: Transferencia[] = [];
  while (devedores.length > 0 && credores.length > 0) {
    const devedor = maior(devedores);
    const credor = maior(credores);
    const valorCentavos = Math.min(devedor.centavos, credor.centavos);
    transferencias.push({
      pagador: { id: devedor.id, nome: devedor.nome },
      recebedor: { id: credor.id, nome: credor.nome },
      valorCentavos,
    });
    devedor.centavos -= valorCentavos;
    credor.centavos -= valorCentavos;
    if (devedor.centavos === 0) devedores.splice(devedores.indexOf(devedor), 1);
    if (credor.centavos === 0) credores.splice(credores.indexOf(credor), 1);
  }
  return transferencias;
}
