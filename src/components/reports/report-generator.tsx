'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Download, FileText } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Dados mockados para demonstração
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

    // Gerar dados mockados baseados no período
    const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    
    return {
      period: periodLabel,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: {
        totalRevenue: 125000 + Math.random() * 50000,
        totalExpenses: 75000 + Math.random() * 25000,
        netProfit: 0, // Será calculado
        activeCrops: 3 + Math.floor(Math.random() * 3),
        propertiesCount: 2 + Math.floor(Math.random() * 2)
      },
      cashFlowData: Array.from({ length: Math.max(months, 6) }, (_, i) => ({
        period: new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: 15000 + Math.random() * 10000,
        expenses: 8000 + Math.random() * 5000
      })),
      cropData: [
        { name: 'Soja', area: 150, production: 4500, revenue: 45000 },
        { name: 'Milho', area: 80, production: 3200, revenue: 25000 },
        { name: 'Café', area: 30, production: 900, revenue: 18000 },
        { name: 'Algodão', area: 60, production: 1800, revenue: 22000 }
      ],
      monthlyBreakdown: Array.from({ length: Math.max(months, 6) }, (_, i) => {
        const revenue = 15000 + Math.random() * 10000
        const expenses = 8000 + Math.random() * 5000
        return {
          month: new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
          revenue,
          expenses,
          profit: revenue - expenses
        }
      })
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
      const reportElement = document.getElementById('report-content')
      if (!reportElement) return

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`relatorio-agroflow-${reportData.period.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
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
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="semiannual">Semestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
