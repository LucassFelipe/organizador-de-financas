import { Pressable, Text, View } from "react-native"

export type Aba = "mes" | "novo" | "extrato"

const ABAS: { chave: Aba; rotulo: string }[] = [
  { chave: "mes", rotulo: "Mês" },
  { chave: "novo", rotulo: "Novo" },
  { chave: "extrato", rotulo: "Extrato" },
]

export default function TabBar({ aba, onChange }: { aba: Aba; onChange: (a: Aba) => void }) {
  return (
    <View className="flex-row border-t border-gray-200 bg-white">
      {ABAS.map((a) => (
        <Pressable
          key={a.chave}
          onPress={() => onChange(a.chave)}
          className={`flex-1 py-3 ${aba === a.chave ? "border-t-2 border-primary" : ""}`}
        >
          <Text className={`text-center font-medium ${aba === a.chave ? "text-primary" : "text-gray-500"}`}>
            {a.rotulo}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
