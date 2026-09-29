import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

// Chave do navegador onde fica guardado quem está usando o app.
const CHAVE = "divide-ai:morador";

export type Morador = {
  id: number;
  nome: string;
  email: string;
  organizador: boolean;
  /** Dia em que saiu da casa (A4), em AAAA-MM-DD; null para quem mora lá. */
  saiuEm: string | null;
};

type Contexto = {
  /** Só quem mora na casa: é a lista das escolhas (quem pagou, participantes...). */
  moradores: Morador[];
  /** Também quem saiu (A4): lista de moradores, pagamentos, filtros e edição. */
  todos: Morador[];
  moradorId: number | null;
  escolher: (id: number) => void;
  /** true quando a última busca da lista de moradores falhou. */
  erro: boolean;
  /** Busca a lista de novo, depois de adicionar um morador (A2). */
  recarregar: () => void;
};

const ContextoMorador = createContext<Contexto>({
  moradores: [],
  todos: [],
  moradorId: null,
  escolher: () => {},
  erro: false,
  recarregar: () => {},
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
  const { republica } = useRepublicaAtual();
  const [todos, setTodos] = useState<Morador[]>([]);
  const [moradorId, setMoradorId] = useState<number | null>(lerSalvo);
  const [erro, setErro] = useState(false);
  const [versao, setVersao] = useState(0);
  const foraDoAr = useApiForaDoAr();

  // Carrega de novo quando a API volta ou a república muda, para o seletor atualizar.
  useEffect(() => {
    if (foraDoAr) return;
    fetch(`/api/republicas/${republica.id}/moradores`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error();
        return resposta.json() as Promise<Morador[]>;
      })
      .then((lista) => {
        setTodos(lista);
        setErro(false);
        // Se o morador salvo não existe mais (ex.: banco recriado), esquece.
        setMoradorId((atual) => {
          // Quem saiu da casa (A4) também deixa de ser escolhido.
          if (atual === null || lista.some((m) => m.id === atual && !m.saiuEm)) return atual;
          salvar(null);
          return null;
        });
      })
      .catch(() => {
        setTodos([]);
        setErro(true);
      });
  }, [republica.id, foraDoAr, versao]);

  const moradores = todos.filter((m) => !m.saiuEm);

  function escolher(id: number) {
    setMoradorId(id);
    salvar(id);
  }

  return (
    <ContextoMorador.Provider
      value={{
        moradores,
        todos,
        moradorId,
        escolher,
        erro,
        recarregar: () => setVersao((v) => v + 1),
      }}
    >
      {children}
    </ContextoMorador.Provider>
  );
}
