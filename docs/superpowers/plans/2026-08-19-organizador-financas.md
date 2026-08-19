# Organizador de Finanças — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App mobile pessoal (Expo + React Native) para planejar gastos mensais: cadastro de entradas e gastos (com parcelas derivadas) e saldo acumulativo entre meses.

**Architecture:** App de tela única com 3 abas (Mês, Novo, Extrato) controladas por estado local, sem biblioteca de navegação. Dados persistidos como JSON no AsyncStorage. Toda a lógica financeira fica em funções puras em `src/lib/financas.ts`, auto-verificadas com `assert` executado via Node.

**Tech Stack:** Expo SDK 54 (única versão compatível com o Expo Go da Play Store), TypeScript, NativeWind v4 (utilidades estilo Bootstrap/Tailwind), `tailwindcss@^3.4.17`, AsyncStorage, `react-native-safe-area-context`. Sem framework de teste — verificação via `node <arquivo>.demo.ts` (Node 24 roda TS nativamente) e `npx tsc --noEmit`.

## Global Constraints

- **Expo SDK 54 obrigatório** (Expo Go da Google Play só suporta SDK 54). Após o scaffold, `package.json` deve ter `"expo": "~54.x.x"`.
- **NativeWind v4** com **`tailwindcss@^3.4.17`** (NÃO Tailwind v4).
- Identidade git local já configurada (`LucassFelipe` / noreply) — commitar sem prompts.
- Rótulos/textos em **pt-BR**.
- Moeda: números como `number` (centavos por arredondamento de 2 casas), formatados com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Datas como string `YYYY-MM-DD`; meses como `YYYY-MM`.
- Proibido adicionar: biblioteca de navegação, framework de teste, categorias de gasto, edição/exclusão de lançamentos, backend.
- `parcelas = 1` grava gasto como **avulso**.
- Erro de arredondamento de parcelas (ex.: R$ 100 / 3) é aceito; a última parcela pode divergir em centavos. Marcar com `// ponytail:` no código.

---

## File Structure

- `App.tsx` — raiz: carrega dados do AsyncStorage, estado global, alterna abas, renderiza `TabBar`.
- `global.css` — diretivas Tailwind (importado no topo de `App.tsx`).
- `tailwind.config.js` — caminhos de conteúdo + paleta Bootstrap (`primary`, `secondary`, `success`, `danger`).
- `babel.config.js` — presets do NativeWind.
- `metro.config.js` — `withNativeWind`.
- `nativewind-env.d.ts` — tipos do NativeWind para `className`.
- `src/lib/financas.ts` — tipos + funções puras (saldo, parcelas, extrato, formatação BRL, parse de valor, helpers de data). **Sem import de RN.**
- `src/lib/financas.demo.ts` — auto-verificação executável (`node src/lib/financas.demo.ts`).
- `src/lib/storage.ts` — `carregarDados(texto)`, `salvarDados(dados)`, `dadosVazios` (puros; o App usa AsyncStorage por cima).
- `src/lib/storage.demo.ts` — auto-verificação executável.
- `src/components/TabBar.tsx` — barra inferior de 3 abas + exporta o tipo `Aba`.
- `src/components/LinhaLancamento.tsx` — linha de lançamento reutilizada em Mês e Extrato.
- `src/screens/MesScreen.tsx` — navegação de mês por setas, cartões de resumo, lista do mês.
- `src/screens/NovoScreen.tsx` — formulário entrada/gasto com validação.
- `src/screens/ExtratoScreen.tsx` — lista cronológica completa.

---

## Task 1: Scaffold Expo SDK 54 + NativeWind + AsyncStorage

