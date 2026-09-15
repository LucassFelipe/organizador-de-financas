import { Alert, Pressable, Text, View } from "react-native"
import { formatarBRL } from "../lib/financas"
import type { Lancamento } from "../lib/financas"

type Props = {
  item: Lancamento
  saldoRestante?: number
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function LinhaLancamento({ item, saldoRestante, onExcluir, onEditar }: Props) {
  const pressionar = () => {
    if (!onExcluir && !onEditar) return
    const opcoes: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = []
    if (onEditar) opcoes.push({ text: "Editar", onPress: () => onEditar(item) })
    if (onExcluir) opcoes.push({ text: "Excluir", style: "destructive", onPress: () => onExcluir(item) })
    opcoes.push({ text: "Cancelar", style: "cancel" })
    const valor = formatarBRL(item.ehEntrada ? item.valor : -item.valor)
    const subtitulo = [item.parcela ? `Parcela ${item.parcela}` : null, valor, item.data].filter(Boolean).join(" • ")
    Alert.alert(item.nome, subtitulo, opcoes)
  }

  return (
    <Pressable onPress={pressionar} className="bg-surface rounded-2xl border border-border p-4 mb-3">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <Text className="font-semibold text-white text-base">
            {item.nome}
            {item.parcela ? ` (parcela ${item.parcela})` : ""}
          </Text>
          {item.descricao ? <Text className="text-secondary text-xs mt-0.5">{item.descricao}</Text> : null}
        </View>
        <Text className={item.ehEntrada ? "text-success font-bold text-base" : "text-danger font-bold text-base"}>
          {formatarBRL(item.ehEntrada ? item.valor : -item.valor)}
        </Text>
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-secondary text-xs">{item.data}</Text>
        {saldoRestante !== undefined && (
          <Text className="text-secondary text-xs">Saldo: {formatarBRL(saldoRestante)}</Text>
        )}
      </View>
    </Pressable>
  )
}
