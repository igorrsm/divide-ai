import { useEffect, useState } from "react";

type Status = "verificando..." | "ok" | "fora do ar";

/**
 * Consulta GET /api/health (T3). Com a API no ar não mostra nada; se ela não
 * responder, avisa no topo da tela em vez de deixar as telas falharem caladas.
 */
export default function StatusApi() {
  const [status, setStatus] = useState<Status>("verificando...");

  useEffect(() => {
    fetch("/api/health")
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        return resposta.json() as Promise<{ status: string }>;
      })
      .then((corpo) => setStatus(corpo.status === "ok" ? "ok" : "fora do ar"))
      .catch(() => setStatus("fora do ar"));
  }, []);

  if (status !== "fora do ar") return null;

  return (
    <p role="alert" className="aviso aviso-erro">
      <strong>Servidor indisponível:</strong> Não foi possível acessar o servidor.
    </p>
  );
}
