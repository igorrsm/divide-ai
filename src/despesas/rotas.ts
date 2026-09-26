import { Router } from "express";
import { ErroNaoEncontrado } from "../erros";
import { buscaRepublica, criarDespesa, listaMoradores } from "./servico";
import { interpretaId } from "./validacao";

export const rotasDespesas = Router();

/** República inexistente é 404, separado dos 400 de regra de negócio. */
async function idDaRepublica(bruto: unknown): Promise<number> {
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

rotasDespesas.post("/republicas/:republicaId/despesas", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const despesa = await criarDespesa(republicaId, req.body ?? {});
  res.status(201).json(despesa);
});
