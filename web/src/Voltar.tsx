import { Link } from "react-router-dom";

/**
 * Botão "← Voltar" em pílula, no topo das telas. As telas principais voltam
 * para a inicial; as internas, para a tela de onde a pessoa veio.
 */
export default function Voltar({ para }: { para: string }) {
  return (
    <Link to={para} className="voltar">
      <span aria-hidden="true">←</span> Voltar
    </Link>
  );
}
