# Design — Organizador de Finanças

**Data:** 2026-08-19
**Status:** Aprovado (ajustes: navegação de mês por setas)

## Objetivo

App mobile pessoal (celular Samsung A32 4G) para planejar os gastos do mês: cadastrar
entradas de dinheiro, registrar gastos (inclusive parcelados) e ver o saldo restante,
com a sobra de um mês acumulando para o próximo.

## Decisões de produto

- Uso **pessoal** — sem Play Store, sem conta de desenvolvedor, rodando via Expo Go.
- Dados **só no celular** (sem nuvem, sem servidor).
- Entradas: **várias por mês** (salário + extras), cada uma com descrição, valor e data.
- Gastos: **descrição livre** (sem categorias), com valor e data.
- **Parcelas:** só a parcela do mês atual desconta do saldo; as demais aparecem como
  gastos previstos nos meses seguintes automaticamente.
- **Saldo acumulativo:** a sobra de um mês soma ao salário do mês seguinte.
- Navegação de mês por **setas ◄ ►** (sem gesto de deslizar).
- Navegação por **3 abas** na parte inferior: Mês, Novo, Extrato.
- Visual **estilo Bootstrap** via utilitários do NativeWind.

## Stack

| Item | Escolha | Motivo |
|------|---------|--------|
| Framework | Expo (React Native) + TypeScript | RN leve, preview no celular via Expo Go |
| Estilo | NativeWind v4 | Utilidades tipo Bootstrap/Tailwind |
| Armazenamento | AsyncStorage (JSON) | Dados pequenos, sem backend |
| Navegação | Barra de abas custom (estado local) | 3 abas, sem dependência de lib |
| Moeda | `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` | Formatação nativa |

## Arquitetura

App de tela única com troca de conteúdo por estado (3 abas). Dados carregados do
AsyncStorage para um estado global no app e salvos a cada mutação. Lógica financeira
isolada em funções puras num módulo próprio, para ser testável.

```
App (estado global + carrega/salva dados)
├── TabBar customizada
├── Tela Mês      (resumo + lista do mês)
├── Tela Novo     (formulário de entrada/gasto)
├── Tela Extrato  (lista cronológica completa)
└── lib/financas.ts  (funções puras: saldo, parcelas, formatação)
```

## Modelo de dados

Todo o estado é um JSON salvo em AsyncStorage sob uma chave única (`financas:v1`):

```ts
type Entrada   = { id: string; descricao: string; valor: number; data: string } // 'YYYY-MM-DD'
type GastoAvulso = { id: string; tipo: 'avulso'; descricao: string; valor: number; data: string }
type GastoParcelado = { id: string; tipo: 'parcelado'; descricao: string; valorTotal: number; parcelas: number; dataInicio: string } // dataInicio = data da 1ª parcela

type Dados = { entradas: Entrada[]; gastos: (GastoAvulso | GastoParcelado)[] }
```

### Parcelas derivadas

Um gasto parcelado **não** gera registros duplicados. O app deriva:

- **Valor mensal** = `valorTotal / parcelas` (arredondado para 2 casas).
- Um parcelado com `dataInicio` no mês `M` e `parcelas = N` tem parcela no mês
  `M, M+1, ..., M+N-1`. No mês `M + k` mostra **"parcela k+1/N"**.
- Se o usuário informa `parcelas = 1`, o lançamento é gravado como **avulso**
  (mantém o modelo limpo).

## Lógica de saldo (funções puras em `lib/financas.ts`)

```
entradasDoMes(dados, mês)   = soma dos valores das entradas no mês
gastosDoMes(dados, mês)     = soma(gastos avulsos do mês) + soma(parcelas devidas no mês)
saldo(mês)                  = saldo(mês anterior) + entradasDoMes - gastosDoMes
                              (primeiro mês do app: saldo anterior = 0)
```

- **Mês** é representado pela chave `YYYY-MM` (ex.: `2026-08`); datas do modelo são
  `YYYY-MM-DD`.
- O saldo de um mês é calculado **cumulativamente a partir do mês mais antigo que
  possui lançamentos**, com saldo inicial zero antes dele. Assim, a sobra de um mês
  soma ao seguinte automaticamente, em qualquer ponto da timeline.

- Apenas a **parcela do mês atual** desconta do saldo.
- Meses futuros exibem saldo **projetado** (considerando parcelas futuras já previstas).
- Erro de arredondamento (ex.: R$ 100 / 3 parcelas) é aceito; a última parcela pode
  divergir em centavos da anterior (`ponytail:` marcação no código).

## Telas

### 1. Mês
- Cabeçalho: **◄ Mês/Ano ►** para trocar de mês (o mês exibido começa no mês atual).
- Cartões de resumo: **Saldo restante**, **Entradas**, **Gastos** do mês.
- Lista dos lançamentos do mês: entradas, gastos avulsos e parcelas do mês
  (com "parcela x/N" quando parcelado). Valores em R$.

### 2. Novo
- Alternador **Entrada / Gasto**.
- Campos: descrição, valor (numérico, aceita vírgula/casas decimais), data (padrão: hoje).
- Se **Gasto**, mostrar opção **Parcelado** com campo de quantidade de parcelas (≥ 1;
  se 1, é equivalente a gasto avulso).
- Ao salvar: valida campos, persiste no AsyncStorage, limpa o formulário.

### 3. Extrato
- Lista cronológica (ordem por data) de **todos** os lançamentos: passados e futuros,
  entradas e gastos. Parcelados aparecem a cada mês com "parcela x/N".

## Validação e erros

- **Obrigatórios:** descrição não vazia; valor > 0; data válida; parcelas ≥ 1
  (inteiro). Mensagens amigáveis em pt-BR.
- Entrada inválida não salva; campo com erro destacado.
- Falha ao ler/gravar AsyncStorage: alerta simples ao usuário sem travar o app.

## Testes

- `lib/financas.ts` com uma `demo()` de auto-verificação usando `assert`:
  saldo acumulativo entre meses, cálculo de parcelas ("parcela x/N") e
  arredondamento de centavos. Sem framework de teste (app pessoal).

## Fora do escopo (YAGNI)

- Categorias de gasto, contas múltiplas, cartões/limite.
- Edição e exclusão de lançamentos.
- Backup/export de dados.
- Multiusuário / nuvem / sincronização.
- Build de APK publicado (rodará via Expo Go).
