import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

/** Resposta de GET /api/republicas/:id/despesas/:despesaId. */
type Detalhe = {
  descricao: string;
  valorCentavos: number;
  data: string;
  tipoDivisao: "IGUAL" | "VALOR" | "PERCENTUAL";
  pagador: { id: number; nome: string };
  participacoes: { valorCentavos: number; morador: { id: number; nome: string } }[];
};

/** Uma despesa com o rateio por morador (B3). */
export default function DetalheDespesa() {
  const { id } = useParams();
  const [despesa, setDespesa] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/despesas/${id}`)
      .then(async (resposta) => {
        if (resposta.status === 404 || resposta.status === 400) {
          throw new Error("Despesa não encontrada.");
        }
        if (!resposta.ok) throw new Error("Não foi possível carregar a despesa.");
        return resposta.json() as Promise<Detalhe>;
      })
      .then((dados) => {
        if (ativo) setDespesa(dados);
      })
      .catch((motivo: Error) => {
        if (ativo) setErro(motivo.message);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  const quantos = despesa?.participacoes.length ?? 0;

  return (
    <>
      <p>
        <Link to="/despesas">Voltar</Link>
      </p>
      {erro ? (
        <p role="status" className="aviso aviso-erro">
          {erro}
        </p>
      ) : despesa === null ? (
        <p>Carregando despesa…</p>
      ) : (
        <>
          <h1>{despesa.descricao}</h1>
          <div className="cartao detalhe-despesa">
            <strong>{formatarReais(despesa.valorCentavos)}</strong>
            <span>
              {despesa.pagador.nome} pagou em {formatarData(despesa.data)}
            </span>
          </div>

          {quantos === 0 ? (
            // Despesas lançadas antes da B2 não têm participações.
            <p className="lista-vazia">Esta despesa foi lançada sem divisão registrada.</p>
          ) : (
            <section className="rateio">
              <h2>
                {despesa.tipoDivisao === "IGUAL" ? "Dividida por igual" : "Dividida"} entre{" "}
                {quantos} {quantos > 1 ? "moradores" : "morador"}
              </h2>
              <ul className="rateio-lista">
                {despesa.participacoes.map(({ morador, valorCentavos }) => (
                  <li key={morador.id} className="cartao rateio-item">
                    <span>
                      {morador.nome}
                      {morador.id === despesa.pagador.id && <small> (pagou)</small>}
                    </span>
                    <strong>{formatarReais(valorCentavos)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
