import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatarPercentual, TITULO_DIVISAO } from "./divisao";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";
import { useMoradorAtual } from "./MoradorAtual";
import { textoRecorrencia } from "./recorrencia";
import { useRepublicaAtual } from "./RepublicaAtual";
import Voltar, { useOrigem } from "./Voltar";

/** Resposta de GET /api/republicas/:id/despesas/:despesaId. */
type Detalhe = {
  descricao: string;
  valorCentavos: number;
  data: string;
  tipoDivisao: "IGUAL" | "VALOR" | "PERCENTUAL";
  pagador: { id: number; nome: string };
  participacoes: {
    valorCentavos: number;
    percentualCentesimos: number | null;
    morador: { id: number; nome: string };
  }[];
  /** C1: null quando é avulsa. */
  recorrencia: { diaDoMes: number } | null;
};

/** Editar e excluir (B6): só aparecem para quem pagou a despesa. */
type PropsAcoes = {
  id: string;
  moradorId: number;
  origem: string | null;
  /** C1: mostra "Parar de repetir" quando a despesa se repete. */
  recorrente: boolean;
  aoPararDeRepetir: () => void;
};

function AcoesDespesa({ id, moradorId, origem, recorrente, aoPararDeRepetir }: PropsAcoes) {
  const navigate = useNavigate();
  const { republica } = useRepublicaAtual();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [parando, setParando] = useState(false);

  async function pararDeRepetir() {
    setParando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/despesas/${id}/recorrencia`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moradorId }),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setErro(corpo.erro ?? "Não foi possível parar de repetir.");
        return;
      }
      aoPararDeRepetir();
    } catch {
      setErro("A API não respondeu.");
    } finally {
      setParando(false);
    }
  }

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/despesas/${id}`, {
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
          <p id="confirma-exclusao">
            Tem certeza que quer excluir esta despesa? Ela sumirá da lista de despesas e do
            saldo dos moradores envolvidos.
          </p>
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
          {/* Leva a origem junto, para o Voltar continuar certo depois de salvar. */}
          <Link
            to={`/despesas/${id}/editar`}
            state={origem ? { voltarPara: origem } : undefined}
            className="botao-secundario"
          >
            Editar
          </Link>
          {recorrente && (
            <button
              type="button"
              className="botao-secundario"
              onClick={pararDeRepetir}
              disabled={parando}
            >
              {parando ? "Parando..." : "Parar de repetir"}
            </button>
          )}
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
  const { republica } = useRepublicaAtual();
  const [despesa, setDespesa] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const { moradorId } = useMoradorAtual();
  // Tela de onde a pessoa veio (lista filtrada ou extrato). Aberto por um
  // link colado, não há origem e o Voltar vai para a lista.
  const origem = useOrigem();
  const voltarPara = origem ?? "/despesas";

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/despesas/${id}`)
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
  }, [republica.id, id]);

  const quantos = despesa?.participacoes.length ?? 0;

  return (
    <>
      <Voltar para={voltarPara} />
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
            {despesa.recorrencia && (
              <span className="recorrencia">↻ {textoRecorrencia(despesa.recorrencia.diaDoMes)}</span>
            )}
          </div>
          {aviso && (
            <p role="status" className="aviso aviso-ok">
              {aviso}
            </p>
          )}

          {quantos === 0 ? (
            // Despesas lançadas antes da B2 não têm participações.
            <p className="lista-vazia">Esta despesa foi lançada sem divisão registrada.</p>
          ) : (
            <section className="rateio">
              <h2>
                {TITULO_DIVISAO[despesa.tipoDivisao]} entre{" "}
                {quantos} {quantos > 1 ? "moradores" : "morador"}
              </h2>
              <ul className="rateio-lista">
                {despesa.participacoes.map(({ morador, valorCentavos, percentualCentesimos }) => {
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
                        {/* Na divisão por percentual (B5), o % ao lado do nome. */}
                        {percentualCentesimos !== null && (
                          <small className="rateio-percentual">
                            {" "}
                            · {formatarPercentual(percentualCentesimos)}%
                          </small>
                        )}
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
            <AcoesDespesa
              id={id}
              moradorId={moradorId}
              origem={origem}
              recorrente={despesa.recorrencia !== null}
              aoPararDeRepetir={() => {
                setDespesa({ ...despesa, recorrencia: null });
                setAviso("Esta despesa não se repete mais. O histórico dela continua salvo.");
              }}
            />
          )}
        </>
      )}
    </>
  );
}
