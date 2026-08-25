import "./global.css"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Alert } from "react-native"
import TabBar, { type Aba } from "./src/components/TabBar"
import MesScreen from "./src/screens/MesScreen"
import NovoScreen from "./src/screens/NovoScreen"
import ExtratoScreen from "./src/screens/ExtratoScreen"
import { STORAGE_KEY } from "./src/lib/financas"
import { carregarDados, salvarDados, dadosVazios } from "./src/lib/storage"
import type { Dados } from "./src/lib/financas"

export default function App() {
  const [dados, setDados] = useState<Dados>(dadosVazios)
  const [aba, setAba] = useState<Aba>("mes")
  const [pronto, setPronto] = useState(false)

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
      // falha ao gravar nao trava o app
      Alert.alert("Aviso", "Não foi possível salvar os dados.")
    }
  }

  if (!pronto) return <SafeAreaView className="flex-1 bg-light" />

  return (
    <SafeAreaView className="flex-1 bg-light" edges={["top"]}>
      <StatusBar style="dark" />
      {aba === "mes" && <MesScreen dados={dados} />}
      {aba === "novo" && <NovoScreen dados={dados} onSalvar={atualizar} />}
      {aba === "extrato" && <ExtratoScreen dados={dados} />}
      <TabBar aba={aba} onChange={setAba} />
    </SafeAreaView>
  )
}
