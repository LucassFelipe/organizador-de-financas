import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function MesScreen({ dados }: { dados: Dados }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Mês</Text>
      <Text className="text-gray-500">{dados.entradas.length} entradas, {dados.gastos.length} gastos</Text>
    </View>
  )
}
