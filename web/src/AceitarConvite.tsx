import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual, type Republica } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/**
 * Página do link de convite (A5): quem recebeu completa o próprio cadastro,
 * com as regras da A2. Depois, o app já abre na casa dele e com ele escolhido
 * em "Quem é você?".
 */
export default function AceitarConvite() {
  const { token } = useParams();
  const { escolherRepublica } = useRepublicaAtual();
  const { escolher, recarregar } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const [casa, setCasa] = useState<Republica | null>(null);
  const [invalido, setInvalido] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/convites/${token}`)
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}));
        if (!ativo) return;
        if (resposta.ok) setCasa(corpo.republica);
        else setInvalido(corpo.erro ?? "Convite não encontrado.");
      })
      .catch(() => {
        if (ativo) setInvalido("A API não respondeu.");
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/convites/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível completar o cadastro.");
        return;
      }
      escolherRepublica(corpo.republica);
      escolher(corpo.morador.id);
      recarregar();
      setPronto(`Pronto, ${corpo.morador.nome}! Você já faz parte da ${corpo.republica.nome}.`);
    } catch {
      setErro("A API não respondeu.");
    } finally {
      setEnviando(false);
    }
  }

  if (pronto || invalido) {
    return (
      <div className="cartao formulario">
        <p role="status" className={`aviso ${pronto ? "aviso-ok" : "aviso-erro"}`}>
          {pronto ?? invalido}
        </p>
        <Link to="/" className="botao-principal">
          Ir para o início
        </Link>
      </div>
    );
  }
  if (!casa) return <p>Carregando convite…</p>;

  return (
    // noValidate: o aviso de e-mail inválido é o da API, como na A2.
    <form onSubmit={enviar} className="cartao formulario" noValidate>
      <h1>Você foi convidado para a {casa.nome}</h1>
      <p className="participantes-resumo">Complete seu cadastro para entrar na casa.</p>
      <label className="campo">
        Seu nome
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Diego" />
      </label>
      <label className="campo">
        Seu e-mail
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex.: diego@exemplo.com"
        />
      </label>
      {erro && (
        <p role="alert" className="aviso aviso-erro">
          {erro}
        </p>
      )}
      <button type="submit" className="botao-principal" disabled={enviando || foraDoAr}>
        {enviando ? "Entrando..." : "Entrar na casa"}
      </button>
    </form>
  );
}
