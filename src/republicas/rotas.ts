import { Router } from "express";
import { interpretaId } from "../despesas/validacao";
import { ErroNaoEncontrado } from "../erros";
import { buscaRepublica, criarRepublica } from "./servico";

export const rotasRepublicas = Router();

rotasRepublicas.get("/republicas/:id", async (req, res) => {
  const id = interpretaId(req.params.id, "República");
  const republica = await buscaRepublica(id);
  if (!republica) {
    throw new ErroNaoEncontrado("República não encontrada.");
  }
  res.json(republica);
});

rotasRepublicas.post("/republicas", async (req, res) => {
  const republica = await criarRepublica(req.body ?? {});
  res.status(201).json(republica);
});
