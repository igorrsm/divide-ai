import { useMoradorAtual } from "./MoradorAtual";
import { useApiForaDoAr } from "./StatusApi";

/** "Quem é você?": um botão por morador; o escolhido fica marcado. */
export default function SeletorMorador() {
  const { moradores, moradorId, escolher } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();

  // Sem API não há como saber os moradores; o aviso da tela já explica.
  if (foraDoAr || moradores.length === 0) return null;

  return (
    <div className="seletor-morador" role="group" aria-labelledby="quem-e-voce">
      <span id="quem-e-voce" className="seletor-titulo">
        Quem é você?
      </span>
      <div className="seletor-opcoes">
        {moradores.map((morador) => (
          <button
            key={morador.id}
            type="button"
            className="seletor-opcao"
            aria-pressed={morador.id === moradorId}
            onClick={() => escolher(morador.id)}
          >
            {morador.nome}
          </button>
        ))}
      </div>
      {moradorId === null && <span className="seletor-dica">Escolha quem você é</span>}
    </div>
  );
}
