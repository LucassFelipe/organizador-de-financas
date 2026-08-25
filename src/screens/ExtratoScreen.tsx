import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function ExtratoScreen({ dados }: { dados: Dados }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Extrato</Text>
    </View>
  )
}
