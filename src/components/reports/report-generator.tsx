'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Download, FileText } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import { useData, CropCycle } from '@/contexts/data-context'
import type { Transaction } from '@/types'

interface ReportData {
  period: string
  startDate: string
  endDate: string
  metrics: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    activeCrops: number
    propertiesCount: number
  }
  cashFlowData: Array<{
    period: string
    revenue: number
    expenses: number
  }>
  cropData: Array<{
    name: string
    area: number
    production: number
    revenue: number
  }>
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export function ReportGenerator() {
  const { transactions, crops } = useData()
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Função para filtrar transações por período
  const filterTransactionsByPeriod = (transactions: Transaction[], startDate: Date, endDate: Date) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // Função para agrupar transações por mês
  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    const grouped: { [key: string]: { revenue: number; expenses: number } } = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = { revenue: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        grouped[monthKey].revenue += transaction.amount
      } else {
        grouped[monthKey].expenses += transaction.amount
      }
    })
    
    return Object.entries(grouped).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    }))
  }

  // Função para calcular dados das safras baseado nas transações
  const calculateCropData = (transactions: Transaction[], crops: CropCycle[]) => {
    const cropRevenue: { [key: string]: { area: number; revenue: number; production: number } } = {}
    
    // Inicializar com dados das safras
    crops.forEach(crop => {
      cropRevenue[crop.cropType] = {
        area: crop.area,
        revenue: 0,
        production: 0
      }
    })
    
    // Calcular receitas reais das transações
    transactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.category === 'Vendas') {
        // Tentar identificar a safra pela descrição
        const cropType = crops.find(crop => 
          transaction.description.toLowerCase().includes(crop.cropType.toLowerCase())
        )?.cropType
        
        if (cropType && cropRevenue[cropType]) {
          cropRevenue[cropType].revenue += transaction.amount
        }
      }
    })
    
    return Object.entries(cropRevenue).map(([name, data]) => ({
      name,
      area: data.area,
      production: Math.round(data.revenue / 10), // Estimativa baseada na receita
      revenue: data.revenue
    }))
  }

  // Gerar dados do relatório baseado nos dados reais
  const generateReportData = (): ReportData => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now
    let periodLabel: string

    switch (selectedPeriod) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        periodLabel = `${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        periodLabel = `${quarter + 1}º Trimestre ${now.getFullYear()}`
        break
      case 'semiannual':
        const semester = now.getMonth() < 6 ? 0 : 1
        startDate = new Date(now.getFullYear(), semester * 6, 1)
        periodLabel = `${semester + 1}º Semestre ${now.getFullYear()}`
        break
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1)
        periodLabel = now.getFullYear().toString()
        break
      case 'custom':
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate)
        periodLabel = `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        periodLabel = `${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    }

    // Filtrar transações pelo período
    const filteredTransactions = filterTransactionsByPeriod(transactions, startDate, endDate)
    
    // Calcular métricas
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netProfit = totalRevenue - totalExpenses
    
    // Agrupar por mês para gráfico de fluxo de caixa
    const monthlyBreakdown = groupTransactionsByMonth(filteredTransactions)
    
    // Dados das safras
    const cropData = calculateCropData(filteredTransactions, crops)
    
    // Dados para gráfico de fluxo de caixa (últimos 6 meses)
    const cashFlowData = monthlyBreakdown.slice(-6).map(month => ({
      period: month.month.split(' ')[0], // Apenas o mês
      revenue: month.revenue,
      expenses: month.expenses
    }))
    
    return {
      period: periodLabel,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        activeCrops: crops.filter(c => c.status === 'planted' || c.status === 'harvested').length,
        propertiesCount: 1 // Assumindo 1 propriedade por enquanto
      },
      cashFlowData,
      cropData,
      monthlyBreakdown
    }
  }

  const [reportData, setReportData] = useState<ReportData | null>(null)

  const handleGenerateReport = () => {
    const data = generateReportData()
    data.metrics.netProfit = data.metrics.totalRevenue - data.metrics.totalExpenses
    setReportData(data)
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return

    setIsGenerating(true)
    try {
      // Método alternativo: criar PDF diretamente sem html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Configurações
      const pageWidth = 210
      const pageHeight = 295
      const margin = 20
      let yPosition = margin
      const lineHeight = 7
      
      // Função para adicionar texto
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
        pdf.setFontSize(fontSize)
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
        pdf.setTextColor(color)
        pdf.text(text, margin, yPosition)
        yPosition += lineHeight
      }
      
      // Função para verificar se precisa de nova página
      const checkNewPage = () => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }
      }
      
      // Cabeçalho
      pdf.setFillColor(34, 197, 94) // Verde
      pdf.rect(0, 0, pageWidth, 20, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('AgroFlow - Relatório Financeiro', margin, 15)
      
      yPosition = 35
      pdf.setTextColor(0, 0, 0)
      
      // Período
      addText(`Período: ${reportData.period}`, 14, true)
      addText(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 10)
      yPosition += 10
      
      // Métricas principais
      addText('MÉTRICAS PRINCIPAIS', 14, true)
      checkNewPage()
      
      addText(`Receita Total: R$ ${reportData.metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 12, false, '#16a34a')
      addText(`Despesas Totais: R$ ${reportData.metrics.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 12, false, '#dc2626')
      addText(`Lucro Líquido: R$ ${reportData.metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 12, true, reportData.metrics.netProfit >= 0 ? '#16a34a' : '#dc2626')
      addText(`Safras Ativas: ${reportData.metrics.activeCrops}`, 12)
      addText(`Propriedades: ${reportData.metrics.propertiesCount}`, 12)
      
      yPosition += 10
      
      // Resumo das safras
      addText('RESUMO DAS SAFRAS', 14, true)
      checkNewPage()
      
      reportData.cropData.forEach((crop) => {
        addText(`${crop.name}:`, 12, true)
        addText(`  Área: ${crop.area} hectares`, 10)
        addText(`  Produção: ${crop.production.toLocaleString('pt-BR')} kg`, 10)
        addText(`  Receita: R$ ${crop.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, false, '#16a34a')
        yPosition += 5
      })
      
      yPosition += 10
      
      // Detalhamento mensal
      addText('DETALHAMENTO MENSAL', 14, true)
      checkNewPage()
      
      // Cabeçalho da tabela
      addText('Mês\t\tReceitas\t\tDespesas\t\tLucro', 10, true)
      addText('─'.repeat(60), 10)
      
      reportData.monthlyBreakdown.forEach((month) => {
        const line = `${month.month}\t\tR$ ${month.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\t\tR$ ${month.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\t\tR$ ${month.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        addText(line, 10)
        checkNewPage()
      })
      
      // Rodapé
      yPosition = pageHeight - 20
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text('Gerado pelo AgroFlow - Sistema de Gestão Rural', margin, yPosition)
      
      // Salvar PDF
      pdf.save(`relatorio-agroflow-${reportData.period.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Período do Relatório</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Final</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <Button onClick={handleGenerateReport} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Relatório - {reportData.period}</CardTitle>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </CardHeader>
          <CardContent>
            <div id="report-content" className="space-y-6">
              {/* Métricas Principais */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Receita Total</h3>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {reportData.metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Despesas Totais</h3>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {reportData.metrics.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Lucro Líquido</h3>
                  <p className={`text-2xl font-bold ${reportData.metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {reportData.metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">Safras Ativas</h3>
                  <p className="text-2xl font-bold text-blue-600">{reportData.metrics.activeCrops}</p>
                </div>
              </div>

              {/* Gráfico de Fluxo de Caixa */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `R$ ${Number(value).toLocaleString('pt-BR')}`,
                        name === 'revenue' ? 'Receitas' : 'Despesas'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Produção por Safra */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Receita por Safra</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reportData.cropData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Área por Safra</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reportData.cropData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="area"
                      >
                        {reportData.cropData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela de Detalhamento Mensal */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Detalhamento Mensal</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Mês</th>
                        <th className="text-right p-2">Receitas</th>
                        <th className="text-right p-2">Despesas</th>
                        <th className="text-right p-2">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.monthlyBreakdown.map((month, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{month.month}</td>
                          <td className="p-2 text-right text-green-600">
                            R$ {month.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-right text-red-600">
                            R$ {month.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`p-2 text-right font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {month.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo das Safras */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Resumo das Safras</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {reportData.cropData.map((crop, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-lg">{crop.name}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Área: {crop.area} hectares</p>
                        <p>Produção: {crop.production.toLocaleString('pt-BR')} kg</p>
                        <p className="font-medium text-green-600">
                          Receita: R$ {crop.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
