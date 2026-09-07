export type Entrada = { id: string; descricao: string; valor: number; data: string }
export type GastoAvulso = { id: string; tipo: "avulso"; descricao: string; valor: number; data: string }
export type GastoParcelado = { id: string; tipo: "parcelado"; descricao: string; valorTotal: number; parcelas: number; dataInicio: string }
export type Gasto = GastoAvulso | GastoParcelado
export type Dados = { entradas: Entrada[]; gastos: Gasto[] }
export type Lancamento = { data: string; descricao: string; valor: number; ehEntrada: boolean; parcela?: string }

export const STORAGE_KEY = "financas:v1"

export function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function mesAtual(): string {
  return hojeISO().slice(0, 7)
}

export function mesDeData(data: string): string {
  return data.slice(0, 7)
}

export function formatarMes(mes: string): string {
  const nomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  const [ano, m] = mes.split("-")
  return `${nomes[Number(m) - 1]} de ${ano}`
}

export function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function parseValor(texto: string): number | null {
  const n = Number(texto.replace(",", ".").trim())
  return isNaN(n) ? null : n
}

export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

export function somaEntradasDoMes(dados: Dados, mes: string): number {
  return dados.entradas
    .filter((e) => mesDeData(e.data) === mes)
    .reduce((s, e) => s + e.valor, 0)
}

// ponytail: cada parcela arredonda para 2 casas; a soma pode divergir em centavos do total.
export function parcelasDe(g: GastoParcelado): { mes: string; valor: number; indice: number; total: number }[] {
  const valor = Math.round((g.valorTotal / g.parcelas) * 100) / 100
  const resultado: { mes: string; valor: number; indice: number; total: number }[] = []
  let ano = Number(g.dataInicio.slice(0, 4))
  let mesN = Number(g.dataInicio.slice(5, 7))
  for (let i = 0; i < g.parcelas; i++) {
    resultado.push({ mes: `${ano}-${String(mesN).padStart(2, "0")}`, valor, indice: i + 1, total: g.parcelas })
    mesN++
    if (mesN > 12) {
      mesN = 1
      ano++
    }
  }
  return resultado
}

export function somaGastosDoMes(dados: Dados, mes: string): number {
  const avulsos = dados.gastos
    .filter((g): g is GastoAvulso => g.tipo === "avulso" && mesDeData(g.data) === mes)
    .reduce((s, g) => s + g.valor, 0)
  const parcelados = dados.gastos
    .filter((g): g is GastoParcelado => g.tipo === "parcelado")
    .flatMap(parcelasDe)
    .filter((p) => p.mes === mes)
    .reduce((s, p) => s + p.valor, 0)
  return avulsos + parcelados
}

export function todosMeses(dados: Dados): string[] {
  const meses = new Set<string>()
  dados.entradas.forEach((e) => meses.add(mesDeData(e.data)))
  dados.gastos.forEach((g) => {
    if (g.tipo === "avulso") meses.add(mesDeData(g.data))
    else parcelasDe(g).forEach((p) => meses.add(p.mes))
  })
  return [...meses].sort()
}

export function saldoAcumulado(dados: Dados, mes: string): number {
  const saldo = todosMeses(dados)
    .filter((m) => m <= mes)
    .reduce((s, m) => s + somaEntradasDoMes(dados, m) - somaGastosDoMes(dados, m), 0)
  return Math.round(saldo * 100) / 100
}

export function gerarExtrato(dados: Dados): Lancamento[] {
  const linhas: Lancamento[] = [
    ...dados.entradas.map((e) => ({ data: e.data, descricao: e.descricao, valor: e.valor, ehEntrada: true })),
    ...dados.gastos
      .filter((g): g is GastoAvulso => g.tipo === "avulso")
      .map((g) => ({ data: g.data, descricao: g.descricao, valor: g.valor, ehEntrada: false })),
    ...dados.gastos
      .filter((g): g is GastoParcelado => g.tipo === "parcelado")
      .flatMap((g) =>
        parcelasDe(g).map((p) => ({
          data: `${p.mes}-01`,
          descricao: g.descricao,
          valor: p.valor,
          ehEntrada: false,
          parcela: `${p.indice}/${p.total}`,
        }))
      ),
  ]
  return linhas.sort((a, b) => a.data.localeCompare(b.data))
}
