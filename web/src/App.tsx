import { Link, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Moradores from "./Moradores";
import NovaDespesa from "./NovaDespesa";
import { ProvedorStatusApi, useApiForaDoAr } from "./StatusApi";
import Saldos from "./Saldos";

function Inicio() {
  const foraDoAr = useApiForaDoAr();

  return (
    <>
      <h1>Despesas</h1>
      {foraDoAr ? (
        <button type="button" className="botao-principal" disabled>
          Lançar despesa
        </button>
      ) : (
        <Link to="/despesas/nova" className="botao-principal">
          Lançar despesa
        </Link>
      )}
    </>
  );
}

function PaginaNovaDespesa() {
  return (
    <>
      <p>
        <Link to="/">Voltar</Link>
      </p>
      <NovaDespesa />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <ProvedorStatusApi>
            <Layout />
          </ProvedorStatusApi>
        }
      >
        <Route path="/" element={<Inicio />} />
        <Route path="/despesas/nova" element={<PaginaNovaDespesa />} />
        <Route path="/saldos" element={<Saldos />} />
        <Route path="/moradores" element={<Moradores />} />
      </Route>
    </Routes>
  );
}
