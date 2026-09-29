import { useEffect, useState } from "react";
import { formatarReais } from "./formatarReais";
import { useMoradorAtual, type Morador } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

type Props = {
  morador: Morador;
  aoCancelar: () => void;
  /** Depois de salvar: a tela recarrega a lista e mostra o aviso. */
  aoConfirmar: () => void;
};

/** "Carla ainda tem R$ 875,00 a pagar." a partir do saldo (D1). */
function textoDoSaldo(nome: string, saldoCentavos: number | undefined): string {
  if (saldoCentavos === undefined || saldoCentavos === 0) return `${nome} está em dia.`;
  const quanto = formatarReais(Math.abs(saldoCentavos));
  const lado = saldoCentavos < 0 ? "a pagar" : "a receber";
  return `${nome} ainda tem ${quanto} ${lado}. O saldo continua no painel até ser acertado.`;
}

/**
 * Confirmação de "saiu da casa" (A4), no padrão da exclusão de despesa (B6).
 * Mostra o saldo antes: sair com saldo em aberto é permitido, mas avisado.
 */
export default function MarcarSaida({ morador, aoCancelar, aoConfirmar }: Props) {
  const { republica } = useRepublicaAtual();
  const { moradorId } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const [saldo, setSaldo] = useState<number | undefined>(undefined);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/saldos`)
      .then((resposta) => (resposta.ok ? resposta.json() : []))
      .then((lista: { moradorId: number; saldoCentavos: number }[]) => {
        if (ativo) setSaldo(lista.find((s) => s.moradorId === morador.id)?.saldoCentavos);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [republica.id, morador.id]);

  async function confirmar() {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/moradores/${morador.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moradorId }),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setErro(corpo.erro ?? "Não foi possível marcar a saída.");
        return;
      }
      aoConfirmar();
    } catch {
      setErro("A API não respondeu.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="cartao confirmacao saida" role="alertdialog" aria-labelledby="confirma-saida">
      <p id="confirma-saida">
        Marcar que {morador.nome} saiu da casa? Nada é apagado: as despesas e os acertos
        continuam, mas {morador.nome} não entra mais em despesas novas.
      </p>
      <p className="saida-saldo">{textoDoSaldo(morador.nome, saldo)}</p>
      <div className="acoes-botoes">
        <button type="button" className="botao-secundario" onClick={aoCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="botao-secundario botao-perigo"
          onClick={confirmar}
          disabled={salvando || foraDoAr}
        >
          {salvando ? "Salvando..." : "Confirmar saída"}
        </button>
      </div>
      {erro && (
        <p role="status" className="aviso aviso-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
