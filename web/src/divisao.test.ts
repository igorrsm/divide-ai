import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { conferePartes, formatarPercentual, textoParaInteiro } from "./divisao";
import { formatarReais } from "./formatarReais";

describe("textoParaInteiro", () => {
  it("lê reais e percentuais como a API", () => {
    assert.equal(textoParaInteiro("150,5"), 15050);
    assert.equal(textoParaInteiro("33.33"), 3333);
    assert.equal(textoParaInteiro(" 70 "), 7000);
  });

  it("vazio, zero e texto inválido viram null", () => {
    for (const texto of ["", "0", "0,00", "abc", "1,234"]) {
      assert.equal(textoParaInteiro(texto), null);
    }
  });
});

describe("formatarPercentual", () => {
  it("tira os zeros que sobram", () => {
    assert.equal(formatarPercentual(3333), "33,33");
    assert.equal(formatarPercentual(5000), "50");
    assert.equal(formatarPercentual(3330), "33,3");
  });
});

describe("conferePartes", () => {
  it("por valores, diz quanto falta ou passou", () => {
    assert.deepEqual(conferePartes("VALOR", "100", ["70", ""]), {
      fecha: false,
      // formatarReais usa espaço não separável depois do "R$".
      mensagem: `Faltam ${formatarReais(3000)}.`,
    });
    assert.equal(
      conferePartes("VALOR", "100", ["70", "40"]).mensagem,
      `Passou ${formatarReais(1000)} do total.`,
    );
    assert.deepEqual(conferePartes("VALOR", "100,00", ["70", "30"]), {
      fecha: true,
      mensagem: "A soma fecha com o total.",
    });
  });

  it("por percentuais, compara com 100%", () => {
    assert.equal(conferePartes("PERCENTUAL", "", ["50", "40"]).mensagem, "Faltam 10%.");
    assert.equal(conferePartes("PERCENTUAL", "", ["33,33", "33,33", "33,34"]).fecha, true);
  });

  it("sem o total, ou com parte inválida, não libera", () => {
    assert.equal(conferePartes("VALOR", "", ["10"]).fecha, false);
    assert.equal(conferePartes("PERCENTUAL", "", ["100", "abc"]).fecha, false);
  });
});
