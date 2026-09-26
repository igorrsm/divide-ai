import { Link, Outlet, useLocation } from "react-router-dom";
import StatusApi from "./StatusApi";

// Fixo até a A1 (criar república) entrar. É a república criada pelo seed.
const NOME_REPUBLICA = "República Demo";

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

  return (
    <div className="layout">
      <header className="cabecalho">
        <div className="cabecalho-topo">
          <Link to="/" className="marca">
            Divide Aí
          </Link>
          <span className="republica">{NOME_REPUBLICA}</span>
        </div>
        {/* O seletor "Quem é você?" entra aqui com a A3 (#9). */}
      </header>

      <main className="conteudo">
        <StatusApi />
        <Outlet />
      </main>

      <nav className="menu" aria-label="Principal">
        {ITENS_MENU.map((item) => {
          const ativo = estaAtivo(item.para, pathname);
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
