import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { interpretaId } from "../despesas/validacao";
import {
  adicionarMorador,
  consultaConvite,
  gerarConvite,
  marcarSaida,
  usarConvite,
} from "./servico";

export const rotasMoradores = Router();

// Adicionar morador (A2): só o organizador, informado em moradorId no corpo.
rotasMoradores.post("/republicas/:republicaId/moradores", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.status(201).json(await adicionarMorador(republicaId, req.body ?? {}));
});

// Marcar a saída (A4): só o organizador, informado em moradorId no corpo.
rotasMoradores.delete("/republicas/:republicaId/moradores/:alvoId", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  const alvoId = interpretaId(req.params.alvoId, "Id do morador");
  res.json(await marcarSaida(republicaId, alvoId, req.body?.moradorId));
});

// Convite por link (A5): o organizador gera; quem recebe consulta e usa.
rotasMoradores.post("/republicas/:republicaId/convites", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.status(201).json(await gerarConvite(republicaId, req.body?.moradorId));
});

rotasMoradores.get("/convites/:token", async (req, res) => {
  res.json(await consultaConvite(req.params.token));
});

rotasMoradores.post("/convites/:token", async (req, res) => {
  res.status(201).json(await usarConvite(req.params.token, req.body ?? {}));
});
