import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ConteudoExtrato, { type DadosExtrato } from "./ConteudoExtrato";
import { hojeNaCasa } from "./diasDoMes";
import GerarRecorrentes from "./GerarRecorrentes";
import { formatarMes, mesVizinho } from "./mes";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";
import Voltar from "./Voltar";

const PADRAO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Extrato do mês (E1): total da casa, total por morador e as despesas. */
export default function Extrato() {
  const [parametros] = useSearchParams();
  // Mês de hoje no calendário da casa, como a API faz sem o parâmetro.
  const hoje = hojeNaCasa().slice(0, 7);
  // O mês fica na URL, para o Voltar do navegador voltar ao mês anterior.
  const bruto = parametros.get("mes") ?? "";
  const mes = PADRAO_MES.test(bruto) ? bruto : hoje;
  const [extrato, setExtrato] = useState<DadosExtrato | null>(null);
  const [erro, setErro] = useState(false);
  // Sobe depois de gerar as recorrentes (C2), para buscar o extrato de novo.
  const [versao, setVersao] = useState(0);
  const { moradorId } = useMoradorAtual();
  const { republica } = useRepublicaAtual();
  const foraDoAr = useApiForaDoAr();

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/extrato?mes=${mes}`)
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
  }, [republica.id, mes, versao]);

  // Enquanto o mês novo não chega, não mostra os números do mês anterior.
  const doMes = extrato?.mes === mes ? extrato : null;

  return (
    <>
      <Voltar para="/despesas" />
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
      {/* key: o aviso de um mês não fica aparecendo no outro. */}
      <GerarRecorrentes key={mes} mes={mes} aoGerar={() => setVersao((v) => v + 1)} />
      {/* Fechamento em CSV (E3): o navegador baixa o arquivo direto da API. */}
      {foraDoAr ? (
        <button type="button" className="botao-secundario exportar" disabled>
          ⬇ Exportar CSV
        </button>
      ) : (
        <a
          href={`/api/republicas/${republica.id}/extrato/csv?mes=${mes}`}
          download={`fechamento-${mes}.csv`}
          className="botao-secundario exportar"
        >
          ⬇ Exportar CSV
        </a>
      )}

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
