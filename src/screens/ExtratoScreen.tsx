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

type Props = {
  dados: Dados
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function ExtratoScreen({ dados, onExcluir, onEditar }: Props) {
  const [dataInicio, setDataInicio] = useState(diasAtrasISO(30))
  const [dataFim, setDataFim] = useState(hojeISO())

  const linhas = gerarExtrato(dados).filter((l) => {
    if (dataInicio && l.data < dataInicio) return false
    if (dataFim && l.data > dataFim) return false
    return true
  })

  const limpar = () => {
    setDataInicio(diasAtrasISO(30))
    setDataFim(hojeISO())
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-3">Extrato</Text>

      <View className="flex-row items-end mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-gray-500 mb-1">De (AAAA-MM-DD)</Text>
          <TextInput value={dataInicio} onChangeText={setDataInicio} placeholder="AAAA-MM-DD" autoCapitalize="none" className="border border-gray-300 rounded p-2 bg-white text-sm" />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-xs text-gray-500 mb-1">Até (AAAA-MM-DD)</Text>
          <TextInput value={dataFim} onChangeText={setDataFim} placeholder="AAAA-MM-DD" autoCapitalize="none" className="border border-gray-300 rounded p-2 bg-white text-sm" />
        </View>
      </View>
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