**Files:**
- Create: `App.tsx`, `global.css`, `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `nativewind-env.d.ts`, `app.json` (modify name), `package.json` (via scaffold)
- Note: `index.ts`, `.gitignore`, `tsconfig.json`, assets vêm do template.

**Interfaces:**
- Produces: `npx expo start` bundla sem erro; `className` estiliza; `@react-native-async-storage/async-storage` instalado.

- [ ] **Step 1: Criar o projeto Expo SDK 54 na raiz do repositório**

Run (do diretório raiz do repo):
```powershell
npx create-expo-app@latest . --template blank-typescript@sdk-54 --yes
```
Se o template `blank-typescript@sdk-54` não existir (erro de "template not found"), usar:
```powershell
npx create-expo-app@latest . --template default@sdk-54 --yes
```
E depois `npm run reset-project` para remover o exemplo com expo-router (resposta: "n" para mover para backup, "y" para deletar) — ou, se `reset-project` não existir, apagar manualmente `app/`, `components/`, `constants/`, `hooks/`, `scripts/` e recriar `App.tsx` no próximo passo. Se `create-expo-app` reclamar de diretório não vazio (por causa de `docs/` e `.git/`), é esperado — continuar.

- [ ] **Step 2: Verificar que o SDK é 54**

Run:
```powershell
node -e "const p = require('./package.json'); console.log(p.expo, p.react, p['react-native'])"
```
Expected: `expo` imprime `~54.x.x`. Se não for 54, **parar** e corrigir a versão antes de continuar.

- [ ] **Step 3: Instalar dependências**

```powershell
npx expo install @react-native-async-storage/async-storage
npx expo install nativewind react-native-reanimated react-native-safe-area-context
npm install --save-dev tailwindcss@^3.4.17
```

- [ ] **Step 4: Gerar e configurar o Tailwind**

```powershell
npx tailwindcss init
```

Substituir o conteúdo de `tailwind.config.js` por:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0d6efd",
        secondary: "#6c757d",
        success: "#198754",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#0dcaf0",
        light: "#f8f9fa",
        dark: "#212529",
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Criar `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Criar `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  }
}
```

- [ ] **Step 7: Criar `metro.config.js`**

```js
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: "./global.css" })
```

- [ ] **Step 8: Criar `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 9: Configurar `App.tsx` mínimo com NativeWind e nome do app**

Em `app.json`, definir o campo `name` como `"Organizador de Finanças"`.

Substituir todo o conteúdo de `App.tsx` por:

```tsx
import "./global.css"
import { StatusBar } from "expo-status-bar"
import { Text, View } from "react-native"

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-light">
      <Text className="text-3xl font-bold text-primary">Organizador de Finanças</Text>
      <Text className="text-secondary mt-2">Bootstrap + NativeWind funcionando</Text>
      <StatusBar style="dark" />
    </View>
  )
}
```

- [ ] **Step 10: Verificar que compila e estilos são aplicados**

Run:
```powershell
npx tsc --noEmit
npx expo export --platform android
```
Expected: `tsc` sem erros; `expo export` termina com "Exported successfully" (gera `dist/`). Se NativeWind não estiver linkado, o bundle falha aqui. Depois apagar `dist/`:
```powershell
Remove-Item -Recurse -Force dist
```
Verificação manual (usuário): `npx expo start`, abrir no Expo Go do A32, conferir o texto azul "Organizador de Finanças" e o fundo claro.

- [ ] **Step 11: Commit**

```powershell
git add -A
git commit -m "chore: scaffold expo sdk 54 com nativewind e asyncstorage"
```

---

## Task 2: `src/lib/financas.ts` — lógica financeira pura

**Files:**
- Create: `src/lib/financas.ts`, `src/lib/financas.demo.ts`

**Interfaces:**
- Produces:
  - `export type Entrada = { id: string; descricao: string; valor: number; data: string }`
  - `export type GastoAvulso = { id: string; tipo: 'avulso'; descricao: string; valor: number; data: string }`
  - `export type GastoParcelado = { id: string; tipo: 'parcelado'; descricao: string; valorTotal: number; parcelas: number; dataInicio: string }`
  - `export type Gasto = GastoAvulso | GastoParcelado`
  - `export type Dados = { entradas: Entrada[]; gastos: Gasto[] }`
  - `export type Lancamento = { data: string; descricao: string; valor: number; ehEntrada: boolean; parcela?: string }`
  - `export const STORAGE_KEY = 'financas:v1'`
  - `export function hojeISO(): string` — hoje em `YYYY-MM-DD` (horário local)
  - `export function mesAtual(): string` — mês atual `YYYY-MM`
  - `export function mesDeData(data: string): string` — `'YYYY-MM-DD'` → `'YYYY-MM'`
  - `export function formatarMes(mes: string): string` — `'2026-08'` → `'ago/2026'`
  - `export function novoId(): string`
  - `export function parseValor(texto: string): number | null` — aceita vírgula
  - `export function formatarBRL(valor: number): string`
  - `export function somaEntradasDoMes(dados: Dados, mes: string): number`
  - `export function parcelasDe(g: GastoParcelado): { mes: string; valor: number; indice: number; total: number }[]`
  - `export function somaGastosDoMes(dados: Dados, mes: string): number`
  - `export function todosMeses(dados: Dados): string[]` — meses com lançamento, ordenados
  - `export function saldoAcumulado(dados: Dados, mes: string): number`
  - `export function gerarExtrato(dados: Dados): Lancamento[]` — ordenado por data

- [ ] **Step 1: Escrever `src/lib/financas.ts`**

```ts
export type Entrada = { id: string; descricao: string; valor: number; data: string }
export type GastoAvulso = { id: string; tipo: "avulso"; descricao: string; valor: number; data: string }
export type GastoParcelado = { id: string; tipo: "parcelado"; descricao: string; valorTotal: number; parcelas: number; dataInicio: string }
export type Gasto = GastoAvulso | GastoParcelado
export type Dados = { entradas: Entrada[]; gastos: Gasto[] }
export type Lancamento = { data: string; descricao: string; valor: number; ehEntrada: boolean; parcela?: string }

