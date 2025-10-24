'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useMemo } from 'react'

interface MonthlyData {
  month: string
  income: number
  expense: number
  balance: number
  year: number
  monthIndex: number
}

// Função pura para processar dados mensais
function processMonthlyData(transactions: any[]): MonthlyData[] {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return []
  }

  // Helper para parsear data corretamente
  const parseDate = (dateStr: string): { year: number; month: number } => {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.split('-')
      return {
        year: Number(parts[0]),
        month: Number(parts[1]) - 1 // 0-indexed
      }
    }
    const d = new Date(dateStr)
    return {
      year: d.getFullYear(),
      month: d.getMonth()
    }
  }

  const monthMap = new Map<string, { income: number; expense: number; year: number; monthIndex: number }>()

  // Processar transações
  for (const transaction of transactions) {
    if (!transaction || !transaction.date || transaction.amount === undefined) continue
    
    const { year, month: monthIndex } = parseDate(transaction.date)
    const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

    if (!monthMap.has(key)) {
      monthMap.set(key, { income: 0, expense: 0, year, monthIndex })
    }
    
    const acc = monthMap.get(key)!
    const amount = Number(transaction.amount)
    
    if (isFinite(amount)) {
      const normalized = Math.abs(amount)
      if (transaction.type === 'income') {
        acc.income += normalized
      } else if (transaction.type === 'expense') {
        acc.expense += normalized
      }
    }
  }

  // Converter para array e ordenar por data
  const result: MonthlyData[] = Array.from(monthMap.entries())
    .map(([key, data]) => {
      const [year, month] = key.split('-')
      const monthIndex = Number(month) - 1
      const label = new Date(Number(year), monthIndex, 1).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      })
      
      return {
        month: label,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
        year: data.year,
        monthIndex: data.monthIndex
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.monthIndex - b.monthIndex
    })

  return result
}

// Função pura para calcular máximo do eixo Y
function calculateYMax(data: MonthlyData[]): number {
  if (data.length === 0) return 1
  
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expense))
  )
  
  if (maxValue <= 0) return 1
  
  // Arredondar para cima para um valor "bonito"
  const pow10 = Math.pow(10, Math.floor(Math.log10(maxValue)))
  const normalized = maxValue / pow10
  let niceNorm = 1
  
  if (normalized <= 1) niceNorm = 1
  else if (normalized <= 2) niceNorm = 2
  else if (normalized <= 5) niceNorm = 5
  else niceNorm = 10
  
  return niceNorm * pow10
}

// Função pura para formatar moeda
function formatCurrencyCompact(n: number): string {
  if (!isFinite(n)) return 'R$ 0'
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (n >= 1_000) return `R$ ${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

// Componente de barra individual
function ChartBar({ 
  data, 
  yMax, 
  type 
}: { 
  data: MonthlyData
  yMax: number
  type: 'income' | 'expense' | 'balance'
}) {
  const getBarConfig = () => {
    switch (type) {
      case 'income':
        return {
          value: data.income,
          color: 'from-emerald-600 via-emerald-500 to-emerald-400',
          bgColor: 'bg-emerald-600',
          icon: TrendingUp,
          label: 'Receitas'
        }
      case 'expense':
        return {
          value: data.expense,
          color: 'from-rose-600 via-rose-500 to-rose-400',
          bgColor: 'bg-rose-600',
          icon: TrendingDown,
          label: 'Despesas'
        }
      case 'balance':
        return {
          value: Math.abs(data.balance),
          color: data.balance >= 0 
            ? 'from-blue-600 to-blue-400' 
            : 'from-orange-600 to-orange-400',
          bgColor: data.balance >= 0 ? 'bg-blue-600' : 'bg-orange-600',
          icon: DollarSign,
          label: 'Saldo'
        }
    }
  }

  const config = getBarConfig()
  const height = (config.value / yMax) * 100
  const Icon = config.icon

  if (config.value <= 0) return null

  return (
    <div className="flex flex-col items-center group relative">
      <div 
        className={`w-8 bg-gradient-to-t ${config.color} rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-110 cursor-pointer relative overflow-visible`}
        style={{ 
          height: `${height}%`,
          minHeight: '8px'
        }}
      >
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
        
        {/* Tooltip */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-50">
          <div className={`${config.bgColor} text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border whitespace-nowrap`}>
            <div className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </div>
            <div className="text-center font-bold text-sm">
              R$ {config.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
          </div>
          {/* Seta do tooltip */}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-${config.bgColor.replace('bg-', '')}`}></div>
        </div>
      </div>
    </div>
  )
}

// Componente principal do gráfico
export function MonthlyFinancialChart() {
  const { transactions } = useData()

  // Processar dados usando useMemo para evitar recálculos desnecessários
  const monthlyData = useMemo(() => {
    return processMonthlyData(transactions)
  }, [transactions])

  const yMax = useMemo(() => {
    return calculateYMax(monthlyData)
  }, [monthlyData])

  // Se não há dados, mostrar mensagem
  if (monthlyData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Análise Financeira Mensal</h3>
              <p className="text-sm text-slate-600 font-normal">Receitas, Despesas e Saldo por Período</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhuma transação encontrada</p>
            <p className="text-sm text-slate-500">Adicione transações para ver o gráfico</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Análise Financeira Mensal</h3>
            <p className="text-sm text-slate-600 font-normal">Receitas, Despesas e Saldo por Período</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="relative">
          {/* Eixo Y com valores */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500">
            {[...Array(6)].map((_, i) => {
              const val = (yMax / 5) * (5 - i)
              return (
                <div key={i} className="text-right pr-2">
                  {formatCurrencyCompact(val)}
                </div>
              )
            })}
          </div>
          
          {/* Área do gráfico */}
          <div className="ml-16 h-80 relative mb-20">
            {/* Grid horizontal */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-full border-t border-slate-200"
                  style={{ top: `${i * 20}%` }}
                />
              ))}
            </div>
            
            {/* Barras do gráfico */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex flex-col items-center group relative h-full">
                  {/* Container das barras */}
                  <div className="flex items-end space-x-1 h-full">
                    {/* Barra de Receitas */}
                    <ChartBar data={data} yMax={yMax} type="income" />
                    
                    {/* Barra de Despesas */}
                    <ChartBar data={data} yMax={yMax} type="expense" />
                  </div>
                  
                  {/* Barra de Saldo (linha vertical) */}
                  <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 group/balance h-full flex items-end">
                    <ChartBar data={data} yMax={yMax} type="balance" />
                  </div>
                  
                  {/* Label do mês */}
                  <div className="absolute -bottom-16 text-center w-20">
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {data.month}
                    </div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                      Total: R$ {(data.income + data.expense).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legenda interativa */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-emerald-700">Receitas</span>
            <div className="text-xs text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">
              {transactions.filter(t => t.type === 'income').length} transações
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-rose-700">Despesas</span>
            <div className="text-xs text-rose-600 bg-rose-200 px-2 py-1 rounded-full">
              {transactions.filter(t => t.type === 'expense').length} transações
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-blue-700">Saldo Positivo</span>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold text-orange-700">Saldo Negativo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
