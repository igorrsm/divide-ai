import { Link, useLocation } from "react-router-dom";

/**
 * Tela de onde a pessoa veio, mandada no estado da navegação (`voltarPara`).
 * Só aceita caminho interno; aberto por um link colado, não há origem.
 */
export function useOrigem(): string | null {
  const origem = (useLocation().state as { voltarPara?: unknown } | null)?.voltarPara;
  return typeof origem === "string" && origem.startsWith("/") && !origem.startsWith("//")
    ? origem
    : null;
}

/**
 * Botão "← Voltar" em pílula, no topo das telas. As telas principais voltam
 * para a inicial; as internas, para a tela de onde a pessoa veio. `estado`
 * repassa a origem adiante, para ela não se perder no caminho.
 */
export default function Voltar({ para, estado }: { para: string; estado?: unknown }) {
  return (
    <Link to={para} state={estado} className="voltar">
      <span aria-hidden="true">←</span> Voltar
    </Link>
  );
}