export const STORAGE_KEY = "financas:v1"

export function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function mesAtual(): string {
  return hojeISO().slice(0, 7)
}

export function mesDeData(data: string): string {
  return data.slice(0, 7)
}

export function formatarMes(mes: string): string {
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
  const [ano, m] = mes.split("-")
  return `${nomes[Number(m) - 1]}/${ano}`
}

export function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function parseValor(texto: string): number | null {
  const n = Number(texto.replace(",", ".").trim())
  return isNaN(n) ? null : n
}

export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
}

export function somaEntradasDoMes(dados: Dados, mes: string): number {
  return dados.entradas
    .filter((e) => mesDeData(e.data) === mes)
    .reduce((s, e) => s + e.valor, 0)
}

// ponytail: cada parcela arredonda para 2 casas; a soma pode divergir em centavos do total.
export function parcelasDe(g: GastoParcelado): { mes: string; valor: number; indice: number; total: number }[] {
  const valor = Math.round((g.valorTotal / g.parcelas) * 100) / 100
  const resultado: { mes: string; valor: number; indice: number; total: number }[] = []
  let ano = Number(g.dataInicio.slice(0, 4))
  let mesN = Number(g.dataInicio.slice(5, 7))
  for (let i = 0; i < g.parcelas; i++) {
    resultado.push({ mes: `${ano}-${String(mesN).padStart(2, "0")}`, valor, indice: i + 1, total: g.parcelas })
    mesN++
    if (mesN > 12) {
      mesN = 1
      ano++
    }
  }
  return resultado
}

export function somaGastosDoMes(dados: Dados, mes: string): number {
  const avulsos = dados.gastos
    .filter((g): g is GastoAvulso => g.tipo === "avulso" && mesDeData(g.data) === mes)
    .reduce((s, g) => s + g.valor, 0)
  const parcelados = dados.gastos
    .filter((g): g is GastoParcelado => g.tipo === "parcelado")
    .flatMap(parcelasDe)
    .filter((p) => p.mes === mes)
    .reduce((s, p) => s + p.valor, 0)
  return avulsos + parcelados
}

