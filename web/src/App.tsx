import { Link, Route, Routes } from "react-router-dom";
import CriarRepublica from "./CriarRepublica";
import Inicio from "./Inicio";
import Despesas from "./Despesas";
import Layout from "./Layout";
import { ProvedorMoradorAtual } from "./MoradorAtual";
import Moradores from "./Moradores";
import NovaDespesa from "./NovaDespesa";
import { ProvedorStatusApi } from "./StatusApi";
import Saldos from "./Saldos";

function PaginaNovaDespesa() {
  return (
    <>
      <p>
        <Link to="/despesas">Voltar</Link>
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
            <ProvedorMoradorAtual>
              <Layout />
            </ProvedorMoradorAtual>
          </ProvedorStatusApi>
        }
      >
        <Route path="/" element={<Inicio />} />
        <Route path="/despesas" element={<Despesas />} />
        <Route path="/despesas/nova" element={<PaginaNovaDespesa />} />
        <Route path="/saldos" element={<Saldos />} />
        <Route path="/moradores" element={<Moradores />} />
        <Route path="/republicas/nova" element={<CriarRepublica />} />
      </Route>
    </Routes>
  );
}
