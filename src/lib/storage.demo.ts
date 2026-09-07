import assert from "node:assert"
import { carregarDados, dadosVazios, salvarDados } from "./storage.ts"
import type { Dados } from "./financas.ts"

const dados: Dados = {
  entradas: [{ id: "x", nome: "Salário", valor: 3000, data: "2026-08-05" }],
  gastos: [{ id: "y", tipo: "avulso", nome: "Mercado", valor: 400, data: "2026-08-10" }],
}

const texto = salvarDados(dados)
assert.equal(carregarDados(texto).entradas.length, 1)
assert.equal(carregarDados(texto).gastos.length, 1)
assert.deepEqual(carregarDados(null), dadosVazios)
assert.deepEqual(carregarDados("lixo"), dadosVazios)
assert.deepEqual(carregarDados('{"entradas":null,"gastos":{}}'), dadosVazios)
assert.deepEqual(carregarDados(""), dadosVazios)

console.log("OK: storage")