export function todosMeses(dados: Dados): string[] {
  const meses = new Set<string>()
  dados.entradas.forEach((e) => meses.add(mesDeData(e.data)))
  dados.gastos.forEach((g) => {
    if (g.tipo === "avulso") meses.add(mesDeData(g.data))
    else parcelasDe(g).forEach((p) => meses.add(p.mes))
  })
  return [...meses].sort()
}

export function saldoAcumulado(dados: Dados, mes: string): number {
  const saldo = todosMeses(dados)
    .filter((m) => m <= mes)
    .reduce((s, m) => s + somaEntradasDoMes(dados, m) - somaGastosDoMes(dados, m), 0)
  return Math.round(saldo * 100) / 100
}

export function gerarExtrato(dados: Dados): Lancamento[] {
  const linhas: Lancamento[] = [
    ...dados.entradas.map((e) => ({ data: e.data, descricao: e.descricao, valor: e.valor, ehEntrada: true })),
    ...dados.gastos
      .filter((g): g is GastoAvulso => g.tipo === "avulso")
      .map((g) => ({ data: g.data, descricao: g.descricao, valor: g.valor, ehEntrada: false })),
    ...dados.gastos
      .filter((g): g is GastoParcelado => g.tipo === "parcelado")
      .flatMap((g) =>
        parcelasDe(g).map((p) => ({
          data: `${p.mes}-01`,
          descricao: g.descricao,
          valor: p.valor,
          ehEntrada: false,
          parcela: `${p.indice}/${p.total}`,
        }))
      ),
  ]
  return linhas.sort((a, b) => a.data.localeCompare(b.data))
}
```

- [ ] **Step 2: Escrever a auto-verificação `src/lib/financas.demo.ts`**

```ts
import assert from "node:assert"
import {
  formatarBRL,
  formatarMes,
  gerarExtrato,
  mesAtual,
  mesDeData,
  novoId,
  parseValor,
  saldoAcumulado,
  somaEntradasDoMes,
  somaGastosDoMes,
  parcelasDe,
} from "./financas"
import type { Dados, GastoParcelado } from "./financas"

const entrada = { id: novoId(), descricao: "Salário", valor: 3000, data: "2026-08-05" }
const avulso = { id: novoId(), tipo: "avulso" as const, descricao: "Mercado", valor: 400, data: "2026-08-10" }
const parc: GastoParcelado = { id: novoId(), tipo: "parcelado", descricao: "Celular", valorTotal: 1000, parcelas: 10, dataInicio: "2026-08-01" }

const dados: Dados = { entradas: [entrada], gastos: [avulso, parc] }

assert.equal(mesDeData("2026-08-15"), "2026-08")
assert.equal(mesAtual().length, 7)
assert.equal(formatarMes("2026-08"), "ago/2026")
assert.equal(parseValor("12,50"), 12.5)
assert.equal(parseValor("0"), 0)
assert.equal(parseValor("abc"), null)

const brl = formatarBRL(1234.5)
assert.ok(brl.startsWith("R$") && brl.includes("1.234,50"))

assert.equal(somaEntradasDoMes(dados, "2026-08"), 3000)
assert.equal(somaEntradasDoMes(dados, "2026-09"), 0)

assert.equal(parcelasDe(parc).length, 10)
assert.equal(parcelasDe(parc)[0].mes, "2026-08")
assert.equal(parcelasDe(parc)[2].mes, "2026-10")
assert.equal(parcelasDe(parc)[0].valor, 100)

assert.equal(somaGastosDoMes(dados, "2026-08"), 500) // 400 avulso + 100 parcela
assert.equal(somaGastosDoMes(dados, "2026-09"), 100)
assert.equal(saldoAcumulado(dados, "2026-08"), 2500)
assert.equal(saldoAcumulado(dados, "2026-09"), 2400)
assert.equal(saldoAcumulado({ entradas: [], gastos: [] }, "2026-08"), 0)

const extrato = gerarExtrato(dados)
assert.equal(extrato.length, 12) // 1 entrada + 1 avulso + 10 parcelas
assert.equal(extrato.filter((l) => l.parcela).length, 10)
assert.equal(extrato[1].parcela, "1/10")

