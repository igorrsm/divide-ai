import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { buscaSaldos, buscaTransferencias } from "./servico";

export const rotasSaldos = Router();

// Alimenta o painel de saldos (D2): um item por morador, com a situação pronta.
rotasSaldos.get("/republicas/:republicaId/saldos", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.json(await buscaSaldos(republicaId));
});

// Sugestão de acertos (D5): quem paga quanto a quem para zerar os saldos.
rotasSaldos.get("/republicas/:republicaId/saldos/transferencias", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.json(await buscaTransferencias(republicaId));
});
