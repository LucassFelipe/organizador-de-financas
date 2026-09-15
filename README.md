# Organizador de Financas

Aplicativo mobile para controle financeiro pessoal, developed with Expo (React Native) + NativeWind.

## Funcionalidades

- **Saldo acumulado** por mes e por movimentacao
- **Lancamentos** com nome + descricao opcional
- **Parcelas** derivadas de registro unico (nao duplica)
- **Editar/excluir** via toque em qualquer lancamento
- **Filtro por periodo** no extrato com validacao visual
- **Salario base** configuravel, editavel e removivel
- **Gesto horizontal** para alternar entre abas
- **Tema escuro** com interface moderna

## Stack

- Expo SDK 57
- React Native 0.86
- NativeWind v4 (Tailwind CSS)
- AsyncStorage (dados locais)

## Como rodar

```bash
# Instalar dependencias
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
    LinhaLancamento.tsx  # Linha de lancamento no extrato
    SwipeableArea.tsx    # Gesto horizontal entre abas
  screens/
    MesScreen.tsx       # Visao mensal com saldo e lancamentos
    NovoScreen.tsx      # Formulario de criar/editar lancamento
    ExtratoScreen.tsx   # Extrato cronologico com filtros
  lib/
    financas.ts         # Logica financeira pura
    storage.ts          # Serializacao com AsyncStorage
```
