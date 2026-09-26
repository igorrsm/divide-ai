import { Link, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import NovaDespesa from "./NovaDespesa";
import StatusApi from "./StatusApi";

function Inicio() {
  return (
    <>
      <h1>Despesas</h1>
      <StatusApi />
      <p>
        <Link to="/despesas/nova">Lançar despesa</Link>
      </p>
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
      </Route>
    </Routes>
  );
}
