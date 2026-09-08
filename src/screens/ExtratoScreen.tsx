import { useState } from "react"
import { FlatList, Pressable, Text, TextInput, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import { gerarExtrato, hojeISO } from "../lib/financas"
import type { Dados, Lancamento } from "../lib/financas"

function diasAtrasISO(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

function dataValida(v: string): boolean {
  if (!DATA_RE.test(v)) return false
  const [a, m, d] = v.split("-").map(Number)
  const dt = new Date(a, m - 1, d)
  return dt.getFullYear() === a && dt.getMonth() === m - 1 && dt.getDate() === d
}

type Props = {
  dados: Dados
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function ExtratoScreen({ dados, onExcluir, onEditar }: Props) {
  const [dataInicio, setDataInicio] = useState(diasAtrasISO(30))
  const [dataFim, setDataFim] = useState(hojeISO())

  const inicioOk = !dataInicio || dataValida(dataInicio)
  const fimOk = !dataFim || dataValida(dataFim)

  const linhas = gerarExtrato(dados).filter((l) => {
    if (inicioOk && dataInicio && l.data < dataInicio) return false
    if (fimOk && dataFim && l.data > dataFim) return false
    return true
  })

  const limpar = () => {
    setDataInicio(diasAtrasISO(30))
    setDataFim(hojeISO())
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-3">Extrato</Text>

      <View className="flex-row items-end mb-1">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-gray-500 mb-1">De</Text>
          <TextInput
            value={dataInicio}
            onChangeText={setDataInicio}
            placeholder="AAAA-MM-DD"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            className={`border rounded p-2 bg-white text-sm ${inicioOk ? "border-gray-300" : "border-danger"}`}
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-xs text-gray-500 mb-1">Até</Text>
          <TextInput
            value={dataFim}
            onChangeText={setDataFim}
            placeholder="AAAA-MM-DD"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            className={`border rounded p-2 bg-white text-sm ${fimOk ? "border-gray-300" : "border-danger"}`}
          />
        </View>
      </View>
      {(!inicioOk || !fimOk) && (
        <Text className="text-danger text-xs mb-1">Formato inválido — use AAAA-MM-DD (ex.: 2026-09-07)</Text>
      )}
      <Pressable onPress={limpar} className="self-end mb-3">
        <Text className="text-primary text-xs">Últimos 30 dias</Text>
      </Pressable>

      <FlatList
        data={linhas}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento no período</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} onExcluir={onExcluir} onEditar={onEditar} />}
      />
    </View>
  )
}
