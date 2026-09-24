import { useEffect, useState, type CSSProperties, type FormEvent } from "react";

// Fixo até A1 (criar república) e A3 (escolher qual morador eu sou) entrarem.
// É o id da república criada pelo seed.
const REPUBLICA_ID = 1;

type Morador = { id: number; nome: string };

/** Hoje no fuso de quem está usando, no formato que o input date espera. */
function hoje(): string {
  return new Date().toLocaleDateString("en-CA");
}

const campo: CSSProperties = { display: "grid", gap: "0.25rem" };
const entrada: CSSProperties = {
  padding: "0.5rem",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

export default function NovaDespesa() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [pagadorId, setPagadorId] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`/api/republicas/${REPUBLICA_ID}/moradores`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Morador[]>;
      })
      .then((lista) => {
        setMoradores(lista);
        setPagadorId(String(lista[0]?.id ?? ""));
      })
      .catch(() => setAviso({ tipo: "erro", texto: "Não foi possível carregar os moradores." }));
  }, []);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/republicas/${REPUBLICA_ID}/despesas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, valor, data, pagadorId }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível lançar a despesa." });
        return;
      }
      setAviso({ tipo: "ok", texto: `Despesa "${corpo.descricao}" lançada.` });
      setDescricao("");
      setValor("");
    } catch {
      setAviso({ tipo: "erro", texto: "A API não respondeu." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: "0.75rem", maxWidth: "24rem" }}>
      <h2>Nova despesa</h2>

      <label style={campo}>
        Descrição
        <input
          style={entrada}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Conta de luz"
          required
        />
      </label>

      <label style={campo}>
        Valor em reais
        <input
          style={entrada}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="189,90"
          inputMode="decimal"
          required
        />
      </label>

      <label style={campo}>
        Data
        <input
          style={entrada}
          type="date"
          value={data}
          max={hoje()}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </label>

      <label style={campo}>
        Quem pagou
        <select
          style={entrada}
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

      <button type="submit" disabled={enviando} style={{ ...entrada, cursor: "pointer" }}>
        {enviando ? "Lançando..." : "Lançar despesa"}
      </button>

      {aviso && (
        <p role="status" style={{ color: aviso.tipo === "erro" ? "#b00020" : "#046307" }}>
          {aviso.texto}
        </p>
      )}
    </form>
  );
}
