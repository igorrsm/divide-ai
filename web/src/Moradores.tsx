import { useState, type FormEvent } from "react";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/**
 * Moradores da república em ordem de entrada (A2). Só o organizador vê o
 * formulário de adicionar (decisão da Thalita).
 */
export default function Moradores() {
  const { republica } = useRepublicaAtual();
  const { moradores, moradorId, erro: erroLista, recarregar } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  // O id cresce com a entrada na casa: ordenar por ele é a ordem de entrada.
  const emOrdem = [...moradores].sort((a, b) => a.id - b.id);
  const souOrganizador = moradores.some((m) => m.id === moradorId && m.organizador);
  const organizador = moradores.find((m) => m.organizador);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/moradores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, moradorId }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível adicionar o morador." });
        return;
      }
      setAviso({ tipo: "ok", texto: `${corpo.nome} entrou na lista de moradores.` });
      setNome("");
      setEmail("");
      recarregar();
    } catch {
      setAviso({ tipo: "erro", texto: "A API não respondeu." });
    } finally {
      setEnviando(false);
    }
  }

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

      {souOrganizador ? (
        // noValidate: o aviso de e-mail inválido é o da API, igual em todo navegador.
        <form onSubmit={adicionar} className="cartao formulario adicionar-morador" noValidate>
          <h2>Adicionar morador</h2>
          <label className="campo">
            Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Diego" />
          </label>
          <label className="campo">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex.: diego@exemplo.com"
            />
          </label>
          {aviso && (
            <p role="status" className={`aviso aviso-${aviso.tipo}`}>
              {aviso.texto}
            </p>
          )}
          <button type="submit" className="botao-principal" disabled={enviando || foraDoAr}>
            {enviando ? "Adicionando..." : "Adicionar morador"}
          </button>
        </form>
      ) : (
        organizador && (
          <p className="cartao aviso-organizador">
            <span className={`inicial inicial-${organizador.id % 4}`} aria-hidden="true">
              {organizador.nome.charAt(0)}
            </span>
            <span>
              Para adicionar alguém à casa, fale com <strong>{organizador.nome}</strong>, que
              organiza a república.
            </span>
          </p>
        )
      )}
    </>
  );
}
