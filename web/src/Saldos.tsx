import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Acertos from "./Acertos";
import { formatarReais } from "./formatarReais";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Uma linha de GET /api/republicas/:id/saldos (D1). */
type Saldo = {
  moradorId: number;
  nome: string;
  saldoCentavos: number;
  situacao: "a receber" | "a pagar" | "quitado";
};

const CLASSE_VALOR = {
  "a receber": "valor-receber",
  "a pagar": "valor-pagar",
  quitado: "valor-quitado",
} as const;

/** "+ R$ 1.600,00", "− R$ 725,00" ou "R$ 0,00": o sinal não depende da cor. */
function valorComSinal(centavos: number): string {
  const sinal = centavos > 0 ? "+ " : centavos < 0 ? "− " : "";
  return sinal + formatarReais(Math.abs(centavos));
}

const FRASE_RESUMO = {
  "a receber": "você tem a receber",
  "a pagar": "você deve",
  quitado: "você está em dia",
} as const;

/** Resumo do morador escolhido em "Quem é você?" (A3), no topo do painel. */
function Resumo({ saldo }: { saldo: Saldo | undefined }) {
  if (!saldo) {
    return <p className="dica-saldo">Escolha quem você é no topo para ver o seu saldo.</p>;
  }
  return (
    <div className={`cartao resumo ${CLASSE_VALOR[saldo.situacao]}`}>
      <span>
        {saldo.nome}, {FRASE_RESUMO[saldo.situacao]}
      </span>
      {saldo.situacao !== "quitado" && (
        <strong>{formatarReais(Math.abs(saldo.saldoCentavos))}</strong>
      )}
    </div>
  );
}

/** Painel de saldos (D2): quanto cada morador tem a receber ou deve. */
export default function Saldos() {
  const { republica } = useRepublicaAtual();
  const [saldos, setSaldos] = useState<Saldo[] | null>(null);
  const [erro, setErro] = useState(false);
  const { moradorId } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  // "Pagamento registrado." (D3) aparece uma vez e sai do histórico, como o
  // aviso de despesa excluída.
  const local = useLocation();
  const navigate = useNavigate();
  const [aviso] = useState((local.state as { aviso?: string } | null)?.aviso);
  useEffect(() => {
    if ((local.state as { aviso?: string } | null)?.aviso) {
      navigate(local.pathname, { replace: true, state: null });
    }
  }, [local, navigate]);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/saldos`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Saldo[]>;
      })
      .then((lista) => {
        if (ativo) setSaldos(lista);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [republica.id]);

  if (erro) {
    return (
      <p role="status" className="aviso aviso-erro">
        Não foi possível carregar os saldos.
      </p>
    );
  }
  if (saldos === null) return <p>Carregando saldos…</p>;

  return (
    <>
      {/* O título vem antes do resumo, para leitor de tela anunciar a tela primeiro. */}
      <h1>Como está a casa</h1>
      {aviso && (
        <p role="status" className="aviso aviso-ok">
          {aviso}
        </p>
      )}
      <Resumo saldo={saldos.find((s) => s.moradorId === moradorId)} />
      {foraDoAr ? (
        <button type="button" className="botao-principal botao-pagamento" disabled>
          Registrar pagamento
        </button>
      ) : (
        <Link to="/saldos/pagamento" className="botao-principal botao-pagamento">
          Registrar pagamento
        </Link>
      )}
      <ul className="saldos">
        {saldos.map((saldo) => {
          const eu = saldo.moradorId === moradorId;
          return (
            <li key={saldo.moradorId} className={eu ? "cartao saldo saldo-eu" : "cartao saldo"}>
              <span className={`inicial inicial-${saldo.moradorId % 4}`} aria-hidden="true">
                {saldo.nome.charAt(0)}
              </span>
              <span className="saldo-nome">
                {saldo.nome}
                {eu && <small> (você)</small>}
              </span>
              <span className={`saldo-valor ${CLASSE_VALOR[saldo.situacao]}`}>
                <strong>{valorComSinal(saldo.saldoCentavos)}</strong>
                <small>{saldo.situacao}</small>
              </span>
            </li>
          );
        })}
      </ul>
      <Acertos />
    </>
  );
}
