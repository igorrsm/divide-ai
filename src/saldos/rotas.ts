import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { buscaSaldos } from "./servico";

export const rotasSaldos = Router();

// Alimenta o painel de saldos (D2): um item por morador, com a situação pronta.
rotasSaldos.get("/republicas/:republicaId/saldos", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.json(await buscaSaldos(republicaId));
});
