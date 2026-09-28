import { useMoradorAtual } from "./MoradorAtual";

/** Moradores da república em ordem de entrada (A2). */
export default function Moradores() {
  const { moradores, moradorId, erro: erroLista } = useMoradorAtual();

  // O id cresce com a entrada na casa: ordenar por ele é a ordem de entrada.
  const emOrdem = [...moradores].sort((a, b) => a.id - b.id);

  return (
    <>
      <h1>Moradores</h1>
      {erroLista ? (
        <p role="status" className="aviso aviso-erro">
          Não foi possível carregar os moradores.
        </p>
      ) : (
        <ul className="saldos">
          {emOrdem.map((morador) => {
            const eu = morador.id === moradorId;
            return (
              <li key={morador.id} className={eu ? "cartao saldo saldo-eu" : "cartao saldo"}>
                <span className={`inicial inicial-${morador.id % 4}`} aria-hidden="true">
                  {morador.nome.charAt(0)}
                </span>
                <span className="saldo-nome">
                  {morador.nome}
                  {eu && <small> (você)</small>}
                  <small className="morador-email">{morador.email}</small>
                </span>
                {morador.organizador && <span className="etiqueta">Organizador</span>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
