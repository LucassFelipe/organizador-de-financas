import { useEffect, useState } from "react"
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native"
import { editarEntrada, editarGasto, hojeISO, novoId, parseValor } from "../lib/financas"
import type { Dados, Entrada, GastoAvulso, GastoParcelado, Lancamento } from "../lib/financas"

type Props = {
  dados: Dados
  onSalvar: (d: Dados) => void
  editando?: Lancamento | null
  onCancelarEdicao?: () => void
}

export default function NovoScreen({ dados, onSalvar, editando, onCancelarEdicao }: Props) {
  const [ehEntrada, setEhEntrada] = useState(true)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(hojeISO())
  const [parcelado, setParcelado] = useState(false)
  const [parcelas, setParcelas] = useState("1")
  const [erros, setErros] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!editando) return
    setEhEntrada(editando.ehEntrada)
    setNome(editando.nome)
    setDescricao(editando.descricao ?? "")
    setValor(String(editando.valor))
    setData(editando.data)
    if (editando.origem === "parcelado" && editando.parcelaTotal && editando.parcelaTotal > 1) {
      setParcelado(true)
      setParcelas(String(editando.parcelaTotal))
    }
  }, [editando])

  const salvar = () => {
    const novosErros: Record<string, string> = {}
    if (!nome.trim()) novosErros.nome = "Informe o nome da movimentação"
    const v = parseValor(valor)
    if (v === null || v <= 0) novosErros.valor = "Informe um valor maior que zero"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || isNaN(Date.parse(data))) novosErros.data = "Data inválida (use AAAA-MM-DD)"
    const n = Number(parcelas)
    if (parcelado && (!Number.isInteger(n) || n < 1)) novosErros.parcelas = "Informe um número inteiro de parcelas (≥ 1)"
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }
    setErros({})

    const desc = descricao.trim() || undefined

    if (editando) {
      if (editando.origem === "entrada") {
        onSalvar(editarEntrada(dados, editando.refId, { nome: nome.trim(), descricao: desc, valor: v as number, data }))
      } else {
        if (editando.origem === "parcelado") {
          onSalvar(editarGasto(dados, editando.refId, { nome: nome.trim(), descricao: desc, valorTotal: v as number, parcelas: n, dataInicio: data }))
        } else {
          onSalvar(editarGasto(dados, editando.refId, { nome: nome.trim(), descricao: desc, valor: v as number, data }))
        }
      }
      Alert.alert("Atualizado", "Registro atualizado.")
      return
    }

    const entradas: Entrada[] = ehEntrada
      ? [...dados.entradas, { id: novoId(), nome: nome.trim(), descricao: desc, valor: v as number, data }]
      : dados.entradas

    const gasto: GastoAvulso | GastoParcelado | null = ehEntrada
      ? null
      : parcelado && n > 1
        ? { id: novoId(), tipo: "parcelado", nome: nome.trim(), descricao: desc, valorTotal: v as number, parcelas: n, dataInicio: data }
        : { id: novoId(), tipo: "avulso", nome: nome.trim(), descricao: desc, valor: v as number, data }

    onSalvar({ entradas, gastos: gasto ? [...dados.gastos, gasto] : dados.gastos })

    setNome("")
    setDescricao("")
    setValor("")
    setParcelado(false)
    setParcelas("1")
    Alert.alert("Salvo", ehEntrada ? "Entrada registrada." : "Gasto registrado.")
  }

  const campoErro = (chave: string) => erros[chave] ? <Text className="text-danger mt-1 text-sm">{erros[chave]}</Text> : null

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold">{editando ? "Editar lançamento" : "Novo lançamento"}</Text>
        {editando && onCancelarEdicao && (
          <Pressable onPress={onCancelarEdicao} className="bg-secondary px-3 py-1 rounded">
            <Text className="text-white text-sm">Cancelar</Text>
          </Pressable>
        )}
      </View>

      <View className="flex-row mb-4">
        <Pressable
          onPress={() => setEhEntrada(true)}
          className={`flex-1 py-2 rounded-l border ${ehEntrada ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
        >
          <Text className={`text-center font-bold ${ehEntrada ? "text-white" : "text-gray-600"}`}>Entrada</Text>
        </Pressable>
        <Pressable
          onPress={() => setEhEntrada(false)}
          className={`flex-1 py-2 rounded-r border ${!ehEntrada ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
        >
          <Text className={`text-center font-bold ${!ehEntrada ? "text-white" : "text-gray-600"}`}>Gasto</Text>
        </Pressable>
      </View>

      <Text className="mb-1">Nome da movimentação *</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Salário, Mercado, Celular"
        className="border border-gray-300 rounded p-3 mb-1 bg-white"
      />
      {campoErro("nome")}

      <Text className="mb-1 text-gray-500">Descrição (opcional)</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Detalhes adicionais"
        className="border border-gray-300 rounded p-3 mb-3 bg-white"
      />

      <Text className="mb-1">Valor (R$)</Text>
      <TextInput
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
        className="border border-gray-300 rounded p-3 mb-3 bg-white"
      />
      {campoErro("valor")}

      <Text className="mb-1">Data</Text>
      <TextInput
        value={data}
        onChangeText={setData}
        placeholder="AAAA-MM-DD"
        autoCapitalize="none"
        className="border border-gray-300 rounded p-3 mb-3 bg-white"
      />
      {campoErro("data")}

      {!ehEntrada && (
        <View className="flex-row items-center justify-between mb-3">
          <Text>Parcelado</Text>
          <Switch value={parcelado} onValueChange={setParcelado} />
        </View>
      )}

      {!ehEntrada && parcelado && (
        <View className="mb-4">
          <Text className="mb-1">Número de parcelas</Text>
          <TextInput
            value={parcelas}
            onChangeText={setParcelas}
            keyboardType="number-pad"
            className="border border-gray-300 rounded p-3 mb-3 bg-white"
          />
          {campoErro("parcelas")}
        </View>
      )}

      <Pressable onPress={salvar} className="bg-primary py-3 rounded mb-4">
        <Text className="text-white text-center font-bold">Salvar</Text>
      </Pressable>
    </ScrollView>
  )
}
