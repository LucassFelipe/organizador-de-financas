# Organizador de Finanças

Aplicativo mobile para controle financeiro pessoal, desenvolvido com Expo (React Native) + NativeWind.

## Funcionalidades

- **Saldo acumulado** por mês e por movimentação
- **Lançamentos** com nome + descrição opcional
- **Parcelas** derivadas de registro único (não duplica)
- **Editar/excluir** via toque em qualquer lançamento
- **Filtro por período** no extrato com validação visual
- **Salário base** configurável, editável e removível
- **Gesto horizontal** para alternar entre abas
- **Tema escuro** com interface moderna

## Stack

- Expo SDK 57
- React Native 0.86
- NativeWind v4 (Tailwind CSS)
- AsyncStorage (dados locais)

## Como rodar

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npx expo start

# Build APK
npx eas build -p android --profile preview
```

## Estrutura

```
src/
  components/
    TabBar.tsx          # Barra de abas inferior
    LinhaLancamento.tsx  # Linha de lançamento no extrato
    SwipeableArea.tsx    # Gesto horizontal entre abas
  screens/
    MesScreen.tsx       # Visão mensal com saldo e lançamentos
    NovoScreen.tsx      # Formulário de criar/editar lançamento
    ExtratoScreen.tsx   # Extrato cronológico com filtros
  lib/
    financas.ts         # Lógica financeira pura
    storage.ts          # Serialização com AsyncStorage
```
