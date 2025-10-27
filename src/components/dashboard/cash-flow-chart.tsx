'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useData } from '@/contexts/data-context'
import { useMemo, useCallback } from 'react'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function CashFlowChartContent() {
  const { transactions } = useData()

  const { chartData, currentMonthIndex, projectionStats } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Gerar 12 meses passados + 6 meses futuros = 18 meses total
    const allMonths: { 
      month: string; 
      receitas: number; 
      despesas: number; 
      year: number; 
      monthIndex: number;
      isProjected: boolean;
      saldo: number;
    }[] = []

    // Gerar últimos 12 meses (dados históricos)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthIndex = date.getMonth()
      const year = date.getFullYear()
      
      allMonths.push({
        month: monthNames[monthIndex],
        receitas: 0,
        despesas: 0,
        year: year,
        monthIndex: monthIndex,
        isProjected: false,
        saldo: 0
      })
    }

    // Gerar próximos 6 meses (projeções)
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentYear, currentMonth + i, 1)
      const monthIndex = date.getMonth()
      const year = date.getFullYear()
      
      allMonths.push({
        month: monthNames[monthIndex],
        receitas: 0,
        despesas: 0,
        year: year,
        monthIndex: monthIndex,
        isProjected: true,
        saldo: 0
      })
    }

    // Helper para parsear data (suporta DD-MM-AAAA e YYYY-MM-DD)
    const parseDate = (dateStr: string): { year: number; month: number } => {
      // Formato DD-MM-AAAA (formato brasileiro padrão) - PRIORIDADE MÁXIMA
      if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('-')
        const day = Number(parts[0])
        const month = Number(parts[1]) - 1
        const year = Number(parts[2])
        
        return { year, month }
      }
      
      // Formato YYYY-MM-DD (compatibilidade com formato antigo)
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const parts = dateStr.split('-')
        const year = Number(parts[0])
        const month = Number(parts[1]) - 1
        
        return { year, month }
      }
      
      const d = new Date(dateStr)
      return {
        year: d.getFullYear(),
        month: d.getMonth()
      }
    }

    // Processar transações históricas
    let incomeCount = 0
    let expenseCount = 0
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        if (transaction && transaction.date && transaction.amount !== undefined) {
          const { year: transactionYear, month: transactionMonth } = parseDate(transaction.date)
          const amount = Math.abs(Number(transaction.amount))

          const monthData = allMonths.find(
            m => m.year === transactionYear && m.monthIndex === transactionMonth && !m.isProjected
          )

          if (monthData && isFinite(amount) && amount > 0) {
            if (transaction.type === 'income') {
              monthData.receitas += amount
              incomeCount++
            } else if (transaction.type === 'expense') {
              monthData.despesas += amount
              expenseCount++
            }
          }
        }
      })
    }


    // Calcular médias para projeções (baseado nos últimos 6 meses com dados)
    const historicalData = allMonths.filter(m => !m.isProjected && (m.receitas > 0 || m.despesas > 0))
    const recentMonths = historicalData.slice(-6) // Últimos 6 meses com dados
    
    let avgIncome = 0
    let avgExpense = 0
    let growthTrend = 1.0 // Fator de crescimento
    
    if (recentMonths.length > 0) {
      avgIncome = recentMonths.reduce((sum, m) => sum + m.receitas, 0) / recentMonths.length
      avgExpense = recentMonths.reduce((sum, m) => sum + m.despesas, 0) / recentMonths.length
      
      // Calcular tendência de crescimento
      if (recentMonths.length >= 3) {
        const firstHalf = recentMonths.slice(0, Math.floor(recentMonths.length / 2))
        const secondHalf = recentMonths.slice(Math.floor(recentMonths.length / 2))
        
        const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.receitas, 0) / firstHalf.length
        const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.receitas, 0) / secondHalf.length
        
        if (firstHalfAvg > 0) {
          growthTrend = secondHalfAvg / firstHalfAvg
          // Limitar o crescimento entre 0.8 e 1.3 (não muito agressivo)
          growthTrend = Math.max(0.8, Math.min(1.3, growthTrend))
        }
      }
    }

    // Aplicar projeções nos meses futuros
    allMonths.forEach((monthData, index) => {
      if (monthData.isProjected) {
        const projectionIndex = index - 12 // Quantos meses no futuro
        const seasonalFactor = 1 + (Math.sin(monthData.monthIndex * Math.PI / 6) * 0.1) // Variação sazonal leve
        const trendFactor = Math.pow(growthTrend, projectionIndex / 6) // Aplicar tendência gradual
        
        monthData.receitas = Math.round(avgIncome * seasonalFactor * trendFactor)
        monthData.despesas = Math.round(avgExpense * seasonalFactor * Math.pow(1.02, projectionIndex / 6)) // Despesas crescem 2% ao ano
      }
      
      // Calcular saldo
      monthData.saldo = monthData.receitas - monthData.despesas
    })

    // Estatísticas da projeção
    const projectedMonths = allMonths.filter(m => m.isProjected)
    const projectedIncome = projectedMonths.reduce((sum, m) => sum + m.receitas, 0)
    const projectedExpense = projectedMonths.reduce((sum, m) => sum + m.despesas, 0)
    const projectedBalance = projectedIncome - projectedExpense

    // Simplificar dados para usar apenas receitas/despesas com flags
    const processedData = allMonths.map(({ month, receitas, despesas, isProjected, saldo }) => ({
      month,
      receitas: receitas || 0,
      despesas: despesas || 0,
      isProjected,
      saldo,
      // Separar dados históricos e projeções para renderização diferenciada
      receitasHist: !isProjected ? (receitas || 0) : null,
      despesasHist: !isProjected ? (despesas || 0) : null,
      receitasProj: isProjected ? (receitas || 0) : null,
      despesasProj: isProjected ? (despesas || 0) : null
    }))

    // Remover logs desnecessários para performance
    const monthsWithData = processedData.filter(d => d.receitas > 0 || d.despesas > 0)
    
    // Debug apenas quando há problemas (opcional)
    if (monthsWithData.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Cash Flow Data Ready:', {
        historicalMonths: monthsWithData.filter(d => !d.isProjected).length,
        projectedMonths: monthsWithData.filter(d => d.isProjected).length,
        totalTransactions: incomeCount + expenseCount
      })
    }

    return {
      chartData: processedData,
      currentMonthIndex: 12, // Índice onde começam as projeções
      projectionStats: {
        totalIncome: projectedIncome,
        totalExpense: projectedExpense,
        balance: projectedBalance,
        avgMonthlyIncome: projectedIncome / 6,
        avgMonthlyExpense: projectedExpense / 6,
        growthRate: (growthTrend - 1) * 100
      }
    }
  }, [transactions])

  const niceMax = useCallback((value: number) => {
    if (!isFinite(value) || value <= 0) return 1
    const pow10 = Math.pow(10, Math.floor(Math.log10(value)))
    const normalized = value / pow10
    let niceNorm = 1
    if (normalized <= 1) niceNorm = 1
    else if (normalized <= 2) niceNorm = 2
    else if (normalized <= 5) niceNorm = 5
    else niceNorm = 10
    return niceNorm * pow10
  }, [])

  const formatCurrencyCompact = (n: number) => {
    if (!isFinite(n)) return 'R$ 0'
    if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
    if (n >= 1_000) return `R$ ${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
    return `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  }

  const yMaxRaw = useMemo(() => {
    return chartData.reduce((max, d) => {
      const r = Number(d.receitas) || 0
      const e = Number(d.despesas) || 0
      return Math.max(max, r, e)
    }, 0)
  }, [chartData])

  const yMax = useMemo(() => niceMax(yMaxRaw <= 0 ? 1 : yMaxRaw), [yMaxRaw, niceMax])

  // Componente de tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const dataPoint = payload[0]?.payload
    const isProjected = Boolean(dataPoint?.isProjected)

    // Filtrar apenas entradas com valor
    const validPayload = payload.filter((e: any) => e.value !== null && e.value !== undefined)

    const displayPayload = isProjected
      ? validPayload.filter((e: any) => e.dataKey === 'receitasProj' || e.dataKey === 'despesasProj')
      : validPayload.filter((e: any) => e.dataKey === 'receitasHist' || e.dataKey === 'despesasHist')

    const labelMap: Record<string, string> = {
      receitasProj: 'Receita projetada',
      despesasProj: 'Despesa projetada',
      receitasHist: 'Receitas',
      despesasHist: 'Despesas',
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800 mb-2">
          {label}{' '}
          <span className={isProjected ? 'text-blue-500 text-xs' : 'text-green-600 text-xs'}>
            ({isProjected ? 'Projeção' : 'Histórico'})
          </span>
        </p>
        {displayPayload.map((entry: any, idx: number) => (
          <p key={idx} style={{ color: entry.color }} className="text-sm">
            {labelMap[entry.dataKey] || entry.name}: R$ {Number(entry.value).toLocaleString('pt-BR')}
          </p>
        ))}
        {isProjected && (
          <p className="text-xs text-blue-600 mt-1">
            <Zap className="inline h-3 w-3 mr-1" />
            Baseado em tendências históricas
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cards de Estatísticas de Projeção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-blue-700 font-medium">Receitas Projetadas (6 meses)</div>
                <div className="text-lg font-bold text-blue-800">
                  R$ {projectionStats.totalIncome.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-red-700 font-medium">Despesas Projetadas (6 meses)</div>
                <div className="text-lg font-bold text-red-800">
                  R$ {projectionStats.totalExpense.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${projectionStats.balance >= 0 ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 ${projectionStats.balance >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
              <div>
                <div className={`text-sm font-medium ${projectionStats.balance >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Saldo Projetado (6 meses)
                </div>
                <div className={`text-lg font-bold ${projectionStats.balance >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>
                  R$ {projectionStats.balance.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-base sm:text-lg">Fluxo de Caixa - Histórico + Projeções</div>
              <div className="text-sm text-gray-600 font-normal">
                12 meses passados + 6 meses de projeção inteligente
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="w-full" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, yMax]}
                  tickFormatter={(v) => formatCurrencyCompact(Number(v))}
                  tickCount={6}
                />
                
                {/* Linha de referência para separar histórico de projeções */}
                <ReferenceLine x={chartData[currentMonthIndex - 1]?.month} stroke="#94a3b8" strokeDasharray="2 2" />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Linha de Receitas Históricas */}
                <Line 
                  type="monotone" 
                  dataKey="receitasHist" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  name="Receitas"
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7, fill: '#10b981' }}
                  connectNulls={false}
                />
                
                {/* Linha de Despesas Históricas */}
                <Line 
                  type="monotone" 
                  dataKey="despesasHist" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  name="Despesas"
                  dot={{ r: 5, fill: '#ef4444' }}
                  activeDot={{ r: 7, fill: '#ef4444' }}
                  connectNulls={false}
                />
                
                {/* Linha de Receitas Projetadas */}
                <Line 
                  type="monotone" 
                  dataKey="receitasProj" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="10 5"
                  name="Receitas (Projeção)"
                  dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                  connectNulls={false}
                />
                
                {/* Linha de Despesas Projetadas */}
                <Line 
                  type="monotone" 
                  dataKey="despesasProj" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  strokeDasharray="10 5"
                  name="Despesas (Projeção)"
                  dot={{ r: 4, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Melhorada */}
          <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-emerald-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Receitas Reais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-red-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Despesas Reais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-emerald-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #10b981 0, #10b981 3px, transparent 3px, transparent 6px)' }}></div>
              <span className="text-sm font-medium text-gray-700">Receitas Projetadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-red-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
              <span className="text-sm font-medium text-gray-700">Despesas Projetadas</span>
            </div>
          </div>

          {/* Insights da Projeção */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Insights da Projeção</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Taxa de crescimento estimada:</strong> {projectionStats.growthRate.toFixed(1)}% 
                    {projectionStats.growthRate > 0 ? ' (crescimento)' : ' (declínio)'}
                  </p>
                  <p>
                    <strong>Receita média mensal projetada:</strong> R$ {projectionStats.avgMonthlyIncome.toLocaleString('pt-BR')}
                  </p>
                  <p>
                    <strong>Projeções baseadas em:</strong> Tendências dos últimos 6 meses + variação sazonal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function CashFlowChart() {
  return <CashFlowChartContent />
}
