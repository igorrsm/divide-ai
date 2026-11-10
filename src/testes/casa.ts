import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../app";

// Montagem de dados para os testes de integração. Tudo entra pela própria API,
// como a tela faz, então as regras de criação também valem aqui.

/** Uma data passada qualquer: a API recusa datas futuras. */
export const DATA = "2026-10-01";

/**
 * Cria uma república com o organizador e os outros moradores, em ordem, e
 * devolve os ids por nome. Os e-mails levam o nome da casa, para dar para
 * montar duas casas no mesmo teste (o e-mail é único no banco inteiro).
 */
export async function montaCasa(outros: string[] = [], nome = "Casa Azul", organizador = "Ana") {
  const dominio = `${nome.toLowerCase().replace(/\s+/g, "-")}.exemplo`;
  const criada = await request(app).post("/api/republicas").send({
    nome,
    nomeOrganizador: organizador,
    emailOrganizador: `${organizador.toLowerCase()}@${dominio}`,
  });
  assert.equal(criada.status, 201, JSON.stringify(criada.body));
  const republicaId: number = criada.body.id;
  const ids: Record<string, number> = { [organizador]: criada.body.moradores[0].id };
  for (const morador of outros) {
    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids[organizador], nome: morador, email: `${morador.toLowerCase()}@${dominio}` });
    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    ids[morador] = resposta.body.id;
  }
  return { republicaId, ids };
}

/** Lança uma despesa e devolve o id; a descrição e a data têm valor padrão. */
export async function lanca(republicaId: number, despesa: Record<string, unknown>) {
  const resposta = await request(app)
    .post(`/api/republicas/${republicaId}/despesas`)
    .send({ descricao: "Despesa", data: DATA, ...despesa });
  assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
  return resposta.body.id as number;
}

export type SaldoDaApi = {
  moradorId: number;
  nome: string;
  saldoCentavos: number;
  situacao: string;
  saiu: boolean;
};

export async function saldos(republicaId: number) {
  const resposta = await request(app).get(`/api/republicas/${republicaId}/saldos`);
  assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
  return resposta.body as SaldoDaApi[];
}

/** Só nome → centavos, para o assert ler como a tela. */
export function porNome(lista: { nome: string; saldoCentavos: number }[]) {
  return Object.fromEntries(lista.map((s) => [s.nome, s.saldoCentavos]));
}
