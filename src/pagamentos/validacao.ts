import { ErroDeValidacao } from "../erros";
import { comoTexto } from "../despesas/montagem";
import { interpretaData, interpretaId, reaisParaCentavos } from "../despesas/validacao";

export type EntradaPagamento = {
  pagadorId?: unknown;
  recebedorId?: unknown;
  valor?: unknown;
  data?: unknown;
};

export type PagamentoMontado = {
  pagadorId: number;
  recebedorId: number;
  valorCentavos: number;
  data: Date;
};

/**
 * Valida um acerto entre moradores (D3), sem tocar no banco: quem pagou, para
 * quem, quanto e quando. Os dois precisam ser da casa e diferentes. Valor maior
 * que a dívida é aceito; quem avisa é a tela, porque o saldo pode mudar.
 */
export function montaPagamento(
  entrada: EntradaPagamento,
  idsDaCasa: number[],
  hoje: Date = new Date(),
): PagamentoMontado {
  const pagadorId = interpretaId(entrada.pagadorId, "Id de quem pagou");
  const recebedorId = interpretaId(entrada.recebedorId, "Id de quem recebeu");
  for (const id of [pagadorId, recebedorId]) {
    if (!idsDaCasa.includes(id)) {
      throw new ErroDeValidacao(`O morador ${id} não é desta república.`);
    }
  }
  if (pagadorId === recebedorId) {
    throw new ErroDeValidacao("Não dá para registrar um pagamento para si mesmo.");
  }
  const valorCentavos = reaisParaCentavos(comoTexto(entrada.valor, "Valor"));
  const data = interpretaData(comoTexto(entrada.data, "Data"), hoje);
  return { pagadorId, recebedorId, valorCentavos, data };
}
