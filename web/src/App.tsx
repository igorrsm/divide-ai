import { Link, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Moradores from "./Moradores";
import NovaDespesa from "./NovaDespesa";
import Saldos from "./Saldos";

function Inicio() {
  return (
    <>
      <h1>Despesas</h1>
      <Link to="/despesas/nova" className="botao-principal">
        Lançar despesa
      </Link>
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
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/despesas/nova" element={<PaginaNovaDespesa />} />
        <Route path="/saldos" element={<Saldos />} />
        <Route path="/moradores" element={<Moradores />} />
      </Route>
    </Routes>
  );
}