console.log("OK: financas")
```

- [ ] **Step 3: Rodar a auto-verificação**

Run:
```powershell
node src/lib/financas.demo.ts
```
Expected: imprime `OK: financas`. Se falhar, corrigir a função e repetir.

- [ ] **Step 4: Verificar tipos e commit**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros. Depois:
```powershell
git add src/lib/financas.ts src/lib/financas.demo.ts
git commit -m "feat: logica financeira pura (saldo, parcelas, extrato, formatacao BRL)"
```

---

## Task 3: `src/lib/storage.ts` — serialização de dados

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/storage.demo.ts`

**Interfaces:**
- Consumes: `Dados` de `./financas`.
- Produces:
  - `export const dadosVazios: Dados`
  - `export function carregarDados(texto: string | null): Dados` — null/lixo/JSON incompleto → `dadosVazios`
  - `export function salvarDados(dados: Dados): string` — JSON.stringify

- [ ] **Step 1: Escrever `src/lib/storage.ts`**

```ts
import type { Dados } from "./financas"

export const dadosVazios: Dados = { entradas: [], gastos: [] }

export function carregarDados(texto: string | null): Dados {
  if (!texto) return dadosVazios
  try {
    const p = JSON.parse(texto) as Partial<Dados> | null
    return {
      entradas: Array.isArray(p?.entradas) ? p.entradas : [],
      gastos: Array.isArray(p?.gastos) ? p.gastos : [],
    }
  } catch {
    return dadosVazios
  }
}

export function salvarDados(dados: Dados): string {
  return JSON.stringify(dados)
}
```

- [ ] **Step 2: Escrever a auto-verificação `src/lib/storage.demo.ts`**

```ts
import assert from "node:assert"
import { carregarDados, dadosVazios, salvarDados } from "./storage"
import type { Dados } from "./financas"

const dados: Dados = {
  entradas: [{ id: "x", descricao: "Salário", valor: 3000, data: "2026-08-05" }],
  gastos: [{ id: "y", tipo: "avulso", descricao: "Mercado", valor: 400, data: "2026-08-10" }],
}

const texto = salvarDados(dados)
assert.equal(carregarDados(texto).entradas.length, 1)
assert.equal(carregarDados(texto).gastos.length, 1)
assert.deepEqual(carregarDados(null), dadosVazios)
assert.deepEqual(carregarDados("lixo"), dadosVazios)
assert.deepEqual(carregarDados('{"entradas":null,"gastos":{}}'), dadosVazios)
assert.deepEqual(carregarDados(""), dadosVazios)

console.log("OK: storage")
```

- [ ] **Step 3: Rodar a auto-verificação**

Run:
```powershell
node src/lib/storage.demo.ts
```
Expected: imprime `OK: storage`.

- [ ] **Step 4: Verificar tipos e commit**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros. Depois:
```powershell
git add src/lib/storage.ts src/lib/storage.demo.ts
git commit -m "feat: serializacao de dados (carregar/salvar)"
```

---

## Task 4: App shell — estado global, abas e persistência

**Files:**
- Modify: `App.tsx`
- Create: `src/components/TabBar.tsx`, `src/screens/MesScreen.tsx`, `src/screens/NovoScreen.tsx`, `src/screens/ExtratoScreen.tsx`

**Interfaces:**
- Consumes: `carregarDados`/`salvarDados` de `./src/lib/storage`, `STORAGE_KEY` de `./src/lib/financas`, `Aba` de `./src/components/TabBar`.
- Produces:
  - `export type Aba = "mes" | "novo" | "extrato"` (em `TabBar.tsx`)
  - `export default function TabBar({ aba, onChange }: { aba: Aba; onChange: (a: Aba) => void })`
  - `export default function MesScreen({ dados }: { dados: Dados })`
  - `export default function NovoScreen({ dados, onSalvar }: { dados: Dados; onSalvar: (d: Dados) => void })`
  - `export default function ExtratoScreen({ dados }: { dados: Dados })`
  - `App.tsx` carrega do AsyncStorage no `useEffect` e salva a cada mutação.

