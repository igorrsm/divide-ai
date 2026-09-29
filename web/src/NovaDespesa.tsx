import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import CampoData from "./CampoData";
import { hojeNaCasa } from "./diasDoMes";
import { conferePartes, TITULO_DIVISAO, type TipoDivisao } from "./divisao";
import { formatarReais } from "./formatarReais";
import EscolhaMorador from "./EscolhaMorador";
import { useMoradorAtual } from "./MoradorAtual";
import ParticipantesRateio from "./ParticipantesRateio";
import { diaDoTexto, textoRecorrencia } from "./recorrencia";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** O rateio que a API devolveu ao criar a despesa (B2). */
type Rateio = {
  pagadorId: number;
  tipoDivisao: TipoDivisao;
  participacoes: { moradorId: number; valorCentavos: number }[];
};

/** Uma despesa já lançada, para o formulário abrir preenchido (B6). */
export type DespesaEmEdicao = {
  id: number;
  descricao: string;
  valorCentavos: number;
  data: string;
  pagadorId: number;
  participantesIds: number[];
  tipoDivisao: TipoDivisao;
  /** Por valores ou percentuais (B5): o texto de cada participante. */
  partes: Record<number, string>;
  /** Repete todo mês (C1). */
  recorrente: boolean;
  /** Tela de onde a pessoa veio antes do detalhe, para o Voltar de lá. */
  voltarPara?: string;
};

/** 12345 centavos vira "123,45", no formato que o campo de valor aceita. */
export function centavosParaTexto(centavos: number): string {
  return `${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, "0")}`;
}


/**
 * Formulário de lançar despesa. Com `edicao`, abre preenchido e salva com PUT
 * em vez de criar (B6); quem chama só o renderiza depois de os moradores
 * carregarem, para os participantes começarem certos.
 */
