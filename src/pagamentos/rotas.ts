import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { listaPagamentos, registrarPagamento } from "./servico";

export const rotasPagamentos = Router();

// Lista dos acertos registrados (D3), embaixo do painel de saldos.
rotasPagamentos.get("/republicas/:republicaId/pagamentos", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.json(await listaPagamentos(republicaId));
});

// Registra um acerto: { pagadorId, recebedorId, valor, data }.
rotasPagamentos.post("/republicas/:republicaId/pagamentos", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.status(201).json(await registrarPagamento(republicaId, req.body ?? {}));
});
