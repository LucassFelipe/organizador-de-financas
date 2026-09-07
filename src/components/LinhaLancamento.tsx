import { Text, View } from "react-native"
import { formatarBRL } from "../lib/financas"
import type { Lancamento } from "../lib/financas"

export default function LinhaLancamento({ item }: { item: Lancamento }) {
  return (
    <View className="bg-white rounded border border-gray-200 p-3 mb-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-2">
          <Text className="font-medium">
            {item.nome}
            {item.parcela ? ` (parcela ${item.parcela})` : ""}
          </Text>
          {item.descricao ? <Text className="text-gray-500 text-xs">{item.descricao}</Text> : null}
        </View>
        <Text className={item.ehEntrada ? "text-success font-bold" : "text-danger font-bold"}>
          {formatarBRL(item.ehEntrada ? item.valor : -item.valor)}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1">{item.data}</Text>
    </View>
  )
}
