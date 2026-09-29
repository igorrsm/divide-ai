import { useState, type FormEvent } from "react";
import Calendario from "./Calendario";
import { formatarData } from "./formatarData";
import { useMoradorAtual } from "./MoradorAtual";

/**
 * Filtros da lista de despesas (E2), como ficam na URL. Vazio é "sem filtro";
 * `moradores` é a lista de ids separada por vírgula, como "1,2".
 */
export type Filtros = { de: string; ate: string; moradores: string };

type Props = {
  filtros: Filtros;
  aoAplicar: (filtros: Filtros) => void;
  aoLimpar: () => void;
};

/**
 * Cartão com período e moradores. Só muda a lista ao clicar em "Aplicar",
 * para não buscar a cada escolha. Com vários moradores, aparece o que algum
 * deles pagou ou do que participa (decisões da Thalita).
 */
export default function CartaoFiltros({ filtros, aoAplicar, aoLimpar }: Props) {
  // Com quem saiu (A4): as despesas antigas dele continuam filtráveis.
  const { todos: moradores } = useMoradorAtual();
  const [rascunho, setRascunho] = useState(filtros);
  const [erro, setErro] = useState<string | null>(null);
  // Qual data está com o calendário aberto; só um de cada vez.
  const [calendario, setCalendario] = useState<"de" | "ate" | null>(null);

  function mudar(campo: keyof Filtros, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setErro(null);
  }

  const escolhidos = rascunho.moradores ? rascunho.moradores.split(",") : [];

  /** Liga ou desliga um morador; "Todos" (id vazio) desmarca todo mundo. */
  function alternar(id: string) {
    if (id === "") return mudar("moradores", "");
    const novos = escolhidos.includes(id)
      ? escolhidos.filter((outro) => outro !== id)
      : [...escolhidos, id];
    mudar("moradores", novos.join(","));
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

      {/* Pílulas como as do "Quem é você?"; dá para marcar mais de uma. */}
      <div className="campo" role="group" aria-labelledby="rotulo-morador">
        <span id="rotulo-morador">Moradores</span>
        <div className="seletor-opcoes">
          {[{ id: "", nome: "Todos" }, ...moradores].map((morador) => (
            <button
              key={morador.id}
              type="button"
              className="seletor-opcao"
              aria-pressed={
                morador.id === "" ? escolhidos.length === 0 : escolhidos.includes(String(morador.id))
              }
              onClick={() => alternar(String(morador.id))}
            >
              {morador.nome}
            </button>
          ))}
        </div>
      </div>

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
