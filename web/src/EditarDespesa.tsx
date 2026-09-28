import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useMoradorAtual } from "./MoradorAtual";
import NovaDespesa, { type DespesaEmEdicao } from "./NovaDespesa";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

/** O que o formulário precisa do detalhe da despesa. */
type Detalhe = {
  descricao: string;
  valorCentavos: number;
  data: string;
  pagador: { id: number; nome: string };
  participacoes: { morador: { id: number } }[];
};

/** Tela de editar despesa (B6): só quem pagou vê o formulário. */
export default function EditarDespesa() {
  const { id } = useParams();
  const [despesa, setDespesa] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const { moradores, moradorId } = useMoradorAtual();

  useEffect(() => {
    let ativo = true;
    fetch(`/api/republicas/${REPUBLICA_ID}/despesas/${id}`)
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
  }, [id]);

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
    };
    conteudo = <NovaDespesa edicao={edicao} />;
  }

  return (
    <>
      <Link to={`/despesas/${id}`} className="voltar">
        <span aria-hidden="true">←</span> Voltar
      </Link>
      {conteudo}
    </>
  );
}
