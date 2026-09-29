import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Republica } from "./RepublicaAtual";

/**
 * Página do link de convite (A5): quem recebeu completa o próprio cadastro,
 * com as regras da A2. Depois, o app já abre na casa dele e com ele escolhido
 * em "Quem é você?".
 */
export default function AceitarConvite() {
  const { token } = useParams();
  const [casa, setCasa] = useState<Republica | null>(null);
  const [invalido, setInvalido] = useState<string | null>(null);

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

  if (invalido) {
    return (
      <div className="cartao formulario">
        <p role="status" className="aviso aviso-erro">
          {invalido}
        </p>
        <Link to="/" className="botao-principal">
          Ir para o início
        </Link>
      </div>
    );
  }
  if (!casa) return <p>Carregando convite…</p>;

  return (
    <div className="cartao formulario">
      <h1>Você foi convidado para a {casa.nome}</h1>
    </div>
  );
}
