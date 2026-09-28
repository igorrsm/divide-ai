import { useState, type FormEvent } from "react";
import Calendario from "./Calendario";
import { formatarData } from "./formatarData";
import { useMoradorAtual } from "./MoradorAtual";

/** Filtros da lista de despesas (E2), como ficam na URL. Vazio é "sem filtro". */
export type Filtros = { de: string; ate: string; moradorId: string };

type Props = {
  filtros: Filtros;
  aoAplicar: (filtros: Filtros) => void;
  aoLimpar: () => void;
};

/**
 * Cartão com período e morador. Só muda a lista ao clicar em "Aplicar", para
 * não buscar a cada data digitada. O morador filtra o que ele pagou ou do que
 * participa (decisão da Thalita).
 */
export default function CartaoFiltros({ filtros, aoAplicar, aoLimpar }: Props) {
  const { moradores } = useMoradorAtual();
  const [rascunho, setRascunho] = useState(filtros);
  const [erro, setErro] = useState<string | null>(null);
  // Qual data está com o calendário aberto; só um de cada vez.
  const [calendario, setCalendario] = useState<"de" | "ate" | null>(null);

  function mudar(campo: keyof Filtros, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setErro(null);
  }

  /** Botão que abre o calendário, mostrando a data escolhida. */
  function botaoData(campo: "de" | "ate", rotulo: string) {
    return (
      <div className="campo">
        <span id={`rotulo-${campo}`}>{rotulo}</span>
        <button
          type="button"
          className="campo-data"
          aria-labelledby={`rotulo-${campo}`}
          aria-expanded={calendario === campo}
          onClick={() => setCalendario(calendario === campo ? null : campo)}
        >
          {rascunho[campo] ? formatarData(rascunho[campo]) : "Escolher data"}
        </button>
      </div>
    );
  }

  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    // AAAA-MM-DD ordena como texto na mesma ordem da data.
    if (rascunho.de && rascunho.ate && rascunho.de > rascunho.ate) {
      setErro("A data inicial não pode ser depois da data final.");
      return;
    }
    aoAplicar(rascunho);
  }

  return (
    <form
      className="cartao formulario filtros"
      onSubmit={aplicar}
      onKeyDown={(e) => e.key === "Escape" && setCalendario(null)}
    >
      <div className="filtros-periodo">
        {botaoData("de", "De")}
        {botaoData("ate", "Até")}
      </div>
      {calendario && (
        <Calendario
          key={calendario}
          rotulo={calendario === "de" ? "De" : "Até"}
          valor={rascunho[calendario]}
          aoEscolher={(dia) => {
            mudar(calendario, dia);
            setCalendario(null);
          }}
          aoFechar={() => setCalendario(null)}
        />
      )}

      <label className="campo">
        Morador
        <select value={rascunho.moradorId} onChange={(e) => mudar("moradorId", e.target.value)}>
          <option value="">Todos</option>
          {moradores.map((morador) => (
            <option key={morador.id} value={morador.id}>
              {morador.nome}
            </option>
          ))}
        </select>
      </label>

      {erro && (
        <p role="alert" className="aviso aviso-erro">
          {erro}
        </p>
      )}

      <div className="acoes-botoes">
        <button type="button" className="botao-secundario" onClick={aoLimpar}>
          Limpar filtros
        </button>
        <button type="submit" className="botao-secundario botao-aplicar">
          Aplicar
        </button>
      </div>
    </form>
  );
}
