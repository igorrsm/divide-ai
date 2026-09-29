import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CampoData from "./CampoData";
import { hojeNaCasa } from "./diasDoMes";
import { textoParaInteiro } from "./divisao";
import EscolhaMorador from "./EscolhaMorador";
import { useMoradorAtual } from "./MoradorAtual";
import { avisoDeValor } from "./pagamento";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Estado da navegação que a sugestão de acertos (D5) manda. */
type PagamentoSugerido = { pagadorId?: string; recebedorId?: string; valor?: string };

/**
 * Registrar um acerto entre moradores (D3): quem pagou, para quem, quanto e
 * quando. Valor maior que a dívida é aceito, com aviso antes de salvar.
 */
export default function RegistrarPagamento() {
  const navigate = useNavigate();
  const { republica } = useRepublicaAtual();
  const { moradores, moradorId } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  // Vindo da sugestão de acertos (D5), o formulário abre preenchido.
  const sugerido = (useLocation().state ?? {}) as PagamentoSugerido;
  const [pagador, setPagador] = useState(
    sugerido.pagadorId ?? (moradorId ? String(moradorId) : ""),
  );
  const [recebedor, setRecebedor] = useState(sugerido.recebedorId ?? "");
  const [valor, setValor] = useState(sugerido.valor ?? "");
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

  // Sem escolha, vale o primeiro morador. "Para quem" não mostra quem pagou
  // e começa na primeira outra pessoa.
  const pagadorId = pagador || String(moradores[0]?.id ?? "");
  const outros = moradores.filter((m) => String(m.id) !== pagadorId);
  const recebedorId = outros.some((m) => String(m.id) === recebedor)
    ? recebedor
    : String(outros[0]?.id ?? "");
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

  return (
    <form onSubmit={enviar} className="cartao formulario">
      <h1>Registrar pagamento</h1>
      <EscolhaMorador
        rotulo="Quem pagou"
        moradores={moradores}
        valor={pagadorId}
        aoMudar={setPagador}
      />
      <EscolhaMorador
        rotulo="Para quem"
        moradores={outros}
        valor={recebedorId}
        aoMudar={setRecebedor}
      />
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
      <CampoData rotulo="Data" valor={data} aoMudar={setData} max={hojeNaCasa()} />
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