- [ ] **Step 1: Criar `src/components/TabBar.tsx`**

```tsx
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
```

- [ ] **Step 2: Criar as telas como stubs (serão preenchidas nas Tasks 5-7)**

`src/screens/MesScreen.tsx`:
```tsx
import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function MesScreen({ dados }: { dados: Dados }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Mês</Text>
      <Text className="text-gray-500">{dados.entradas.length} entradas, {dados.gastos.length} gastos</Text>
    </View>
  )
}
```

`src/screens/NovoScreen.tsx`:
```tsx
import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function NovoScreen({ dados, onSalvar }: { dados: Dados; onSalvar: (d: Dados) => void }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Novo</Text>
    </View>
  )
}
```

`src/screens/ExtratoScreen.tsx`:
```tsx
import { Text, View } from "react-native"
import type { Dados } from "../lib/financas"

export default function ExtratoScreen({ dados }: { dados: Dados }) {
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">Extrato</Text>
    </View>
  )
}
```

- [ ] **Step 3: Reescrever `App.tsx` com estado e persistência**

```tsx
import "./global.css"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
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
      .catch(() => setDados(dadosVazios))
      .finally(() => setPronto(true))
  }, [])

  const atualizar = async (novos: Dados) => {
    setDados(novos)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, salvarDados(novos))
    } catch {
      // falha ao gravar nao trava o app
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
```

- [ ] **Step 4: Verificar tipos**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros.

- [ ] **Step 5: Verificação manual (usuário)**

`npx expo start`, abrir no Expo Go do A32: as 3 abas alternam entre as telas, o texto do stub "Mês" mostra "0 entradas, 0 gastos". Sem erro vermelho no Metro.

- [ ] **Step 6: Commit**

```powershell
git add App.tsx src/components/TabBar.tsx src/screens/
git commit -m "feat: app shell com abas e persistencia via asyncstorage"
```

---

## Task 5: `src/components/LinhaLancamento.tsx` + `MesScreen` completo

**Files:**
- Create: `src/components/LinhaLancamento.tsx`
- Modify: `src/screens/MesScreen.tsx`

**Interfaces:**
- Consumes: `Lancamento`, `formatarBRL` de `../lib/financas`.
- Produces:
  - `export default function LinhaLancamento({ item }: { item: Lancamento })`
  - `MesScreen` renderiza resumo do mês (Saldo restante, Entradas, Gastos) e a lista filtrada do mês, com setas ◀ ▶ para navegar.

- [ ] **Step 1: Criar `src/components/LinhaLancamento.tsx`**

```tsx
import { Text, View } from "react-native"
import { formatarBRL } from "../lib/financas"
import type { Lancamento } from "../lib/financas"

export default function LinhaLancamento({ item }: { item: Lancamento }) {
  return (
    <View className="bg-white rounded border border-gray-200 p-3 mb-2">
      <View className="flex-row justify-between items-center">
        <Text className="font-medium flex-1 mr-2">
          {item.descricao}
          {item.parcela ? ` (parcela ${item.parcela})` : ""}
        </Text>
        <Text className={item.ehEntrada ? "text-success font-bold" : "text-danger font-bold"}>
          {formatarBRL(item.ehEntrada ? item.valor : -item.valor)}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1">{item.data}</Text>
    </View>
  )
}
```

- [ ] **Step 2: Reescrever `src/screens/MesScreen.tsx`**

```tsx
import { useState } from "react"
import { FlatList, Pressable, Text, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import {
  formatarBRL,
  formatarMes,
  gerarExtrato,
  mesAtual,
  mesDeData,
  saldoAcumulado,
  somaEntradasDoMes,
  somaGastosDoMes,
} from "../lib/financas"
import type { Dados } from "../lib/financas"

function mudarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number)
  const d = new Date(ano, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function MesScreen({ dados }: { dados: Dados }) {
  const [mes, setMes] = useState(mesAtual())
  const linhas = gerarExtrato(dados).filter((l) => mesDeData(l.data) === mes)
  const entradas = somaEntradasDoMes(dados, mes)
  const gastos = somaGastosDoMes(dados, mes)

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

      <FlatList
        data={linhas}
        keyExtractor={(l, i) => `${l.data}-${i}`}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento neste mês</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} />}
      />
    </View>
  )
}
```

