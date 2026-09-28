import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";
import { useMoradorAtual } from "./MoradorAtual";

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

/** Editar e excluir (B6): só aparecem para quem pagou a despesa. */
function AcoesDespesa({ id, moradorId }: { id: string; moradorId: number }) {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/republicas/${REPUBLICA_ID}/despesas/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moradorId }),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setErro(corpo.erro ?? "Não foi possível excluir a despesa.");
        return;
      }
      navigate("/despesas", { state: { aviso: "Despesa excluída." } });
    } catch {
      setErro("A API não respondeu.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section className="acoes-despesa">
      {confirmando ? (
        <div className="cartao confirmacao" role="alertdialog" aria-labelledby="confirma-exclusao">
          <p id="confirma-exclusao">Excluir esta despesa? Ela some da lista e do saldo.</p>
          <div className="acoes-botoes">
            <button
              type="button"
              className="botao-secundario botao-perigo"
              onClick={excluir}
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Confirmar exclusão"}
            </button>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setConfirmando(false)}
              disabled={excluindo}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="acoes-botoes">
          <Link to={`/despesas/${id}/editar`} className="botao-secundario">
            Editar
          </Link>
          <button
            type="button"
            className="botao-secundario botao-perigo"
            onClick={() => setConfirmando(true)}
          >
            Excluir
          </button>
        </div>
      )}
      {erro && (
        <p role="status" className="aviso aviso-erro">
          {erro}
        </p>
      )}
    </section>
  );
}

/** Uma despesa com o rateio por morador (B3). */
export default function DetalheDespesa() {
  const { id } = useParams();
  const [despesa, setDespesa] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const { moradorId } = useMoradorAtual();

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
      <Link to="/despesas" className="voltar">
        <span aria-hidden="true">←</span> Voltar
      </Link>
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
                {despesa.participacoes.map(({ morador, valorCentavos }) => {
                  // "(você, pagou)" quando é a mesma pessoa, em vez de dois parênteses.
                  const marcas = [
                    morador.id === moradorId && "você",
                    morador.id === despesa.pagador.id && "pagou",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const conteudo = (
                    <>
                      <span>
                        {morador.nome}
                        {marcas && <small> ({marcas})</small>}
                      </span>
                      <strong>{formatarReais(valorCentavos)}</strong>
                    </>
                  );
                  // Só a linha de quem está usando o app é clicável e leva ao
                  // saldo dessa pessoa; as dos outros moradores ficam fixas.
                  return morador.id === moradorId ? (
                    <li key={morador.id}>
                      <Link to="/saldos" className="cartao rateio-item rateio-eu">
                        {conteudo}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ) : (
                    <li key={morador.id} className="cartao rateio-item">
                      {conteudo}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {id && moradorId === despesa.pagador.id && (
            <AcoesDespesa id={id} moradorId={moradorId} />
          )}
        </>
      )}
    </>
  );
}
