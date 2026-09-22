import { Route, Routes } from "react-router-dom";

function Inicio() {
  return <h1>Divide Aí</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
    </Routes>
  );
}
