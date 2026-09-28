import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import CartaoFiltros, { type Filtros } from "./CartaoFiltros";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";
import { useApiForaDoAr } from "./StatusApi";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

/** Uma linha de GET /api/republicas/:id/despesas. */
type ItemDespesa = {
  id: number;
  descricao: string;
  valorCentavos: number;
  data: string;
  pagador: { id: number; nome: string };
};

/** Lista de despesas da república (B3), da mais recente para a mais antiga. */
export default function Despesas() {
  // Os filtros (E2) ficam na URL: recarregar ou voltar mantém a escolha.
  const [parametros, setParametros] = useSearchParams();
  const filtros: Filtros = {
    de: parametros.get("de") ?? "",
    ate: parametros.get("ate") ?? "",
    moradorId: parametros.get("moradorId") ?? "",
  };
  const consulta = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== ""),
  ).toString();
  const ativos = consulta === "" ? 0 : consulta.split("&").length;
  const [abertos, setAbertos] = useState(false);
  // A lista guarda de qual consulta veio, para não mostrar a anterior.
  const [resultado, setResultado] = useState<{ consulta: string; lista: ItemDespesa[] } | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);
  const foraDoAr = useApiForaDoAr();
  // Aviso deixado por outra tela, como "Despesa excluída." (B6).
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso;

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/despesas${consulta ? `?${consulta}` : ""}`)
      .then(async (resposta) => {
        if (!resposta.ok) {
          const corpo = await resposta.json().catch(() => ({}));
          throw new Error(corpo.erro ?? "Não foi possível carregar as despesas.");
        }
        return resposta.json() as Promise<ItemDespesa[]>;
      })
      .then((lista) => {
        if (ativo) {
          setResultado({ consulta, lista });
          setErro(null);
        }
      })
      .catch((falha: Error) => {
        if (ativo) setErro(falha.message);
      });
    return () => {
      ativo = false;
    };
  }, [consulta]);

  const despesas = resultado?.consulta === consulta ? resultado.lista : null;
  const total = despesas?.reduce((soma, despesa) => soma + despesa.valorCentavos, 0) ?? 0;

  function aplicar(novos: Filtros) {
    setParametros(Object.entries(novos).filter(([, valor]) => valor !== ""));
    setAbertos(false);
  }

  return (
    <>
      <h1>Despesas</h1>
      {foraDoAr ? (
        <button type="button" className="botao-principal" disabled>
          Lançar despesa
        </button>
      ) : (
        <Link to="/despesas/nova" className="botao-principal">
          Lançar despesa
        </Link>
      )}
      <Link to="/extrato" className="botao-principal link-extrato">
        Ver extrato do mês
      </Link>

      {aviso && (
        <p role="status" className="aviso aviso-ok">
          {aviso}
        </p>
      )}

      <button
        type="button"
        className="botao-secundario botao-filtrar"
        aria-expanded={abertos}
        onClick={() => setAbertos(!abertos)}
      >
        {ativos > 0 ? `Filtrar despesas (${ativos})` : "Filtrar despesas"}
      </button>
      {abertos && (
        <CartaoFiltros
          filtros={filtros}
          aoAplicar={aplicar}
          aoLimpar={() => aplicar({ de: "", ate: "", moradorId: "" })}
        />
      )}
      {ativos > 0 && despesas && despesas.length > 0 && (
        <p role="status" className="resumo-filtro">
          {despesas.length} {despesas.length === 1 ? "despesa" : "despesas"} ·{" "}
          {formatarReais(total)}
        </p>
      )}

      {erro ? (
        <p role="status" className="aviso aviso-erro">
          {erro}
        </p>
      ) : despesas === null ? (
        <p>Carregando despesas…</p>
      ) : despesas.length === 0 ? (
        <p className="lista-vazia">
          {ativos > 0 ? "Nenhuma despesa com esses filtros." : "Nenhuma despesa lançada ainda."}
        </p>
      ) : (
        <ul className="despesas">
          {despesas.map((despesa) => (
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
