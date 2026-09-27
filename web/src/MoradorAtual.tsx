import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useApiForaDoAr } from "./StatusApi";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const REPUBLICA_ID = 1;

// Chave do navegador onde fica guardado quem está usando o app.
const CHAVE = "divide-ai:morador";

export type Morador = { id: number; nome: string };

type Contexto = {
  moradores: Morador[];
  moradorId: number | null;
  escolher: (id: number) => void;
};

const ContextoMorador = createContext<Contexto>({
  moradores: [],
  moradorId: null,
  escolher: () => {},
});

/** Morador escolhido em "Quem é você?" e a lista de moradores da república. */
export function useMoradorAtual(): Contexto {
  return useContext(ContextoMorador);
}

// O localStorage pode falhar (aba anônima, bloqueio do navegador).
// Nesse caso a escolha só vale até recarregar a página.
function lerSalvo(): number | null {
  try {
    const salvo = Number(localStorage.getItem(CHAVE));
    return salvo > 0 ? salvo : null;
  } catch {
    return null;
  }
}

function salvar(id: number | null) {
  try {
    if (id === null) localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, String(id));
  } catch {
    // Sem localStorage a escolha fica só na memória.
  }
}

/** Carrega os moradores e lembra quem está usando o app neste navegador. */
export function ProvedorMoradorAtual({ children }: { children: ReactNode }) {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [moradorId, setMoradorId] = useState<number | null>(lerSalvo);
  const foraDoAr = useApiForaDoAr();

  // Carrega de novo quando a API volta, para o seletor não ficar vazio.
  useEffect(() => {
    if (foraDoAr) return;
    fetch(`/api/republicas/${REPUBLICA_ID}/moradores`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Morador[]>;
      })
      .then((lista) => {
        setMoradores(lista);
        // Se o morador salvo não existe mais (ex.: banco recriado), esquece.
        setMoradorId((atual) => {
          if (atual === null || lista.some((m) => m.id === atual)) return atual;
          salvar(null);
          return null;
        });
      })
      .catch(() => setMoradores([]));
  }, [foraDoAr]);

  function escolher(id: number) {
    setMoradorId(id);
    salvar(id);
  }

  return (
    <ContextoMorador.Provider value={{ moradores, moradorId, escolher }}>
      {children}
    </ContextoMorador.Provider>
  );
}
