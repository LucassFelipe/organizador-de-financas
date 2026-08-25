import { FlatList, Text, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import { gerarExtrato } from "../lib/financas"
import type { Dados } from "../lib/financas"

export default function ExtratoScreen({ dados }: { dados: Dados }) {
  const linhas = gerarExtrato(dados)
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Extrato</Text>
      <FlatList
        data={linhas}
        keyExtractor={(l, i) => `${l.data}-${i}`}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento ainda</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} />}
      />
    </View>
  )
}
