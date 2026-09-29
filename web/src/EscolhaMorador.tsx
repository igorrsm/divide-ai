type Props = {
  rotulo: string;
  moradores: { id: number; nome: string }[];
  /** Id escolhido, como texto. */
  valor: string;
  aoMudar: (id: string) => void;
};

/**
 * Um morador em pílulas, como os filtros da lista de despesas (E2) e o
 * "Quem é você?", no lugar da lista do navegador, que o CSS não alcança.
 */
export default function EscolhaMorador({ rotulo, moradores, valor, aoMudar }: Props) {
  const id = `rotulo-${rotulo.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="campo" role="group" aria-labelledby={id}>
      <span id={id}>{rotulo}</span>
      <div className="seletor-opcoes">
        {moradores.map((morador) => (
          <button
            key={morador.id}
            type="button"
            className="seletor-opcao"
            aria-pressed={String(morador.id) === valor}
            onClick={() => aoMudar(String(morador.id))}
          >
            {morador.nome}
          </button>
        ))}
      </div>
    </div>
  );
}
