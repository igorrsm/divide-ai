import { formatarReais } from "./formatarReais";

/**
 * Aviso de valor maior que a dívida (D3). O pagamento é aceito mesmo assim;
 * a tela só avisa antes de salvar. `saldoPagador` vem do painel de saldos:
 * negativo é quanto ele deve.
 */
export function avisoDeValor(
  valorCentavos: number | null,
  saldoPagador: number | undefined,
  nomePagador: string,
): string | null {
  if (valorCentavos === null || saldoPagador === undefined) return null;
  const deve = saldoPagador < 0 ? -saldoPagador : 0;
  if (deve === 0) {
    return `${nomePagador} não está devendo nada. O pagamento vai ser registrado mesmo assim.`;
  }
  if (valorCentavos > deve) {
    return (
      `${nomePagador} deve ${formatarReais(deve)}. ` +
      "Esse valor passa da dívida, e o pagamento vai ser registrado mesmo assim."
    );
  }
  return null;
}
