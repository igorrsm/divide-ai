import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatarData } from "./formatarData";

describe("formatarData", () => {
  it("troca AAAA-MM-DD por DD/MM/AAAA", () => {
    assert.equal(formatarData("2026-09-05"), "05/09/2026");
    assert.equal(formatarData("2026-12-31"), "31/12/2026");
  });

  it("não muda o dia por causa do fuso", () => {
    // Via Date, "2026-01-01" no fuso do Brasil viraria 31/12/2025.
    assert.equal(formatarData("2026-01-01"), "01/01/2026");
  });
});
