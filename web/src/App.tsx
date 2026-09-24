import { Link, Route, Routes } from "react-router-dom";
import NovaDespesa from "./NovaDespesa";
import StatusApi from "./StatusApi";

// Respiro nas laterais para o conteúdo não encostar na borda em 375 px.
const pagina = { padding: "1rem", fontFamily: "system-ui, sans-serif" };

function Inicio() {
  return (
    <div style={pagina}>
      <h1>Divide Aí</h1>
      <StatusApi />
      <p>
        <Link to="/despesas/nova">Lançar despesa</Link>
      </p>
    </div>
  );
}

function PaginaNovaDespesa() {
  return (
    <div style={pagina}>
      <p>
        <Link to="/">Voltar</Link>
      </p>
      <NovaDespesa />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/despesas/nova" element={<PaginaNovaDespesa />} />
    </Routes>
  );
}
