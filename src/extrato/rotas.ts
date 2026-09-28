import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { interpretaMes } from "./mes";
import { buscaExtrato } from "./servico";

export const rotasExtrato = Router();

// Alimenta a tela do extrato (E1). ?mes=AAAA-MM; sem ele, o mês atual.
rotasExtrato.get("/republicas/:republicaId/extrato", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const mes = interpretaMes(req.query.mes);
  res.json(await buscaExtrato(republicaId, mes));
});