- [ ] **Step 3: Verificar tipos**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros.

- [ ] **Step 4: Verificação manual (usuário)**

`npx expo start` → no A32: Mês mostra hoje; setas trocam o mês; cartões mostram R$ 0,00. Após cadastrar (Task 6), os valores aparecem aqui.

- [ ] **Step 5: Commit**

```powershell
git add src/components/LinhaLancamento.tsx src/screens/MesScreen.tsx
git commit -m "feat: tela mes com navegacao por setas e resumo de saldo"
```

---

## Task 6: `NovoScreen` — formulário com validação

**Files:**
- Modify: `src/screens/NovoScreen.tsx`

**Interfaces:**
- Consumes: `Dados`, `novoId`, `parseValor`, `hojeISO` de `../lib/financas`; `onSalvar` do App.
- Produces: formulário que monta `Dados` atualizados e chama `onSalvar(novos)`. `parcelas = 1` grava como `avulso`; `parcelas > 1` grava como `parcelado`.

- [ ] **Step 1: Reescrever `src/screens/NovoScreen.tsx`**

```tsx
import { useState } from "react"
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native"
import { hojeISO, novoId, parseValor } from "../lib/financas"
import type { Dados, Entrada, GastoAvulso, GastoParcelado } from "../lib/financas"

export default function NovoScreen({ dados, onSalvar }: { dados: Dados; onSalvar: (d: Dados) => void }) {
  const [ehEntrada, setEhEntrada] = useState(true)
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(hojeISO())
  const [parcelado, setParcelado] = useState(false)
  const [parcelas, setParcelas] = useState("1")
  const [erros, setErros] = useState<Record<string, string>>({})

  const salvar = () => {
    const novosErros: Record<string, string> = {}
    if (!descricao.trim()) novosErros.descricao = "Informe uma descrição"
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

    const entradas: Entrada[] = ehEntrada
      ? [...dados.entradas, { id: novoId(), descricao: descricao.trim(), valor: v as number, data }]
      : dados.entradas

    const gasto: GastoAvulso | GastoParcelado | null = ehEntrada
      ? null
      : parcelado && n > 1
        ? { id: novoId(), tipo: "parcelado", descricao: descricao.trim(), valorTotal: v as number, parcelas: n, dataInicio: data }
        : { id: novoId(), tipo: "avulso", descricao: descricao.trim(), valor: v as number, data }

    onSalvar({ entradas, gastos: gasto ? [...dados.gastos, gasto] : dados.gastos })

    setDescricao("")
    setValor("")
    setParcelado(false)
    setParcelas("1")
    Alert.alert("Salvo", ehEntrada ? "Entrada registrada." : "Gasto registrado.")
  }

  const campoErro = (chave: string) => erros[chave] ? <Text className="text-danger mt-1 text-sm">{erros[chave]}</Text> : null

  return (
    <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
      <Text className="text-xl font-bold mb-4">Novo lançamento</Text>

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

      <Text className="mb-1">Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Mercado, Salário, Celular"
        className="border border-gray-300 rounded p-3 mb-3 bg-white"
      />
      {campoErro("descricao")}

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
```

- [ ] **Step 2: Verificar tipos**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros.

- [ ] **Step 3: Verificação manual (usuário)**

`npx expo start` → no A32: cadastrar uma entrada (Salário), um gasto avulso e um parcelado (ex.: Celular, 10x, R$ 1000,00). Alerta "Salvo" ao salvar; voltar à aba Mês e conferir saldo/cartões/lista; na aba Extrato conferir as parcelas 1/10 a 10/10 nos meses seguintes.

