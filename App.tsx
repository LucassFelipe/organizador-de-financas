import "./global.css"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Alert } from "react-native"
import TabBar, { type Aba } from "./src/components/TabBar"
import MesScreen from "./src/screens/MesScreen"
import NovoScreen from "./src/screens/NovoScreen"
import ExtratoScreen from "./src/screens/ExtratoScreen"
import { STORAGE_KEY, excluirRegistro, obterRegistro } from "./src/lib/financas"
import { carregarDados, salvarDados, dadosVazios } from "./src/lib/storage"
import type { Dados, Lancamento, Entrada, Gasto } from "./src/lib/financas"

export default function App() {
  const [dados, setDados] = useState<Dados>(dadosVazios)
  const [aba, setAba] = useState<Aba>("mes")
  const [pronto, setPronto] = useState(false)
  const [editando, setEditando] = useState<Lancamento | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((texto) => setDados(carregarDados(texto)))
      .catch(() => {
        setDados(dadosVazios)
        Alert.alert("Aviso", "Não foi possível carregar os dados salvos.")
      })
      .finally(() => setPronto(true))
  }, [])

  const atualizar = async (novos: Dados) => {
    setDados(novos)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, salvarDados(novos))
    } catch {
      Alert.alert("Aviso", "Não foi possível salvar os dados.")
    }
  }

  const handleExcluir = (lancamento: Lancamento) => {
    const label = lancamento.parcela ? `${lancamento.nome} (parcela ${lancamento.parcela})` : lancamento.nome
    Alert.alert("Excluir registro", `Deseja excluir "${label}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => atualizar(excluirRegistro(dados, lancamento)) },
    ])
  }

  const handleEditar = (lancamento: Lancamento) => {
    setEditando(lancamento)
    setAba("novo")
  }

  const handleVoltarEdicao = () => {
    setEditando(null)
    setAba("extrato")
  }

  if (!pronto)
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-light" />
      </SafeAreaProvider>
    )

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-light" edges={["top"]}>
        <StatusBar style="dark" />
        {aba === "mes" && <MesScreen dados={dados} onAtualizar={atualizar} onExcluir={handleExcluir} onEditar={handleEditar} />}
        {aba === "novo" && (
          <NovoScreen
            dados={dados}
            onSalvar={(d) => { setEditando(null); atualizar(d) }}
            editando={editando}
            onCancelarEdicao={handleVoltarEdicao}
          />
        )}
        {aba === "extrato" && <ExtratoScreen dados={dados} onExcluir={handleExcluir} onEditar={handleEditar} />}
        <TabBar aba={aba} onChange={setAba} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
