import { useState, type FormEvent } from "react";
import { useMoradorAtual } from "./MoradorAtual";
import { useApiForaDoAr } from "./StatusApi";

// Fixo até a A1 (criar república) entrar.
// É o id da república criada pelo seed.
const REPUBLICA_ID = 1;

/** Hoje no fuso de quem está usando, no formato que o input date espera. */
function hoje(): string {
  return new Date().toLocaleDateString("en-CA");
}

export default function NovaDespesa() {
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
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const foraDoAr = useApiForaDoAr();

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

      <button type="submit" disabled={enviando || foraDoAr} className="botao-principal">
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
    </form>
  );
}
