import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatarReais } from "./formatarReais";
import { centavosParaTexto } from "./NovaDespesa";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Uma linha de GET /api/republicas/:id/saldos/transferencias (D5). */
type Transferencia = {
  pagador: { id: number; nome: string };
  recebedor: { id: number; nome: string };
  valorCentavos: number;
};

/**
 * Sugestão de acertos que zera os saldos (D5). "Registrar" abre o formulário
 * de pagamento (D3) já preenchido; o pagamento só vale depois de salvo lá.
 */
export default function SugestaoAcertos() {
  const { republica } = useRepublicaAtual();
  const foraDoAr = useApiForaDoAr();
  const [sugestao, setSugestao] = useState<Transferencia[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/saldos/transferencias`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Transferencia[]>;
      })
      .then((lista) => {
        if (ativo) setSugestao(lista);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [republica.id]);

  return (
    <section>
      <h2>Como acertar</h2>
      {erro ? (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar a sugestão de acertos.
        </p>
      ) : sugestao === null ? (
        <p>Carregando sugestão…</p>
      ) : sugestao.length === 0 ? (
        <p className="lista-vazia">Ninguém deve nada: a casa está em dia.</p>
      ) : (
        <>
          <p className="dica-sugestao">
            Sugestão com poucas transferências para deixar todo mundo em dia.
          </p>
          <ul className="acertos">
            {sugestao.map((t) => (
              <li key={`${t.pagador.id}-${t.recebedor.id}`} className="cartao acerto sugestao">
                <span>
                  <strong>{t.pagador.nome}</strong> paga{" "}
                  <strong>{formatarReais(t.valorCentavos)}</strong> para{" "}
                  <strong>{t.recebedor.nome}</strong>
                </span>
                {!foraDoAr && (
                  <Link
                    to="/saldos/pagamento"
                    state={{
                      pagadorId: String(t.pagador.id),
                      recebedorId: String(t.recebedor.id),
                      valor: centavosParaTexto(t.valorCentavos),
                    }}
                    className="botao-secundario"
                  >
                    Registrar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
