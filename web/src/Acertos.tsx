import { useEffect, useState } from "react";
import { formatarData } from "./formatarData";
import { formatarReais } from "./formatarReais";
import { useRepublicaAtual } from "./RepublicaAtual";

/** Uma linha de GET /api/republicas/:id/pagamentos (D3). */
type Acerto = {
  id: number;
  valorCentavos: number;
  data: string;
  pagador: { id: number; nome: string };
  recebedor: { id: number; nome: string };
};

/** Lista dos acertos já registrados, do mais recente para o mais antigo (D3). */
export default function Acertos() {
  const { republica } = useRepublicaAtual();
  const [acertos, setAcertos] = useState<Acerto[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/pagamentos`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Acerto[]>;
      })
      .then((lista) => {
        if (ativo) setAcertos(lista);
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
      <h2>Acertos registrados</h2>
      {erro ? (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar os acertos.
        </p>
      ) : acertos === null ? (
        <p>Carregando acertos…</p>
      ) : acertos.length === 0 ? (
        <p className="lista-vazia">Nenhum acerto registrado ainda.</p>
      ) : (
        <ul className="acertos">
          {acertos.map((acerto) => (
            <li key={acerto.id} className="cartao acerto">
              <span>
                {acerto.pagador.nome} pagou para {acerto.recebedor.nome}
                <small>{formatarData(acerto.data)}</small>
              </span>
              <strong>{formatarReais(acerto.valorCentavos)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
