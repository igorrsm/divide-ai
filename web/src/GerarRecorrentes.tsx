import { useState } from "react";
import { formatarData } from "./formatarData";
import { formatarMes } from "./mes";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Um lançamento de POST /api/republicas/:id/recorrentes/gerar (C2). */
type Lancamento = { id: number; descricao: string; data: string };

type Props = {
  /** Mês do extrato, em AAAA-MM. */
  mes: string;
  /** Recarrega o extrato depois de gerar. */
  aoGerar: () => void;
};

/**
 * Gera os lançamentos do mês a partir das despesas recorrentes (C2), por ação
 * explícita: não há agendador. Gerar de novo o mesmo mês não duplica.
 */
export default function GerarRecorrentes({ mes, aoGerar }: Props) {
  const { republica } = useRepublicaAtual();
  const foraDoAr = useApiForaDoAr();
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setAviso(null);
    setGerando(true);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/recorrentes/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível gerar os lançamentos." });
        return;
      }
      const lista = corpo as Lancamento[];
      setAviso({
        tipo: "ok",
        texto:
          lista.length === 0
            ? "Nada a gerar neste mês."
            : `${lista.length === 1 ? "1 lançamento gerado" : `${lista.length} lançamentos gerados`}: ` +
              lista.map((l) => `${l.descricao} (${formatarData(l.data)})`).join(", ") +
              ".",
      });
      if (lista.length > 0) aoGerar();
    } catch {
      setAviso({ tipo: "erro", texto: "A API não respondeu." });
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="gerar-recorrentes">
      <button
        type="button"
        className="botao-secundario"
        onClick={gerar}
        disabled={gerando || foraDoAr}
      >
        {gerando ? "Gerando..." : `↻ Gerar as recorrentes de ${formatarMes(mes)}`}
      </button>
      {aviso && (
        <p role="status" className={`aviso aviso-${aviso.tipo}`}>
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
