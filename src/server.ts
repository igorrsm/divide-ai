import express, { type NextFunction, type Request, type Response } from "express";
import { rotasDespesas } from "./despesas/rotas";
import { rotasExtrato } from "./extrato/rotas";
import { rotasPagamentos } from "./pagamentos/rotas";
import { rotasRepublicas } from "./republicas/rotas";
import { rotasSaldos } from "./saldos/rotas";
import { ErroDeValidacao, ErroNaoEncontrado, ErroSemPermissao } from "./erros";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", rotasDespesas);
app.use("/api", rotasRepublicas);
app.use("/api", rotasSaldos);
app.use("/api", rotasExtrato);
app.use("/api", rotasPagamentos);

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
  if (erro instanceof ErroSemPermissao) {
    res.status(403).json({ erro: erro.message });
    return;
  }
  // JSON malformado no corpo: o express.json() marca o erro com esse type.
  // É erro de quem chamou, não do servidor.
  if (erro instanceof SyntaxError && "type" in erro && erro.type === "entity.parse.failed") {
    res.status(400).json({ erro: "Corpo da requisição não é um JSON válido." });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: "Erro interno no servidor." });
});

const porta = Number(process.env.PORT ?? 3000);

app.listen(porta, () => {
  console.log(`API escutando em http://localhost:${porta}`);
});