- [ ] **Step 4: Commit**

```powershell
git add src/screens/NovoScreen.tsx
git commit -m "feat: formulario de novo lancamento com validacao e parcelas"
```

---

## Task 7: `ExtratoScreen` — lista cronológica completa

**Files:**
- Modify: `src/screens/ExtratoScreen.tsx`

**Interfaces:**
- Consumes: `gerarExtrato` de `../lib/financas`, `LinhaLancamento`.

- [ ] **Step 1: Reescrever `src/screens/ExtratoScreen.tsx`**

```tsx
import { FlatList, Text, View } from "react-native"
import LinhaLancamento from "../components/LinhaLancamento"
import { gerarExtrato } from "../lib/financas"
import type { Dados } from "../lib/financas"

export default function ExtratoScreen({ dados }: { dados: Dados }) {
  const linhas = gerarExtrato(dados)
  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Extrato</Text>
      <FlatList
        data={linhas}
        keyExtractor={(l, i) => `${l.data}-${i}`}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-8">Nenhum lançamento ainda</Text>}
        renderItem={({ item }) => <LinhaLancamento item={item} />}
      />
    </View>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run:
```powershell
npx tsc --noEmit
```
Expected: sem erros.

- [ ] **Step 3: Verificação manual (usuário)**

`npx expo start` → no A32: aba Extrato lista entradas, gastos avulsos e cada parcela dos parcelados (com "parcela x/N"), ordenados por data.

- [ ] **Step 4: Commit**

```powershell
git add src/screens/ExtratoScreen.tsx
git commit -m "feat: tela extrato com lancamentos passados e futuros"
```

---

## Task 8: Verificação final

**Files:**
- None (verificação e possível correção)

- [ ] **Step 1: Rodar todas as auto-verificações e tipos**

Run:
```powershell
node src/lib/financas.demo.ts
node src/lib/storage.demo.ts
npx tsc --noEmit
npx expo-doctor
```
Expected: `OK: financas`, `OK: storage`, `tsc` sem erros, `expo-doctor` sem problemas críticos. Corrigir qualquer falha antes de prosseguir.

- [ ] **Step 2: Commit de encerramento (se houve correções)**

```powershell
git add -A
git commit -m "chore: verificacoes finais"
```

- [ ] **Step 3: Entrega ao usuário**

Instruções para o usuário rodar no celular:
```powershell
npx expo start
```
Escancar o QR code com o app **Expo Go** no Samsung A32 (mesma rede Wi-Fi). Testar o fluxo completo: cadastrar entrada, gasto avulso, gasto parcelado de 10x, navegar entre meses e conferir o extrato.

---

## Self-Review

- **Cobertura da spec:** salário/múltiplas entradas (Task 6) ✓; gastos com descrição livre e data (Task 6) ✓; parcelas com "parcela x/N" e extensão automática aos meses seguintes (Tasks 2, 5, 7) ✓; só a parcela do mês desconta (Task 2 `somaGastosDoMes`) ✓; saldo acumulativo entre meses (Task 2 `saldoAcumulado`) ✓; navegação de mês por setas (Task 5) ✓; abas Mês/Novo/Extrato (Task 4) ✓; armazenamento local AsyncStorage (Tasks 3-4) ✓; visual Bootstrap via NativeWind (Task 1, cores `primary`/`secondary`/`success`/`danger`) ✓; validação com mensagens pt-BR (Task 6) ✓; auto-verificação com `assert` (Tasks 2-3) ✓; sem categorias/edição/nuvem (não implementado) ✓.
- **Placeholders:** nenhum — todo código está nos passos.
- **Consistência de tipos:** `Lancamento` (financas.ts) usado por `LinhaLancamento` e `gerarExtrato`; `Aba` definido em `TabBar.tsx` e consumido por `App.tsx`; `carregarDados`/`salvarDados` (string pura) usados com `AsyncStorage` no App; `novoId`/`parseValor`/`hojeISO`/`mesAtual` nomeados consistentemente entre Tasks 2, 5 e 6.