import { useEffect, useState } from "react";

type Status = "verificando..." | "ok" | "fora do ar";

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

  return <p>API: {status}</p>;
}
