import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { interpretaMes } from "./mes";
import { buscaExtrato, buscaFechamento } from "./servico";

export const rotasExtrato = Router();

// Alimenta a tela do extrato (E1). ?mes=AAAA-MM; sem ele, o mês atual.
rotasExtrato.get("/republicas/:republicaId/extrato", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const mes = interpretaMes(req.query.mes);
  res.json(await buscaExtrato(republicaId, mes));
});

// Fechamento do mês em CSV (E3), para baixar. O BOM no início faz o Excel em
// português abrir o arquivo como UTF-8, com os acentos certos.
rotasExtrato.get("/republicas/:republicaId/extrato/csv", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const mes = interpretaMes(req.query.mes);
  const csv = await buscaFechamento(republicaId, mes);
  res.type("text/csv; charset=utf-8");
  res.attachment(`fechamento-${mes}.csv`);
  res.send("\uFEFF" + csv);
});
