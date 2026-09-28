import { useState, type FormEvent } from "react";
import { formatarReais } from "./formatarReais";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** O rateio que a API devolveu ao criar a despesa (B2). */
type Rateio = {
  pagadorId: number;
  participacoes: { moradorId: number; valorCentavos: number }[];
};

/** Hoje no fuso de quem está usando, no formato que o input date espera. */
function hoje(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function NovaDespesa() {
  const { republica } = useRepublicaAtual();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  // A lista vem do useMoradorAtual (A3), sem buscar a rota de novo.
  // "Quem pagou" começa com quem foi escolhido em "Quem é você?".
  const { moradores, moradorId, erro: erroMoradores } = useMoradorAtual();
  const [pagadorEscolhido, setPagadorId] = useState(moradorId ? String(moradorId) : "");
  // Se o escolhido não está na lista, vale o primeiro morador.
  const pagadorId = moradores.some((m) => String(m.id) === pagadorEscolhido)
    ? pagadorEscolhido
    : String(moradores[0]?.id ?? "");
  // Guarda quem foi desmarcado, não quem está marcado: assim todo morador
  // nasce participando, sem precisar sincronizar estado com a lista que chega
  // de forma assíncrona do contexto.
  const [desmarcados, setDesmarcados] = useState<Set<number>>(new Set());
  const participantesIds = moradores
    .filter((morador) => !desmarcados.has(morador.id))
    .map((morador) => morador.id);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [rateio, setRateio] = useState<Rateio | null>(null);
  const [enviando, setEnviando] = useState(false);
  const foraDoAr = useApiForaDoAr();

  function alternar(id: number) {
    setDesmarcados((atual) => {
      const novo = new Set(atual);
      if (!novo.delete(id)) novo.add(id);
      return novo;
    });
  }

  /** A lista de moradores já está no contexto: não busca a rota de novo. */
  function nomeDe(id: number): string {
    return moradores.find((morador) => morador.id === id)?.nome ?? `Morador ${id}`;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (foraDoAr) return;
    setAviso(null);
    setRateio(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/despesas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, valor, data, pagadorId, participantesIds }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível lançar a despesa." });
        return;
      }
      setAviso({ tipo: "ok", texto: `Despesa "${corpo.descricao}" lançada.` });
      setRateio({ pagadorId: corpo.pagadorId, participacoes: corpo.participacoes });
      setDescricao("");
      setValor("");
      // Volta ao padrão de todos participando: deixar uma exclusão valendo para
      // a próxima despesa é erro difícil de notar.
      setDesmarcados(new Set());
    } catch {
      setAviso({ tipo: "erro", texto: "A API não respondeu." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="formulario">
      <h2>Nova despesa</h2>

      <label className="campo">
        Descrição
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conta de luz"
          required
        />
      </label>

      <label className="campo">
        Valor em reais
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          inputMode="decimal"
          required
        />
      </label>

      <label className="campo">
        Data
        <input
          type="date"
          value={data}
          max={hoje()}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </label>

      <label className="campo">
        Quem pagou
        <select
          value={pagadorId}
          onChange={(e) => setPagadorId(e.target.value)}
          required
        >
          {moradores.map((morador) => (
            <option key={morador.id} value={morador.id}>
              {morador.nome}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="participantes">
        <legend>Quem participa</legend>
        <p className="participantes-resumo">
          {participantesIds.length} de {moradores.length} participam. Desmarque quem não
          entra nesta conta.
        </p>
        <ul className="participantes-lista">
          {moradores.map((morador) => (
            <li key={morador.id}>
              <label className="cartao participante">
                <input
                  type="checkbox"
                  checked={!desmarcados.has(morador.id)}
                  onChange={() => alternar(morador.id)}
                />
                <span>
                  {morador.nome}
                  {String(morador.id) === pagadorId && <small> (pagou)</small>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {moradores.length > 0 && participantesIds.length === 0 && (
          <p role="status" className="aviso aviso-erro">
            Escolha ao menos um morador para dividir a despesa.
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={enviando || foraDoAr || participantesIds.length === 0}
        className="botao-principal"
      >
        {foraDoAr ? "Servidor indisponível" : enviando ? "Lançando..." : "Lançar despesa"}
      </button>

      {/* Com a API fora do ar, o aviso do topo já explica o erro. */}
      {erroMoradores && !foraDoAr && (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar os moradores.
        </p>
      )}
      {aviso && !(foraDoAr && aviso.tipo === "erro") && (
        <p role="status" className={aviso.tipo === "erro" ? "aviso aviso-erro" : "aviso aviso-ok"}>
          {aviso.texto}
        </p>
      )}

      {rateio && (
        <section className="rateio">
          <h3>
            Dividida por igual entre {rateio.participacoes.length}{" "}
            {rateio.participacoes.length > 1 ? "moradores" : "morador"}
          </h3>
          <ul className="rateio-lista">
            {rateio.participacoes.map((participacao) => (
              <li key={participacao.moradorId} className="cartao rateio-item">
                <span>
                  {nomeDe(participacao.moradorId)}
                  {participacao.moradorId === rateio.pagadorId && <small> (pagou)</small>}
                </span>
                <strong>{formatarReais(participacao.valorCentavos)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </form>
  );
}
