/** Erro de regra de negócio: vira HTTP 400 na camada de rotas. */
export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeValidacao";
  }
}
