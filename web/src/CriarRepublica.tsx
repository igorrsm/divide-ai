import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/** Formulário para criar uma nova república com seu organizador (A1). */
export default function CriarRepublica() {
  const [nome, setNome] = useState("");
  const [nomeOrganizador, setNomeOrganizador] = useState("");
  const [emailOrganizador, setEmailOrganizador] = useState("");
  const [avisoErro, setAvisoErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const { escolherRepublica } = useRepublicaAtual();
  const { escolher } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const navegar = useNavigate();

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (foraDoAr) return;

    if (!nome.trim()) return setAvisoErro("Nome da república é obrigatório.");
    if (!nomeOrganizador.trim()) return setAvisoErro("Nome do organizador é obrigatório.");
    if (!emailOrganizador.trim()) return setAvisoErro("E-mail é obrigatório.");

    setAvisoErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/republicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, nomeOrganizador, emailOrganizador }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) {
        setAvisoErro(corpo.erro ?? "Não foi possível criar a república.");
        return;
      }
      escolherRepublica({ id: corpo.id, nome: corpo.nome });
      if (corpo.moradores?.[0]?.id) escolher(corpo.moradores[0].id);
      navegar("/");
    } catch {
      setAvisoErro("A API não respondeu.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h1>Criar república</h1>
      <form onSubmit={enviar} className="cartao formulario">
        {avisoErro && <p role="alert" className="aviso aviso-erro">{avisoErro}</p>}

        <label className="campo">
          Nome da república
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: República Solar"
          />
        </label>

        <label className="campo">
          Seu nome (organizador)
          <input
            type="text"
            value={nomeOrganizador}
            onChange={(e) => setNomeOrganizador(e.target.value)}
            placeholder="Ex.: Eduardo"
          />
        </label>

        <label className="campo">
          Seu e-mail
          <input
            type="email"
            value={emailOrganizador}
            onChange={(e) => setEmailOrganizador(e.target.value)}
            placeholder="Ex.: eduardo@exemplo.com"
          />
        </label>

        <button type="submit" className="botao-principal" disabled={enviando || foraDoAr}>
          {enviando ? "Criando..." : "Criar república"}
        </button>
      </form>
    </>
  );
}
