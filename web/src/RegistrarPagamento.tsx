import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { hojeNaCasa } from "./diasDoMes";
import { textoParaInteiro } from "./divisao";
import { useMoradorAtual } from "./MoradorAtual";
import { avisoDeValor } from "./pagamento";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/**
 * Registrar um acerto entre moradores (D3): quem pagou, para quem, quanto e
 * quando. Valor maior que a dívida é aceito, com aviso antes de salvar.
 */
export default function RegistrarPagamento() {
  const navigate = useNavigate();
  const { republica } = useRepublicaAtual();
  const { moradores, moradorId } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const [pagador, setPagador] = useState(moradorId ? String(moradorId) : "");
  const [recebedor, setRecebedor] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hojeNaCasa());
  const [saldos, setSaldos] = useState<Record<number, number>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Os saldos só servem para o aviso; se não carregarem, o formulário segue.
  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/saldos`)
      .then((resposta) => (resposta.ok ? resposta.json() : []))
      .then((lista: { moradorId: number; saldoCentavos: number }[]) => {
        if (ativo) {
          setSaldos(Object.fromEntries(lista.map((s) => [s.moradorId, s.saldoCentavos])));
        }
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [republica.id]);

  // Sem escolha, vale o primeiro morador; "para quem" começa em outra pessoa.
  const pagadorId = pagador || String(moradores[0]?.id ?? "");
  const recebedorId =
    recebedor || String(moradores.find((m) => String(m.id) !== pagadorId)?.id ?? "");
  const mesmaPessoa = pagadorId !== "" && pagadorId === recebedorId;
  const nomePagador = moradores.find((m) => String(m.id) === pagadorId)?.nome ?? "";
  const aviso = avisoDeValor(textoParaInteiro(valor), saldos[Number(pagadorId)], nomePagador);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/pagamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagadorId, recebedorId, valor, data }),
      });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => ({}));
        setErro(corpo.erro ?? "Não foi possível registrar o pagamento.");
        return;
      }
      navigate("/saldos", { state: { aviso: "Pagamento registrado." } });
    } catch {
      setErro("A API não respondeu.");
    } finally {
      setEnviando(false);
    }
  }

  const opcoes = moradores.map((morador) => (
    <option key={morador.id} value={morador.id}>
      {morador.nome}
    </option>
  ));

  return (
    <form onSubmit={enviar} className="formulario">
      <h1>Registrar pagamento</h1>
      <label className="campo">
        Quem pagou
        <select value={pagadorId} onChange={(e) => setPagador(e.target.value)} required>
          {opcoes}
        </select>
      </label>
      <label className="campo">
        Para quem
        <select value={recebedorId} onChange={(e) => setRecebedor(e.target.value)} required>
          {opcoes}
        </select>
      </label>
      {mesmaPessoa && (
        <p role="alert" className="aviso aviso-erro">
          Quem pagou e quem recebeu precisam ser pessoas diferentes.
        </p>
      )}
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
          max={hojeNaCasa()}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </label>
      {aviso && (
        <p role="status" className="aviso aviso-alerta">
          {aviso}
        </p>
      )}
      <button
        type="submit"
        className="botao-principal"
        disabled={enviando || foraDoAr || mesmaPessoa}
      >
        {enviando ? "Registrando..." : "Registrar pagamento"}
      </button>
      {erro && (
        <p role="status" className="aviso aviso-erro">
          {erro}
        </p>
      )}
    </form>
  );
}
