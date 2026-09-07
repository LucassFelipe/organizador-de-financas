import { useState } from "react"
import { FlatList, Pressable, Text, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import {
  formatarBRL,
  formatarMes,
  gerarExtrato,
  mesAtual,
  mesDeData,
  saldoAcumulado,
  somaEntradasDoMes,
  somaGastosDoMes,
} from "../lib/financas"
import type { Dados, Lancamento } from "../lib/financas"

function mudarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number)
  const d = new Date(ano, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

type Props = {
  dados: Dados
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function MesScreen({ dados, onExcluir, onEditar }: Props) {
  const [mes, setMes] = useState(mesAtual())
  const linhas = gerarExtrato(dados).filter((l) => mesDeData(l.data) === mes)
  const entradas = somaEntradasDoMes(dados, mes)
  const gastos = somaGastosDoMes(dados, mes)

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => setMes(mudarMes(mes, -1))} className="px-4 py-2 bg-secondary rounded">
          <Text className="text-white font-bold">◀</Text>
        </Pressable>
        <Text className="text-lg font-bold">{formatarMes(mes)}</Text>
        <Pressable onPress={() => setMes(mudarMes(mes, 1))} className="px-4 py-2 bg-secondary rounded">
          <Text className="text-white font-bold">▶</Text>
        </Pressable>
      </View>

      <View className="bg-primary rounded p-4 mb-4">
        <Text className="text-white text-sm">Saldo restante</Text>
        <Text className="text-white text-3xl font-bold">{formatarBRL(saldoAcumulado(dados, mes))}</Text>
      </View>

      <View className="flex-row mb-4">
        <View className="bg-white rounded border border-gray-200 p-3 flex-1 mr-2">
          <Text className="text-gray-500 text-xs">Entradas</Text>
          <Text className="font-bold text-success">{formatarBRL(entradas)}</Text>
        </View>
        <View className="bg-white rounded border border-gray-200 p-3 flex-1 ml-2">
          <Text className="text-gray-500 text-xs">Gastos</Text>
          <Text className="font-bold text-danger">{formatarBRL(gastos)}</Text>
        </View>
      </View>

      <FlatList
        data={linhas}
        keyExtractor={(l, i) => `${l.data}-${i}`}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento neste mês</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} onExcluir={onExcluir} onEditar={onEditar} />}
      />
    </View>
  )
}
