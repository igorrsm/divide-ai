import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useApiForaDoAr } from "./StatusApi";

const REPUBLICA_PADRAO = { id: 1, nome: "República Demo" };
const CHAVE = "divide-ai:republica";

export type Republica = { id: number; nome: string };

type Contexto = {
  republica: Republica;
  escolherRepublica: (rep: Republica) => void;
};

const ContextoRepublica = createContext<Contexto>({
  republica: REPUBLICA_PADRAO,
  escolherRepublica: () => {},
});

/** República ativa no momento, usada pelo cabeçalho e pelas telas. */
export function useRepublicaAtual(): Contexto {
  return useContext(ContextoRepublica);
}

function lerSalvo(): Republica {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (!salvo) return REPUBLICA_PADRAO;
    const parsed = JSON.parse(salvo);
    if (parsed && typeof parsed.id === "number" && typeof parsed.nome === "string") {
      return parsed;
    }
    return REPUBLICA_PADRAO;
  } catch {
    return REPUBLICA_PADRAO;
  }
}

function salvar(rep: Republica) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(rep));
  } catch {
    // Sem localStorage a escolha fica apenas na memória da sessão.
  }
}

/** Provê a república ativa no navegador. */
export function ProvedorRepublicaAtual({ children }: { children: ReactNode }) {
  const [republica, setRepublica] = useState<Republica>(lerSalvo);
  const foraDoAr = useApiForaDoAr();

  useEffect(() => {
    if (foraDoAr) return;
    let ativo = true;
    fetch(`/api/republicas/${republica.id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<{ id: number; nome: string }>;
      })
      .then((dados) => {
        if (ativo && dados.nome !== republica.nome) {
          const atualizada = { id: dados.id, nome: dados.nome };
          setRepublica(atualizada);
          salvar(atualizada);
        }
      })
      .catch(() => {
        // Se a república salva não existe mais (ex.: banco recriado), volta à padrão.
        if (ativo && republica.id !== REPUBLICA_PADRAO.id) {
          setRepublica(REPUBLICA_PADRAO);
          salvar(REPUBLICA_PADRAO);
        }
      });
    return () => {
      ativo = false;
    };
  }, [republica.id, foraDoAr]);

  function escolherRepublica(rep: Republica) {
    setRepublica(rep);
    salvar(rep);
  }

  return (
    <ContextoRepublica.Provider value={{ republica, escolherRepublica }}>
      {children}
    </ContextoRepublica.Provider>
  );
}
