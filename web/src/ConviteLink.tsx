import { useRef, useState } from "react";
import { useMoradorAtual } from "./MoradorAtual";
import { useRepublicaAtual } from "./RepublicaAtual";
import { useApiForaDoAr } from "./StatusApi";

/**
 * Convite por link (A5), só para o organizador: gera um link de uso único
 * para a pessoa completar o próprio cadastro. O sistema não manda e-mail;
 * quem convida copia o link e envia como quiser.
 */
export default function ConviteLink() {
  const { republica } = useRepublicaAtual();
  const { moradorId } = useMoradorAtual();
  const foraDoAr = useApiForaDoAr();
  const [link, setLink] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [gerando, setGerando] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  async function gerar() {
    setAviso(null);
    setGerando(true);
    try {
      const resposta = await fetch(`/api/republicas/${republica.id}/convites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moradorId }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setAviso({ tipo: "erro", texto: corpo.erro ?? "Não foi possível gerar o convite." });
        return;
      }
      setLink(`${window.location.origin}/convite/${corpo.token}`);
    } catch {
      setAviso({ tipo: "erro", texto: "A API não respondeu." });
    } finally {
      setGerando(false);
    }
  }

  async function copiar() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setAviso({ tipo: "ok", texto: "Link copiado. Ele vale para uma pessoa só." });
    } catch {
      // Sem permissão para a área de transferência: deixa o link selecionado.
      campo.current?.select();
      setAviso({ tipo: "erro", texto: "Não deu para copiar sozinho: o link ficou selecionado." });
    }
  }

  return (
    <section className="cartao formulario convite">
      <h2>Convidar por link</h2>
      <p className="participantes-resumo">
        A pessoa abre o link e completa o próprio cadastro. Cada link vale uma vez.
      </p>
      {link && (
        <div className="convite-link">
          <input ref={campo} value={link} readOnly aria-label="Link de convite" />
          <button type="button" className="botao-secundario" onClick={copiar}>
            Copiar
          </button>
        </div>
      )}
      {aviso && (
        <p role="status" className={`aviso aviso-${aviso.tipo}`}>
          {aviso.texto}
        </p>
      )}
      <button
        type="button"
        className="botao-secundario"
        onClick={gerar}
        disabled={gerando || foraDoAr}
      >
        {gerando ? "Gerando..." : link ? "Gerar outro link" : "Gerar link de convite"}
      </button>
    </section>
  );
}
