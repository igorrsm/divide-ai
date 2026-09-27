import { Link } from "react-router-dom";

const ATALHOS = [
  { para: "/despesas", titulo: "Despesas", texto: "Lance e confira as contas da casa." },
  { para: "/saldos", titulo: "Saldos", texto: "Veja quem deve e quem tem a receber." },
  { para: "/moradores", titulo: "Moradores", texto: "Quem divide as contas com você." },
  { para: "/republicas/nova", titulo: "Criar república", texto: "Comece a organizar uma casa nova." },
];

/** Tela inicial: apresentação curta e atalhos para as quatro áreas do app. */
export default function Inicio() {
  return (
    <>
      <h1>Divida as contas da casa sem confusão</h1>
      <p className="apresentacao">
        O Divide Aí organiza as contas da república: cada despesa fica registrada com quem
        pagou e entre quem é dividida, e o saldo de cada morador aparece na hora, sem
        planilha nem grupo de WhatsApp.
      </p>

      <nav className="atalhos" aria-label="Atalhos">
        {ATALHOS.map((atalho) => (
          <Link key={atalho.para} to={atalho.para} className="cartao atalho">
            <strong>{atalho.titulo}</strong>
            <span>{atalho.texto}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
