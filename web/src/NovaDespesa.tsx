import { useEffect, useState, type FormEvent } from "react";
import { useApiForaDoAr } from "./StatusApi";

// Fixo até A1 (criar república) e A3 (escolher qual morador eu sou) entrarem.
// É o id da república criada pelo seed.
const REPUBLICA_ID = 1;

type Morador = { id: number; nome: string };

/** Hoje no fuso de quem está usando, no formato que o input date espera. */
function hoje(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function NovaDespesa() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [pagadorId, setPagadorId] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const foraDoAr = useApiForaDoAr();

  // Carrega de novo quando a API volta, para o seletor não ficar vazio.
  useEffect(() => {
    if (foraDoAr) return;
    fetch(`/api/republicas/${REPUBLICA_ID}/moradores`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Morador[]>;
      })
      .then((lista) => {
        setMoradores(lista);
        setAviso(null);
        setPagadorId((atual) => atual || String(lista[0]?.id ?? ""));
      })
      .catch(() => setAviso({ tipo: "erro", texto: "Não foi possível carregar os moradores." }));
  }, [foraDoAr]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (foraDoAr) return;
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
          placeholder="189,90"
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

      <button type="submit" disabled={enviando || foraDoAr} className="botao-principal">
        {foraDoAr ? "Servidor indisponível" : enviando ? "Lançando..." : "Lançar despesa"}
      </button>

      {aviso && (
        <p role="status" className={aviso.tipo === "erro" ? "aviso aviso-erro" : "aviso aviso-ok"}>
          {aviso.texto}
        </p>
      )}
    </form>
  );
}
