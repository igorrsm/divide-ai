import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { formatarPercentual, type TipoDivisao } from "./divisao";
import NovaDespesa, { centavosParaTexto, type DespesaEmEdicao } from "./NovaDespesa";
import Voltar, { useOrigem } from "./Voltar";

/** O que o formulário precisa do detalhe da despesa. */
type Detalhe = {
  descricao: string;
  valorCentavos: number;
  data: string;
  pagador: { id: number; nome: string };
  tipoDivisao: TipoDivisao;
  participacoes: {
    valorCentavos: number;
    percentualCentesimos: number | null;
    morador: { id: number };
  }[];
};

/** Os números de cada participante como a pessoa digitou (B5). */
function partesDe(despesa: Detalhe): Record<number, string> {
  if (despesa.tipoDivisao === "IGUAL") return {};
  return Object.fromEntries(
    despesa.participacoes.map((p) => [
      p.morador.id,
      despesa.tipoDivisao === "VALOR"
        ? centavosParaTexto(p.valorCentavos)
        : formatarPercentual(p.percentualCentesimos ?? 0),
    ]),
  );
}

/** Tela de editar despesa (B6): só quem pagou vê o formulário. */
export default function EditarDespesa() {
  const { id } = useParams();
  const { republica } = useRepublicaAtual();
  const [despesa, setDespesa] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const { moradores, moradorId } = useMoradorAtual();
  // Origem do detalhe (lista filtrada ou extrato), repassada adiante.
  const origem = useOrigem();

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${republica.id}/despesas/${id}`)
      .then((resposta) => {
        if (resposta.status === 404 || resposta.status === 400) {
          throw new Error("Despesa não encontrada.");
        }
        if (!resposta.ok) throw new Error("Não foi possível carregar a despesa.");
        return resposta.json() as Promise<Detalhe>;
      })
      .then((dados) => {
        if (ativo) setDespesa(dados);
      })
      .catch((motivo: Error) => {
        if (ativo) setErro(motivo.message);
      });
    return () => {
      ativo = false;
    };
  }, [republica.id, id]);

  let conteudo: ReactNode;
  if (erro) {
    conteudo = (
      <p role="status" className="aviso aviso-erro">
        {erro}
      </p>
    );
  } else if (despesa === null || moradores.length === 0) {
    // Espera os moradores também: os participantes começam a partir deles.
    conteudo = <p>Carregando despesa…</p>;
  } else if (despesa.pagador.id !== moradorId) {
    conteudo = (
      <p role="status" className="aviso aviso-erro">
        Só quem pagou ({despesa.pagador.nome}) pode editar esta despesa.
      </p>
    );
  } else {
    const edicao: DespesaEmEdicao = {
      id: Number(id),
      descricao: despesa.descricao,
      valorCentavos: despesa.valorCentavos,
      data: despesa.data,
      pagadorId: despesa.pagador.id,
      participantesIds: despesa.participacoes.map((p) => p.morador.id),
      tipoDivisao: despesa.tipoDivisao,
      partes: partesDe(despesa),
      voltarPara: origem ?? undefined,
    };
    conteudo = <NovaDespesa edicao={edicao} />;
  }

  return (
    <>
      <Voltar para={`/despesas/${id}`} estado={origem ? { voltarPara: origem } : undefined} />
      {conteudo}
    </>
  );
}
