import { useState } from "react"
import { Alert, FlatList, Pressable, Text, TextInput, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import {
  adicionarSalario,
  formatarBRL,
  formatarMes,
  gerarExtrato,
  mesAtual,
  mesDeData,
  parseValor,
  saldoAcumulado,
  somaEntradasDoMes,
  somaGastosDoMes,
  temSalarioNoMes,
  todosMeses,
} from "../lib/financas"
import type { Dados, Lancamento } from "../lib/financas"

function mudarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number)
  const d = new Date(ano, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

type Props = {
  dados: Dados
  onAtualizar?: (d: Dados) => void
  onExcluir?: (lancamento: Lancamento) => void
  onEditar?: (lancamento: Lancamento) => void
}

export default function MesScreen({ dados, onAtualizar, onExcluir, onEditar }: Props) {
  const [mes, setMes] = useState(mesAtual())
  const [editandoSalario, setEditandoSalario] = useState(false)
  const [inputSalario, setInputSalario] = useState("")

  const linhas = gerarExtrato(dados).filter((l) => mesDeData(l.data) === mes)

  const anteriores = todosMeses(dados)
    .filter((m) => m < mes)
    .reduce((s, m) => s + somaEntradasDoMes(dados, m) - somaGastosDoMes(dados, m), 0)
  let acumulado = Math.round(anteriores * 100) / 100
  const saldos = linhas.map((l) => {
    acumulado += l.ehEntrada ? l.valor : -l.valor
    return Math.round(acumulado * 100) / 100
  })
  const entradas = somaEntradasDoMes(dados, mes)
  const gastos = somaGastosDoMes(dados, mes)
  const temSalario = temSalarioNoMes(dados, mes)
  const salario = dados.salarioBase

  const salvarSalarioBase = () => {
    const v = parseValor(inputSalario)
    if (v === null || v <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.")
      return
    }
    if (onAtualizar) onAtualizar({ ...dados, salarioBase: v })
    setEditandoSalario(false)
    setInputSalario("")
  }

  const aplicarSalario = () => {
    if (!salario) return
    const novos = adicionarSalario(dados, mes)
    if (novos !== dados && onAtualizar) onAtualizar(novos)
  }

  return (
    <View className="flex-1 p-5">
      <View className="flex-row items-center justify-between mb-5">
        <Pressable onPress={() => setMes(mudarMes(mes, -1))} className="px-4 py-2 bg-surface rounded-xl border border-border">
          <Text className="text-white font-bold">◀</Text>
        </Pressable>
        <Text className="text-lg font-bold text-white">{formatarMes(mes)}</Text>
        <Pressable onPress={() => setMes(mudarMes(mes, 1))} className="px-4 py-2 bg-surface rounded-xl border border-border">
          <Text className="text-white font-bold">▶</Text>
        </Pressable>
      </View>

      <View className="bg-primary/20 rounded-2xl p-5 mb-5">
        <Text className="text-primary text-sm font-medium">Saldo restante</Text>
        <Text className="text-white text-3xl font-bold mt-1">{formatarBRL(saldoAcumulado(dados, mes))}</Text>
      </View>

      <View className="flex-row mb-5 gap-3">
        <View className="bg-surface rounded-2xl border border-border p-4 flex-1">
          <Text className="text-secondary text-xs">Entradas</Text>
          <Text className="font-bold text-success text-base mt-1">{formatarBRL(entradas)}</Text>
        </View>
        <View className="bg-surface rounded-2xl border border-border p-4 flex-1">
          <Text className="text-secondary text-xs">Gastos</Text>
          <Text className="font-bold text-danger text-base mt-1">{formatarBRL(gastos)}</Text>
        </View>
      </View>

      <Pressable
        onLongPress={() => {
          if (!salario) { setEditandoSalario(true); return }
          const opcoes: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] = [
            { text: "Editar", onPress: () => { setEditandoSalario(true); setInputSalario(String(salario)) } },
            { text: "Remover", style: "destructive", onPress: () => onAtualizar?.({ ...dados, salarioBase: undefined }) },
            { text: "Cancelar", style: "cancel" },
          ]
          Alert.alert("Salário base", formatarBRL(salario), opcoes)
        }}
        className="bg-surface rounded-2xl border border-border p-4 mb-5"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-secondary text-xs">Salário base</Text>
          {salario ? (
            <Text className="font-bold text-success">{formatarBRL(salario)}</Text>
          ) : (
            <Text className="text-primary text-xs font-medium">Toque para configurar</Text>
          )}
        </View>
        {editandoSalario && (
          <View className="flex-row items-center mt-3">
            <TextInput value={inputSalario} onChangeText={setInputSalario} placeholder="0,00" placeholderTextColor="#6b7280" keyboardType="decimal-pad" className="border border-border rounded-xl p-2.5 flex-1 mr-2 bg-bg text-white" />
            <Pressable onPress={salvarSalarioBase} className="bg-primary px-4 py-2.5 rounded-xl mr-2">
              <Text className="text-white text-sm font-bold">OK</Text>
            </Pressable>
            <Pressable onPress={() => { setEditandoSalario(false); setInputSalario("") }}>
              <Text className="text-secondary text-sm">Cancelar</Text>
            </Pressable>
          </View>
        )}
        {salario && !temSalario && !editandoSalario && (
          <Pressable onPress={aplicarSalario} className="bg-success/10 rounded-xl p-3 mt-3">
            <Text className="text-success text-sm text-center font-medium">Adicionar salário neste mês</Text>
          </Pressable>
        )}
      </Pressable>

      <FlatList
        data={linhas}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={<Text className="text-secondary text-center mt-8">Nenhum lançamento neste mês</Text>}
        renderItem={({ item, index }) => <LinhaLancamento item={item} saldoRestante={saldos[index]} onExcluir={onExcluir} onEditar={onEditar} />}
      />
    </View>
  )
}
