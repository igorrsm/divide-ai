import { useState } from "react";
import Calendario from "./Calendario";
import { formatarData } from "./formatarData";

type Props = {
  rotulo: string;
  /** Dia em "AAAA-MM-DD". */
  valor: string;
  aoMudar: (dia: string) => void;
  /** Último dia que dá para escolher, em "AAAA-MM-DD". */
  max?: string;
};

/**
 * Campo de data obrigatória com o calendário do site, igual ao dos filtros
 * da lista de despesas (E2). Sem "Limpar", porque o campo não pode ficar vazio.
 */
export default function CampoData({ rotulo, valor, aoMudar, max }: Props) {
  const [aberto, setAberto] = useState(false);
  const id = `rotulo-data-${rotulo.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <>
      <div className="campo">
        <span id={id}>{rotulo}</span>
        <button
          type="button"
          className="campo-data"
          aria-labelledby={id}
          aria-expanded={aberto}
          onClick={() => setAberto(!aberto)}
        >
          {valor ? formatarData(valor) : "Escolher data"}
        </button>
      </div>
      {aberto && (
        <Calendario
          rotulo={rotulo}
          valor={valor}
          max={max}
          semLimpar
          aoEscolher={(dia) => {
            aoMudar(dia);
            setAberto(false);
          }}
          aoFechar={() => setAberto(false)}
        />
      )}
    </>
  );
}
