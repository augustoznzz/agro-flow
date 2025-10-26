'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react'
import { useMemo } from 'react'
import { Transaction } from '@/types'

interface FinancialChartsProps {
  transactions: Transaction[]
}

interface MonthlyData {
  month: string
  shortMonth: string
  income: number
  expense: number
  balance: number
  year: number
  monthIndex: number
  transactionCount: number
  avgTransaction: number
}

// Função para processar apenas dados históricos
function processFinancialData(transactions: Transaction[]): MonthlyData[] {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return []
  }

  const parseDate = (dateStr: string): { year: number; month: number } => {
    // Primeiro, tenta validar se a data não está vazia ou inválida
    if (!dateStr || dateStr.trim() === '') {
      const now = new Date()
      return {
        year: now.getFullYear(),
        month: now.getMonth()
      }
    }

    // Tenta parsear formato DD-MM-AAAA (formato brasileiro padrão) - PRIORIDADE MÁXIMA
    if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('-')
      const day = Number(parts[0])
      const month = Number(parts[1]) - 1 // JavaScript months are 0-based
      const year = Number(parts[2])
      
      if (year > 1900 && year < 2100 && month >= 0 && month < 12 && day >= 1 && day <= 31) {
        return { year, month }
      }
    }

    // Tenta parsear formato YYYY-MM-DD (compatibilidade com formato antigo)
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-')
      const year = Number(parts[0])
      const month = Number(parts[1]) - 1 // JavaScript months are 0-based
      
      if (year > 1900 && year < 2100 && month >= 0 && month < 12) {
        return { year, month }
      }
    }
    
    // Fallback: tenta parsear como Date normal
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      const now = new Date()
      return {
        year: now.getFullYear(),
        month: now.getMonth()
      }
    }
    
    return {
      year: d.getFullYear(),
      month: d.getMonth()
    }
  }

  const monthMap = new Map<string, {
    income: number
    expense: number
    year: number
    monthIndex: number
    transactions: Transaction[]
  }>()

  // Processar transações históricas
  for (const transaction of transactions) {
    if (!transaction) continue
    
    // Garantir que amount não é undefined ou null
    const amount = typeof transaction.amount === 'number' ? transaction.amount : Number(transaction.amount || 0)
    if (!isFinite(amount) || amount <= 0) continue
    
    const { year, month: monthIndex } = parseDate(transaction.date || '')
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

    if (!monthMap.has(key)) {
      monthMap.set(key, { 
        income: 0, 
        expense: 0, 
        year, 
        monthIndex,
        transactions: []
      })
    }
    
    const acc = monthMap.get(key)!
    
    if (transaction.type === 'income') {
      acc.income += amount
    } else if (transaction.type === 'expense') {
      acc.expense += amount
    }
    acc.transactions.push(transaction)
  }

  // Converter para array e calcular métricas
  const result: MonthlyData[] = Array.from(monthMap.entries())
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const monthIndex = Number(month) - 1
      const date = new Date(Number(year), monthIndex, 1)
      
      // Validar se a data é válida
      if (isNaN(date.getTime())) {
        return null
      }
      
      const label = date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      })
      const shortLabel = date.toLocaleDateString('pt-BR', { 
        month: 'short'
      })
      
      const balance = data.income - data.expense
      const transactionCount = data.transactions.length
      const avgTransaction = transactionCount > 0 ? (data.income + data.expense) / transactionCount : 0
      
      return {
        month: label,
        shortMonth: shortLabel,
        income: data.income,
        expense: data.expense,
        balance,
        year: data.year,
        monthIndex: data.monthIndex,
        transactionCount,
        avgTransaction
      }
    })
    .filter((item): item is MonthlyData => item !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.monthIndex - b.monthIndex
    })

  return result
}

