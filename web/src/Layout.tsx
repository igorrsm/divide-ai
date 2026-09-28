import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useRepublicaAtual } from "./RepublicaAtual";
import SeletorMorador from "./SeletorMorador";
import StatusApi, { useApiForaDoAr } from "./StatusApi";

const ITENS_MENU = [
  { para: "/despesas", rotulo: "Despesas" },
  { para: "/saldos", rotulo: "Saldos" },
  { para: "/moradores", rotulo: "Moradores" },
];

/** "Despesas" fica marcado também em /despesas/nova. */
function estaAtivo(para: string, caminho: string): boolean {
  return caminho.startsWith(para);
}

/** Moldura de todas as telas: cabeçalho amarelo, conteúdo e menu inferior. */
export default function Layout() {
  const { pathname } = useLocation();
  const { republica } = useRepublicaAtual();
  const foraDoAr = useApiForaDoAr();

  // Sem API nenhuma tela além do início funciona: volta para lá e trava o menu.
  if (foraDoAr && pathname !== "/") return <Navigate to="/" replace />;

  return (
    <div className="layout">
      <header className="cabecalho">
        <div className="cabecalho-topo">
          <Link to="/" className="marca">
            Divide Aí
          </Link>
          <span className="republica">{republica.nome}</span>
        </div>
        <SeletorMorador />
      </header>

      <main className="conteudo">
        <StatusApi />
        <Outlet />
      </main>

      <nav className="menu" aria-label="Principal">
        {ITENS_MENU.map((item) => {
          const ativo = estaAtivo(item.para, pathname);
          if (foraDoAr) {
            return (
              <span key={item.para} className="menu-item desativado" aria-disabled="true">
                {item.rotulo}
              </span>
            );
          }
          return (
            <Link
              key={item.para}
              to={item.para}
              className={ativo ? "menu-item ativo" : "menu-item"}
              aria-current={ativo ? "page" : undefined}
            >
              {item.rotulo}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
