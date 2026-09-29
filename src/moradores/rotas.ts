import { Router } from "express";
import { idDaRepublica } from "../despesas/rotas";
import { adicionarMorador } from "./servico";

export const rotasMoradores = Router();

// Adicionar morador (A2): só o organizador, informado em moradorId no corpo.
rotasMoradores.post("/republicas/:republicaId/moradores", async (req, res) => {
  const republicaId = await idDaRepublica(req.params.republicaId);
  res.status(201).json(await adicionarMorador(republicaId, req.body ?? {}));
});
