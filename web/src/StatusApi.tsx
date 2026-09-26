import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Status = "verificando" | "ok" | "fora do ar";

// Intervalo entre as consultas a GET /api/health.
const INTERVALO_MS = 10_000;

const ContextoStatusApi = createContext<Status>("verificando");

/** true quando a última consulta a /api/health falhou. */
export function useApiForaDoAr(): boolean {
  return useContext(ContextoStatusApi) === "fora do ar";
}

async function consultarApi(): Promise<Status> {
  try {
    const resposta = await fetch("/api/health");
    if (!resposta.ok) return "fora do ar";
    const corpo = (await resposta.json()) as { status: string };
    return corpo.status === "ok" ? "ok" : "fora do ar";
  } catch {
    return "fora do ar";
  }
}

/**
 * Consulta GET /api/health (T3) ao abrir e a cada 10 s, e compartilha o
 * resultado com as telas. Quando a API volta, as telas destravam sozinhas.
 */
export function ProvedorStatusApi({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("verificando");

  useEffect(() => {
    let ativo = true;
    const atualizar = () =>
      consultarApi().then((novo) => {
        if (ativo) setStatus(novo);
      });
    atualizar();
    const intervalo = setInterval(atualizar, INTERVALO_MS);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  return <ContextoStatusApi.Provider value={status}>{children}</ContextoStatusApi.Provider>;
}

/** Aviso no topo da tela, só quando a API está fora do ar. */
export default function StatusApi() {
  if (!useApiForaDoAr()) return null;

  return (
    <p role="alert" className="aviso aviso-erro">
      <strong>Servidor indisponível:</strong> Não foi possível acessar o servidor.
    </p>
  );
}
