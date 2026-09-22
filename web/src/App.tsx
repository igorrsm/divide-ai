import { Route, Routes } from "react-router-dom";
import StatusApi from "./StatusApi";

function Inicio() {
  return (
    <>
      <h1>Divide Aí</h1>
      <StatusApi />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
    </Routes>
  );
}
