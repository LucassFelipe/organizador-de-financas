import assert from "node:assert"
import {
  formatarBRL,
  formatarMes,
  gerarExtrato,
  mesAtual,
  mesDeData,
  novoId,
  parseValor,
  saldoAcumulado,
  somaEntradasDoMes,
  somaGastosDoMes,
  parcelasDe,
} from "./financas.ts"
import type { Dados, GastoParcelado } from "./financas.ts"

const entrada = { id: novoId(), nome: "Salário", valor: 3000, data: "2026-08-05" }
const avulso = { id: novoId(), tipo: "avulso" as const, nome: "Mercado", valor: 400, data: "2026-08-10" }
const parc: GastoParcelado = { id: novoId(), tipo: "parcelado", nome: "Celular", valorTotal: 1000, parcelas: 10, dataInicio: "2026-08-01" }

const dados: Dados = { entradas: [entrada], gastos: [avulso, parc] }

assert.equal(mesDeData("2026-08-15"), "2026-08")
assert.equal(mesAtual().length, 7)
assert.equal(formatarMes("2026-08"), "Agosto de 2026")
assert.equal(parseValor("12,50"), 12.5)
assert.equal(parseValor("0"), 0)
assert.equal(parseValor("abc"), null)

const brl = formatarBRL(1234.5)
assert.ok(brl.startsWith("R$") && brl.includes("1.234,50"))

assert.equal(somaEntradasDoMes(dados, "2026-08"), 3000)
assert.equal(somaEntradasDoMes(dados, "2026-09"), 0)

assert.equal(parcelasDe(parc).length, 10)
assert.equal(parcelasDe(parc)[0].mes, "2026-08")
assert.equal(parcelasDe(parc)[2].mes, "2026-10")
assert.equal(parcelasDe(parc)[0].valor, 100)

assert.equal(somaGastosDoMes(dados, "2026-08"), 500) // 400 avulso + 100 parcela
assert.equal(somaGastosDoMes(dados, "2026-09"), 100)
assert.equal(saldoAcumulado(dados, "2026-08"), 2500)
assert.equal(saldoAcumulado(dados, "2026-09"), 2400)
assert.equal(saldoAcumulado({ entradas: [], gastos: [] }, "2026-08"), 0)

const extrato = gerarExtrato(dados)
assert.equal(extrato.length, 12) // 1 entrada + 1 avulso + 10 parcelas
assert.equal(extrato.filter((l) => l.parcela).length, 10)
assert.equal(extrato[0].parcela, "1/10") // ponytail: brief tinha extrato[1], mas a parcela de 2026-08-01 ordena antes
assert.equal(extrato[0].nome, "Celular")
assert.equal(extrato[0].origem, "parcelado")

console.log("OK: financas")
