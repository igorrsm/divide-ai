import type { TipoDivisao } from "./divisao";
import type { Morador } from "./MoradorAtual";

type Props = {
  moradores: Morador[];
  pagadorId: string;
  desmarcados: Set<number>;
  alternar: (id: number) => void;
  tipo: TipoDivisao;
  aoMudarTipo: (tipo: TipoDivisao) => void;
  /** Texto digitado para cada morador marcado, em R$ ou %. */
  partes: Record<number, string>;
  aoMudarParte: (id: number, texto: string) => void;
  /** Resultado de conferePartes; null na divisão por igual. */
  conferencia: { fecha: boolean; mensagem: string } | null;
};

const MODOS: { tipo: TipoDivisao; rotulo: string }[] = [
  { tipo: "IGUAL", rotulo: "Por igual" },
  { tipo: "VALOR", rotulo: "Por valores" },
  { tipo: "PERCENTUAL", rotulo: "Por percentuais" },
];

/**
 * Como dividir e quem participa (B4 e B5). As caixas de marcar valem nos três
 * modos (ideia da Thalita); por valores ou percentuais, cada marcado ganha um
 * campo ao lado, e a conta ao vivo diz quanto falta.
 */
export default function ParticipantesRateio(props: Props) {
  const { moradores, pagadorId, desmarcados, alternar, tipo, partes, conferencia } = props;
  const quantos = moradores.filter((morador) => !desmarcados.has(morador.id)).length;

  return (
    <>
      <div className="campo" role="group" aria-labelledby="rotulo-divisao">
        <span id="rotulo-divisao">Como dividir?</span>
        <div className="seletor-opcoes">
          {MODOS.map((modo) => (
            <button
              key={modo.tipo}
              type="button"
              className="seletor-opcao"
              aria-pressed={tipo === modo.tipo}
              onClick={() => props.aoMudarTipo(modo.tipo)}
            >
              {modo.rotulo}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="participantes">
        <legend>Quem participará do rateio desta despesa?</legend>
        <p className="participantes-resumo">
          {quantos} de {moradores.length} participam. Desmarque quem não entra nesta conta.
        </p>
        <ul className="participantes-lista">
          {moradores.map((morador) => {
            const marcado = !desmarcados.has(morador.id);
            return (
              <li key={morador.id} className="cartao participante">
                <label className="participante-rotulo">
                  <input type="checkbox" checked={marcado} onChange={() => alternar(morador.id)} />
                  <span>
                    {morador.nome}
                    {String(morador.id) === pagadorId && <small> (pagou)</small>}
                  </span>
                </label>
                {tipo !== "IGUAL" && marcado && (
                  <span className="parte">
                    {tipo === "VALOR" && <span aria-hidden="true">R$</span>}
                    <input
                      value={partes[morador.id] ?? ""}
                      onChange={(e) => props.aoMudarParte(morador.id, e.target.value)}
                      inputMode="decimal"
                      placeholder={tipo === "VALOR" ? "0,00" : "0"}
                      aria-label={`${tipo === "VALOR" ? "Valor" : "Percentual"} de ${morador.nome}`}
                    />
                    {tipo === "PERCENTUAL" && <span aria-hidden="true">%</span>}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {moradores.length > 0 && quantos === 0 && (
          <p role="status" className="aviso aviso-erro">
            Escolha ao menos um morador para dividir a despesa.
          </p>
        )}
        {conferencia && quantos > 0 && (
          <p role="status" className={conferencia.fecha ? "conta-divisao fecha" : "conta-divisao"}>
            {conferencia.mensagem}
          </p>
        )}
      </fieldset>
    </>
  );
}
