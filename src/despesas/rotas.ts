import { Router } from "express";
import { ErroNaoEncontrado } from "../erros";
import {
  buscaDespesa,
  buscaRepublica,
  criarDespesa,
  editarDespesa,
  excluirDespesa,
  listaDespesas,
  listaMoradores,
} from "./servico";
import { interpretaFiltros } from "./filtros";
import { interpretaId } from "./validacao";

export const rotasDespesas = Router();

/** República inexistente é 404, separado dos 400 de regra de negócio. */
export async function idDaRepublica(bruto: unknown): Promise<number> {
  const id = interpretaId(bruto, "República");
  if (!(await buscaRepublica(id))) {
    throw new ErroNaoEncontrado("República não encontrada.");
  }
  return id;
}

// Alimenta o seletor de quem pagou no formulário de nova despesa.
rotasDespesas.get("/republicas/:republicaId/moradores", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.json(await listaMoradores(republicaId));
});

// Alimenta a lista de despesas (B3), com ?de, ?ate e ?moradorId opcionais (E2).
rotasDespesas.get("/republicas/:republicaId/despesas", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const idsDaCasa = (await listaMoradores(republicaId)).map((morador) => morador.id);
  const filtros = interpretaFiltros(req.query, idsDaCasa);
  res.json(await listaDespesas(republicaId, filtros));
});

// Detalhe com o rateio por morador (B3).
rotasDespesas.get("/republicas/:republicaId/despesas/:despesaId", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const despesaId = interpretaId(req.params.despesaId, "Id da despesa");
  res.json(await buscaDespesa(republicaId, despesaId));
});

rotasDespesas.post("/republicas/:republicaId/despesas", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const despesa = await criarDespesa(republicaId, req.body ?? {});
  res.status(201).json(despesa);
});

// Editar e excluir (B6): só quem pagou, informado em moradorId no corpo.
rotasDespesas.put("/republicas/:republicaId/despesas/:despesaId", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const despesaId = interpretaId(req.params.despesaId, "Id da despesa");
  res.json(await editarDespesa(republicaId, despesaId, req.body ?? {}));
});

rotasDespesas.delete("/republicas/:republicaId/despesas/:despesaId", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const despesaId = interpretaId(req.params.despesaId, "Id da despesa");
  await excluirDespesa(republicaId, despesaId, req.body?.moradorId);
  res.status(204).end();
});
