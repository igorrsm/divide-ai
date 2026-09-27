import { useEffect, useState } from "react";
import { formatarReais } from "./formatarReais";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

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

/** Painel de saldos (D2): quanto cada morador tem a receber ou deve. */
export default function Saldos() {
  const [saldos, setSaldos] = useState<Saldo[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/saldos`)
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
  }, []);

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
      <h1>Como está a casa</h1>
      <ul className="saldos">
        {saldos.map((saldo) => (
          <li key={saldo.moradorId} className="cartao saldo">
            <span className={`inicial inicial-${saldo.moradorId % 4}`} aria-hidden="true">
              {saldo.nome.charAt(0)}
            </span>
            <span className="saldo-nome">{saldo.nome}</span>
            <span className={`saldo-valor ${CLASSE_VALOR[saldo.situacao]}`}>
              <strong>{valorComSinal(saldo.saldoCentavos)}</strong>
              <small>{saldo.situacao}</small>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
