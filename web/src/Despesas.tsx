import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [despesas, setDespesas] = useState<ItemDespesa[] | null>(null);
  const [erro, setErro] = useState(false);
  const foraDoAr = useApiForaDoAr();
  // Aviso deixado por outra tela, como "Despesa excluída." (B6).
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso;

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/despesas`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<ItemDespesa[]>;
      })
      .then((lista) => {
        if (ativo) setDespesas(lista);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

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
      <Link to="/extrato" className="botao-secundario link-extrato">
        Ver extrato do mês
      </Link>

      {aviso && (
        <p role="status" className="aviso aviso-ok">
          {aviso}
        </p>
      )}

      {erro ? (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar as despesas.
        </p>
      ) : despesas === null ? (
        <p>Carregando despesas…</p>
      ) : despesas.length === 0 ? (
        <p className="lista-vazia">Nenhuma despesa lançada ainda.</p>
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
