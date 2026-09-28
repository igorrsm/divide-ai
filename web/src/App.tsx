import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
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
import Voltar from "./Voltar";

/** Telas do menu e Criar república: o Voltar leva para a tela inicial. */
function TelaPrincipal({ children }: { children: ReactNode }) {
  return (
    <>
      <Voltar para="/" />
      {children}
    </>
  );
}

function PaginaNovaDespesa() {
  return (
    <>
      <Voltar para="/despesas" />
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
        <Route path="/despesas" element={<TelaPrincipal><Despesas /></TelaPrincipal>} />
        <Route path="/despesas/nova" element={<PaginaNovaDespesa />} />
        <Route path="/despesas/:id" element={<DetalheDespesa />} />
        <Route path="/extrato" element={<Extrato />} />
        <Route path="/despesas/:id/editar" element={<EditarDespesa />} />
        <Route path="/saldos" element={<TelaPrincipal><Saldos /></TelaPrincipal>} />
        <Route path="/moradores" element={<TelaPrincipal><Moradores /></TelaPrincipal>} />
        <Route path="/republicas/nova" element={<TelaPrincipal><CriarRepublica /></TelaPrincipal>} />
      </Route>
    </Routes>
  );
}
