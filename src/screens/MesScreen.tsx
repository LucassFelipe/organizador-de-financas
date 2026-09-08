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

      <View className="bg-white rounded border border-gray-200 p-3 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500 text-xs">Salário base</Text>
          {salario ? (
            <Text className="font-bold text-success">{formatarBRL(salario)}</Text>
          ) : (
            <Pressable onPress={() => setEditandoSalario(true)}>
              <Text className="text-primary text-xs">Configurar</Text>
            </Pressable>
          )}
        </View>
        {!salario && editandoSalario && (
          <View className="flex-row items-center mt-2">
            <TextInput value={inputSalario} onChangeText={setInputSalario} placeholder="0,00" keyboardType="decimal-pad" className="border border-gray-300 rounded p-2 flex-1 mr-2 bg-white" />
            <Pressable onPress={salvarSalarioBase} className="bg-primary px-3 py-2 rounded">
              <Text className="text-white text-sm">OK</Text>
            </Pressable>
          </View>
        )}
        {salario && !temSalario && (
          <Pressable onPress={aplicarSalario} className="bg-success/10 rounded p-2 mt-2">
            <Text className="text-success text-sm text-center">Adicionar salário neste mês</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={linhas}
        keyExtractor={(l) => l.id}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento neste mês</Text>}
        renderItem={({ item, index }) => <LinhaLancamento item={item} saldoRestante={saldos[index]} onExcluir={onExcluir} onEditar={onEditar} />}
      />
    </View>
  )
}