export default function NovaDespesa({ edicao }: { edicao?: DespesaEmEdicao }) {
  const navigate = useNavigate();
  const { republica } = useRepublicaAtual();
  const [descricao, setDescricao] = useState(edicao?.descricao ?? "");
  const [valor, setValor] = useState(edicao ? centavosParaTexto(edicao.valorCentavos) : "");
  const [data, setData] = useState(edicao?.data ?? hojeNaCasa());
  // A lista vem do useMoradorAtual (A3), sem buscar a rota de novo.
  // "Quem pagou" começa com quem foi escolhido em "Quem é você?".
  const { moradores, moradorId, erro: erroMoradores } = useMoradorAtual();
  const [pagadorEscolhido, setPagadorId] = useState(
    edicao ? String(edicao.pagadorId) : moradorId ? String(moradorId) : "",
  );
  // Se o escolhido não está na lista, vale o primeiro morador.
  const pagadorId = moradores.some((m) => String(m.id) === pagadorEscolhido)
    ? pagadorEscolhido
    : String(moradores[0]?.id ?? "");
  // Guarda quem foi desmarcado, não quem está marcado: assim todo morador
  // nasce participando, sem precisar sincronizar estado com a lista que chega
  // de forma assíncrona do contexto.
  const [desmarcados, setDesmarcados] = useState<Set<number>>(
    () =>
      new Set(
        edicao
          ? moradores.filter((m) => !edicao.participantesIds.includes(m.id)).map((m) => m.id)
          : [],
      ),
  );
  const participantesIds = moradores
    .filter((morador) => !desmarcados.has(morador.id))
    .map((morador) => morador.id);
  const [tipo, setTipo] = useState<TipoDivisao>(edicao?.tipoDivisao ?? "IGUAL");
  const [partes, setPartes] = useState<Record<number, string>>(edicao?.partes ?? {});
  // C1: sem resposta (null) ao lançar; a Thalita pediu a escolha obrigatória.
  const [recorrente, setRecorrente] = useState<boolean | null>(edicao?.recorrente ?? null);
  const diaDoMes = diaDoTexto(data);
  // Só os marcados contam na soma (B5); a API confere de novo ao salvar.
  const conferencia =
    tipo === "IGUAL"
      ? null
      : conferePartes(
          tipo,
          valor,
          participantesIds.map((id) => partes[id] ?? ""),
        );
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
    // Os obrigatórios são conferidos aqui, com aviso no estilo do site: o
    // balão do navegador some rápido e aceitava descrição só com espaços.
    if (descricao.trim() === "") {
      setAviso({ tipo: "erro", texto: "Informe a descrição da despesa." });
      return;
    }
    if (valor.trim() === "") {
      setAviso({ tipo: "erro", texto: "Informe o valor da despesa." });
      return;
    }
    if (recorrente === null) {
      setAviso({ tipo: "erro", texto: "Responda se esta despesa é recorrente." });
      return;
    }
    setEnviando(true);
    try {
      const url = `/api/republicas/${republica.id}/despesas${edicao ? `/${edicao.id}` : ""}`;
      const resposta = await fetch(url, {
        method: edicao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        // Na edição, moradorId diz quem está usando o app: só quem pagou edita.
        body: JSON.stringify({
          descricao,
          valor,
          data,
          pagadorId,
          participantesIds,
          tipoDivisao: tipo,
          partes:
            tipo === "IGUAL"
              ? undefined
              : participantesIds.map((id) => ({ moradorId: id, valor: partes[id] ?? "" })),
          moradorId,
          recorrente,
        }),
      });
      const corpo = await resposta.json();
      if (edicao && resposta.ok) {
        navigate(`/despesas/${edicao.id}`, {
          state: edicao.voltarPara ? { voltarPara: edicao.voltarPara } : undefined,
        });
        return;
      }
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível lançar a despesa." });
        return;
      }
      setAviso({ tipo: "ok", texto: `Despesa "${corpo.descricao}" lançada.` });
      setRateio({
        pagadorId: corpo.pagadorId,
        tipoDivisao: corpo.tipoDivisao,
        participacoes: corpo.participacoes,
      });
      setDescricao("");
      setValor("");
      setRecorrente(null);
      setPartes({});
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
    <form onSubmit={enviar} className="cartao formulario" noValidate>
      <h2>{edicao ? "Editar despesa" : "Nova despesa"}</h2>

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

      <CampoData rotulo="Data" valor={data} aoMudar={setData} max={hojeNaCasa()} />

      <EscolhaMorador
        rotulo="Quem pagou"
        moradores={moradores}
        valor={pagadorId}
        aoMudar={setPagadorId}
      />

      <ParticipantesRateio
        moradores={moradores}
        pagadorId={pagadorId}
        desmarcados={desmarcados}
        alternar={alternar}
        tipo={tipo}
        aoMudarTipo={(novo) => {
          // Valores em R$ não servem como percentual, e vice-versa.
          setTipo(novo);
          setPartes({});
        }}
        partes={partes}
        aoMudarParte={(id, texto) => setPartes((atual) => ({ ...atual, [id]: texto }))}
        conferencia={conferencia}
      />

      {/* C1: separada do rateio; sim ou não, obrigatório. */}
      <fieldset className="participantes repete">
        <legend>Deseja que esta despesa seja recorrente?</legend>
        <p className="participantes-resumo">
          Se escolher sim, você pode parar de repetir quando quiser, no detalhe da despesa ou
          editando-a. O que já foi lançado continua salvo.
        </p>
        {[
          {
            valor: true,
            titulo: "Sim, repete todo mês",
            descricao: "Para contas fixas, como aluguel e internet.",
          },
          {
            valor: false,
            titulo: "Não, é uma despesa avulsa",
            descricao: "Lançada uma vez só, como uma compra de mercado.",
          },
        ].map((opcao) => (
          <div key={opcao.titulo} className="cartao participante">
            <label className="participante-rotulo">
              <input
                type="radio"
                name="recorrente"
                checked={recorrente === opcao.valor}
                onChange={() => setRecorrente(opcao.valor)}
              />
              <span className="repete-texto">
                {opcao.titulo}
                <small>{opcao.descricao}</small>
                {opcao.valor && recorrente && diaDoMes && (
                  <small className="repete-dia">↻ {textoRecorrencia(diaDoMes)}</small>
                )}
              </span>
            </label>
          </div>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={
          enviando ||
          foraDoAr ||
          participantesIds.length === 0 ||
          (conferencia !== null && !conferencia.fecha)
        }
        className="botao-principal"
      >
        {foraDoAr
          ? "Servidor indisponível"
          : edicao
            ? enviando
              ? "Salvando..."
              : "Salvar alterações"
            : enviando
              ? "Lançando..."
              : "Lançar despesa"}
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
            {TITULO_DIVISAO[rateio.tipoDivisao]} entre {rateio.participacoes.length}{" "}
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
