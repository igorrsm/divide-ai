import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ConteudoExtrato, { type DadosExtrato } from "./ConteudoExtrato";
import { formatarMes, mesVizinho } from "./mes";
import { useMoradorAtual } from "./MoradorAtual";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

const PADRAO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Mês de hoje no calendário da casa, como a API faz sem o parâmetro. */
function mesDeHoje(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

/** Extrato do mês (E1): total da casa, total por morador e as despesas. */
export default function Extrato() {
  const [parametros] = useSearchParams();
  const hoje = mesDeHoje();
  // O mês fica na URL, para o Voltar do navegador voltar ao mês anterior.
  const bruto = parametros.get("mes") ?? "";
  const mes = PADRAO_MES.test(bruto) ? bruto : hoje;
  const [extrato, setExtrato] = useState<DadosExtrato | null>(null);
  const [erro, setErro] = useState(false);
  const { moradorId } = useMoradorAtual();

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/extrato?mes=${mes}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<DadosExtrato>;
      })
      .then((dados) => {
        if (ativo) {
          setExtrato(dados);
          setErro(false);
        }
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [mes]);

  // Enquanto o mês novo não chega, não mostra os números do mês anterior.
  const doMes = extrato?.mes === mes ? extrato : null;

  return (
    <>
      <Link to="/despesas" className="voltar">
        <span aria-hidden="true">←</span> Voltar
      </Link>
      <h1>Extrato do mês</h1>
      <nav className="navegacao-mes" aria-label="Escolher o mês">
        <Link to={`?mes=${mesVizinho(mes, -1)}`} className="seta-mes" aria-label="Mês anterior">
          ‹
        </Link>
        <strong aria-live="polite">{formatarMes(mes)}</strong>
        {mes < hoje ? (
          <Link to={`?mes=${mesVizinho(mes, 1)}`} className="seta-mes" aria-label="Mês seguinte">
            ›
          </Link>
        ) : (
          <span className="seta-mes seta-desativada" aria-hidden="true">
            ›
          </span>
        )}
      </nav>

      {erro ? (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar o extrato.
        </p>
      ) : doMes === null ? (
        <p>Carregando extrato…</p>
      ) : (
        <ConteudoExtrato extrato={doMes} moradorId={moradorId} />
      )}
    </>
  );
}
