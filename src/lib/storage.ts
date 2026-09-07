import type { Dados } from "./financas"

export const dadosVazios: Dados = { entradas: [], gastos: [] }

export function carregarDados(texto: string | null): Dados {
  if (!texto) return dadosVazios
  try {
    const p = JSON.parse(texto) as Partial<Dados> | null
    const base: Dados = {
      entradas: Array.isArray(p?.entradas) ? p.entradas : [],
      gastos: Array.isArray(p?.gastos) ? p.gastos : [],
    }
    if (typeof p?.salarioBase === "number" && p.salarioBase > 0) base.salarioBase = p.salarioBase
    return base
  } catch {
    return dadosVazios
  }
}

export function salvarDados(dados: Dados): string {
  return JSON.stringify(dados)
}
