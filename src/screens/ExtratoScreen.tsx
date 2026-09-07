import { FlatList, Text, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import { gerarExtrato } from "../lib/financas"
import type { Dados, Lancamento } from "../lib/financas"

type Props = {
  dados: Dados
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function ExtratoScreen({ dados, onExcluir, onEditar }: Props) {
  const linhas = gerarExtrato(dados)
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Extrato</Text>
      <FlatList
        data={linhas}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento ainda</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} onExcluir={onExcluir} onEditar={onEditar} />}
      />
    </View>
  )
}
