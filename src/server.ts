import express, { type NextFunction, type Request, type Response } from "express";
import { rotasDespesas } from "./despesas/rotas";
import { ErroDeValidacao, ErroNaoEncontrado } from "./erros";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", rotasDespesas);

// O Express 5 encaminha rejeição de handler async para cá.
app.use((erro: unknown, _req: Request, res: Response, _proximo: NextFunction) => {
  if (erro instanceof ErroDeValidacao) {
    res.status(400).json({ erro: erro.message });
    return;
  }
  if (erro instanceof ErroNaoEncontrado) {
    res.status(404).json({ erro: erro.message });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno no servidor." });
});

const porta = Number(process.env.PORT ?? 3000);

app.listen(porta, () => {
  console.log(`API escutando em http://localhost:${porta}`);
});
