import { Link } from "react-router-dom";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";

/** Resposta de GET /api/republicas/:id/extrato?mes=AAAA-MM (E1). */
export type DadosExtrato = {
  mes: string;
  totalCentavos: number;
  moradores: { id: number; nome: string; aPagarCentavos: number; pagoCentavos: number }[];
  despesas: {
    id: number;
    descricao: string;
    valorCentavos: number;
    data: string;
    pagador: { id: number; nome: string };
  }[];
};

type Props = { extrato: DadosExtrato; moradorId: number | null };

/**
 * Números de um mês do extrato. "A pagar" é a parte do morador nas despesas
 * do mês; "Pago" é o que ele adiantou. A diferença entre os dois é o que o
 * mês mexeu no saldo dele.
 */
export default function ConteudoExtrato({ extrato, moradorId }: Props) {
  return (
    <>
      <div className="cartao total-casa">
        <span>Total da casa</span>
        <strong>{formatarReais(extrato.totalCentavos)}</strong>
      </div>

      <h2>Por morador</h2>
      <ul className="saldos">
        {extrato.moradores.map((morador) => {
          const eu = morador.id === moradorId;
          return (
            <li key={morador.id} className={eu ? "cartao saldo saldo-eu" : "cartao saldo"}>
              <span className={`inicial inicial-${morador.id % 4}`} aria-hidden="true">
                {morador.nome.charAt(0)}
              </span>
              <span className="saldo-nome">
                {morador.nome}
                {eu && <small> (você)</small>}
              </span>
              <dl className="extrato-valores">
                <dt>A pagar</dt>
                <dd>{formatarReais(morador.aPagarCentavos)}</dd>
                <dt>Pago</dt>
                <dd>{formatarReais(morador.pagoCentavos)}</dd>
              </dl>
            </li>
          );
        })}
      </ul>

      <h2>Despesas do mês</h2>
      {extrato.despesas.length === 0 ? (
        <p className="lista-vazia">Nenhuma despesa lançada neste mês.</p>
      ) : (
        <ul className="despesas">
          {extrato.despesas.map((despesa) => (
            <li key={despesa.id}>
              <Link to={`/despesas/${despesa.id}`} className="cartao despesa">
                <span className={`inicial inicial-${despesa.pagador.id % 4}`} aria-hidden="true">
                  {despesa.pagador.nome.charAt(0)}
                </span>
                <span className="despesa-texto">
                  <strong>{despesa.descricao}</strong>
                  <small>
                    {despesa.pagador.nome} pagou · {formatarData(despesa.data)}
                  </small>
                </span>
                <strong className="despesa-valor">{formatarReais(despesa.valorCentavos)}</strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
