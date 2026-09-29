import { useState } from "react";
import { formatarData } from "./formatarData";
import { formatarMes } from "./mes";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Resposta de POST /api/republicas/:id/recorrentes/gerar (C2). */
type Resultado = {
  gerados: { id: number; descricao: string; data: string }[];
  /** Modelos com alguém que saiu da casa (A4): não geram. */
  pulados: { descricao: string; quem: string[] }[];
};

/** "Aluguel não foi gerado: Carla saiu da casa. ..." */
function textoPulado({ descricao, quem }: Resultado["pulados"][number]): string {
  const nomes = quem.length === 1 ? quem[0] : `${quem.slice(0, -1).join(", ")} e ${quem.at(-1)}`;
  const saiu = quem.length === 1 ? "saiu" : "saíram";
  return `${descricao} não foi gerado: ${nomes} ${saiu} da casa. Pare de repetir e lance a conta nova como recorrente.`;
}

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
  const [pulados, setPulados] = useState<string[]>([]);
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setAviso(null);
    setPulados([]);
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
      const { gerados: lista, pulados } = corpo as Resultado;
      setPulados(pulados.map(textoPulado));
      // Só pulados: o aviso deles já explica, sem o "Nada a gerar".
      if (lista.length === 0 && pulados.length > 0) return;
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
      {pulados.map((texto) => (
        <p key={texto} role="status" className="aviso aviso-alerta">
          {texto}
        </p>
      ))}
    </div>
  );
}
