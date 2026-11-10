import { app } from "./app";

const porta = Number(process.env.PORT ?? 3000);

app.listen(porta, () => {
  console.log(`API escutando em http://localhost:${porta}`);
});
