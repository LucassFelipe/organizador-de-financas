import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function NovoScreen({ dados, onSalvar }: { dados: Dados; onSalvar: (d: Dados) => void }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Novo</Text>
    </View>
  )
}
