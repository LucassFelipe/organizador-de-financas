import { Alert, Pressable, Text, View } from "react-native"
import { formatarBRL } from "../lib/financas"
import type { Lancamento } from "../lib/financas"

type Props = {
  item: Lancamento
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function LinhaLancamento({ item, onExcluir, onEditar }: Props) {
  const pressionar = () => {
    if (!onExcluir && !onEditar) return
    const opcoes: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = []
    if (onEditar) opcoes.push({ text: "Editar", onPress: () => onEditar(item) })
    if (onExcluir) opcoes.push({ text: "Excluir", style: "destructive", onPress: () => onExcluir(item) })
    opcoes.push({ text: "Cancelar", style: "cancel" })
    Alert.alert(item.nome, item.parcela ? `Parcela ${item.parcela}` : undefined, opcoes)
  }

  return (
    <Pressable onPress={pressionar} className="bg-white rounded border border-gray-200 p-3 mb-2">
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
    </Pressable>
  )
}
