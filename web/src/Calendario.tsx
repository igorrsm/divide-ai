import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { diasDoMes, hojeNaCasa } from "./diasDoMes";
import { formatarMes, mesVizinho } from "./mes";

type Props = {
  /** Rótulo do campo, para o leitor de tela: "De" ou "Até". */
  rotulo: string;
  /** Dia escolhido em "AAAA-MM-DD", ou "" sem escolha. */
  valor: string;
  aoEscolher: (dia: string) => void;
  aoFechar: () => void;
};

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const SEMANA_EXTENSO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/**
 * Calendário no visual do site (E2), no lugar do calendário do navegador, que
 * o CSS não alcança. Abre no mês do dia escolhido, ou no mês de hoje.
 */
export default function Calendario({ rotulo, valor, aoEscolher, aoFechar }: Props) {
  const hoje = hojeNaCasa();
  const [mes, setMes] = useState((valor || hoje).slice(0, 7));
  const cartao = useRef<HTMLDivElement>(null);

  // Ao abrir, o foco vai para o dia escolhido (ou hoje, ou o primeiro dia):
  // assim o teclado já está dentro do calendário e o Esc funciona na hora.
  useEffect(() => {
    const dia =
      cartao.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ??
      cartao.current?.querySelector<HTMLButtonElement>(".calendario-hoje") ??
      cartao.current?.querySelector<HTMLButtonElement>(".calendario-dia");
    dia?.focus();
  }, []);

  function teclar(evento: KeyboardEvent) {
    if (evento.key === "Escape") aoFechar();
  }

  return (
    <div
      ref={cartao}
      className="cartao calendario"
      role="dialog"
      aria-label={`Escolher data: ${rotulo}`}
      onKeyDown={teclar}
    >
      <div className="navegacao-mes">
        <button
          type="button"
          className="seta-mes"
          aria-label="Mês anterior"
          onClick={() => setMes(mesVizinho(mes, -1))}
        >
          ‹
        </button>
        <strong aria-live="polite">{formatarMes(mes)}</strong>
        <button
          type="button"
          className="seta-mes"
          aria-label="Mês seguinte"
          onClick={() => setMes(mesVizinho(mes, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendario-grade">
        {SEMANA.map((letra, i) => (
          <abbr key={i} title={SEMANA_EXTENSO[i]} className="calendario-semana">
            {letra}
          </abbr>
        ))}
        {diasDoMes(mes).map((dia, i) =>
          dia === null ? (
            <span key={`vazio-${i}`} />
          ) : (
            <button
              key={dia}
              type="button"
              className={dia === hoje ? "calendario-dia calendario-hoje" : "calendario-dia"}
              aria-pressed={dia === valor}
              aria-label={`${Number(dia.slice(8))} de ${formatarMes(mes)}`}
              onClick={() => aoEscolher(dia)}
            >
              {Number(dia.slice(8))}
            </button>
          ),
        )}
      </div>

      <div className="acoes-botoes">
        <button type="button" className="botao-secundario" onClick={() => aoEscolher("")}>
          Limpar
        </button>
        <button type="button" className="botao-secundario" onClick={aoFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}
