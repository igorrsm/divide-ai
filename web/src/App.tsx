import { Link, Route, Routes } from "react-router-dom";
import CriarRepublica from "./CriarRepublica";
import Inicio from "./Inicio";
import Despesas from "./Despesas";
import DetalheDespesa from "./DetalheDespesa";
import EditarDespesa from "./EditarDespesa";
import Extrato from "./Extrato";
import Layout from "./Layout";
import { ProvedorMoradorAtual } from "./MoradorAtual";
import Moradores from "./Moradores";
import NovaDespesa from "./NovaDespesa";
import { ProvedorStatusApi } from "./StatusApi";
import Saldos from "./Saldos";

function PaginaNovaDespesa() {
  return (
    <>
      <Link to="/despesas" className="voltar">
        <span aria-hidden="true">←</span> Voltar
      </Link>
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
        <Route path="/despesas/:id" element={<DetalheDespesa />} />
        <Route path="/extrato" element={<Extrato />} />
        <Route path="/despesas/:id/editar" element={<EditarDespesa />} />
        <Route path="/saldos" element={<Saldos />} />
        <Route path="/moradores" element={<Moradores />} />
        <Route path="/republicas/nova" element={<CriarRepublica />} />
      </Route>
    </Routes>
  );
}