// Componente de barra simples
function FinancialBar({ 
  data, 
  maxValue, 
  type,
  height = 200
}: { 
  data: MonthlyData
  maxValue: number
  type: 'income' | 'expense' | 'balance'
  height?: number
}) {
  const getBarConfig = () => {
    switch (type) {
      case 'income':
        return {
          value: data.income,
          color: 'from-emerald-600 via-emerald-500 to-emerald-400',
          bgColor: 'bg-emerald-600',
          borderColor: 'border-emerald-600',
          icon: TrendingUp,
          label: 'Receitas'
        }
      case 'expense':
        return {
          value: data.expense,
          color: 'from-rose-600 via-rose-500 to-rose-400',
          bgColor: 'bg-rose-600',
          borderColor: 'border-rose-600',
          icon: TrendingDown,
          label: 'Despesas'
        }
      case 'balance':
        const isPositive = data.balance >= 0
        return {
          value: Math.abs(data.balance),
          color: isPositive 
            ? 'from-blue-600 to-blue-400' 
            : 'from-orange-600 to-orange-400',
          bgColor: isPositive ? 'bg-blue-600' : 'bg-orange-600',
          borderColor: isPositive ? 'border-blue-600' : 'border-orange-600',
          icon: DollarSign,
          label: 'Saldo'
        }
    }
  }

  const config = getBarConfig()
  const barHeight = (config.value / maxValue) * height
  const Icon = config.icon

  if (config.value <= 0) return null

  return (
    <div className="flex flex-col items-center group relative">
      <div 
        className={`
          w-8 bg-gradient-to-t ${config.color} rounded-t-lg shadow-lg transition-all duration-700 
          hover:shadow-xl hover:scale-110 cursor-pointer relative overflow-visible
        `}
        style={{ 
          height: `${barHeight}px`,
          minHeight: config.value > 0 ? '8px' : '0px'
        }}
      >
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>

        {/* Tooltip */}
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-50 pointer-events-none">
          <div className={`${config.bgColor} text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl border-2 ${config.borderColor} whitespace-nowrap`}>
            <div className="flex items-center gap-1 mb-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            <div className="text-center font-bold">
              R$ {config.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-center opacity-75">
              {data.transactionCount} transações
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente principal
export function FinancialCharts({ transactions }: FinancialChartsProps) {
  const monthlyData = useMemo(() => {
    return processFinancialData(transactions)
  }, [transactions])

  const maxValue = useMemo(() => {
    if (monthlyData.length === 0) return 1
    return Math.max(...monthlyData.map(d => Math.max(d.income, d.expense))) * 1.1
  }, [monthlyData])

  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0)
  const totalExpense = monthlyData.reduce((sum, data) => sum + data.expense, 0)
  const totalBalance = totalIncome - totalExpense
  const avgMonthlyBalance = monthlyData.length > 0 ? totalBalance / monthlyData.length : 0

  if (monthlyData.length === 0) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Análise Financeira Mensal
              </h3>
              <p className="text-sm text-slate-600">Análise detalhada do desempenho financeiro</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            </div>
            <p className="text-slate-600 font-medium">Aguardando dados financeiros</p>
            <p className="text-sm text-slate-500">Adicione transações para visualizar análises</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Análise Financeira Mensal
              </h3>
              <p className="text-sm text-slate-600">Evolução histórica das finanças</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="text-sm text-emerald-700 font-medium">Receitas Totais</div>
                <div className="text-xl font-bold text-emerald-800">
                  R$ {totalIncome.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-sm text-red-700 font-medium">Despesas Totais</div>
                <div className="text-xl font-bold text-red-800">
                  R$ {totalExpense.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${totalBalance >= 0 ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className={`h-8 w-8 ${totalBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <div>
                <div className={`text-sm font-medium ${totalBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  Saldo Total
                </div>
                <div className={`text-xl font-bold ${totalBalance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                  R$ {totalBalance.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-sm text-purple-700 font-medium">Saldo Médio/Mês</div>
                <div className="text-xl font-bold text-purple-800">
                  R$ {avgMonthlyBalance.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card className="overflow-hidden shadow-xl border border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />
            Evolução Mensal Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Gráfico */}
          <div className="relative">
            {/* Grid de fundo */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-slate-200/60"></div>
              ))}
            </div>

            {/* Eixo Y com valores */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500 pointer-events-none">
              {[...Array(6)].map((_, i) => {
                const val = (maxValue / 5) * (5 - i)
                return (
                  <div key={i} className="text-right pr-2">
                    {val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)}
                  </div>
                )
              })}
            </div>
            
            {/* Área do gráfico */}
            <div className="ml-16 h-80 relative mb-16">
              {/* Barras do gráfico */}
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-2">
                {monthlyData.map((data, index) => (
                  <div 
                    key={`${data.year}-${data.monthIndex}`} 
                    className="flex flex-col items-center group relative h-full"
                  >
                    {/* Container das barras */}
                    <div className="flex items-end space-x-1 h-full">
                      {/* Barra de Receitas */}
                      <FinancialBar data={data} maxValue={maxValue} type="income" height={300} />
                      
                      {/* Barra de Despesas */}
                      <FinancialBar data={data} maxValue={maxValue} type="expense" height={300} />
                      
                      {/* Barra de Saldo */}
                      <FinancialBar data={data} maxValue={maxValue} type="balance" height={300} />
                    </div>
                    
                    {/* Label do mês */}
                    <div className="absolute -bottom-14 text-center w-24">
                      <div className="text-xs font-medium text-slate-700 mb-1">
                        {data.shortMonth}
                      </div>
                      <div className="text-xs text-slate-500">
                        {data.transactionCount} transações
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights automáticos */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Lightbulb className="h-5 w-5" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {totalBalance > 0 ? (
              <div className="flex items-start gap-2 text-emerald-700">
                <ArrowUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Situação Positiva:</strong> Você tem um saldo positivo de R$ {totalBalance.toLocaleString('pt-BR')}. 
                  Continue mantendo o controle das despesas para preservar essa situação.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-700">
                <ArrowDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Atenção Necessária:</strong> Suas despesas superam as receitas em R$ {Math.abs(totalBalance).toLocaleString('pt-BR')}. 
                  Considere revisar seus gastos ou aumentar suas receitas.
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 text-blue-700">
              <Activity className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Análise de Atividade:</strong> Você teve um total de {transactions.length} transações, 
                com uma média de R$ {transactions.length > 0 ? (totalIncome + totalExpense) / transactions.length : 0} por transação.
              </span>
            </div>

            {monthlyData.length > 1 && (
              <div className="flex items-start gap-2 text-purple-700">
                <Layers className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Tendência:</strong> Seus dados abrangem {monthlyData.length} meses, 
                  com saldo médio mensal de R$ {avgMonthlyBalance.toLocaleString('pt-BR')}.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 hover:bg-emerald-100/80 transition-colors">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm"></div>
          <div className="flex-1">
            <div className="text-xs font-medium text-emerald-700">Receitas</div>
            <div className="text-xs text-emerald-600">
              {transactions.filter(t => t.type === 'income').length} transações
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200/50 hover:bg-red-100/80 transition-colors">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow-sm"></div>
          <div className="flex-1">
            <div className="text-xs font-medium text-red-700">Despesas</div>
            <div className="text-xs text-red-600">
              {transactions.filter(t => t.type === 'expense').length} transações
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 hover:bg-blue-100/80 transition-colors md:col-span-1 col-span-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-sm"></div>
          <div className="flex-1">
            <div className="text-xs font-medium text-blue-700">Saldo</div>
            <div className="text-xs text-blue-600">
              {monthlyData.filter(m => m.balance >= 0).length} meses positivos
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}