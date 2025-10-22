'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', receitas: 4000, despesas: 2400 },
  { month: 'Fev', receitas: 3000, despesas: 1398 },
  { month: 'Mar', receitas: 2000, despesas: 9800 },
  { month: 'Abr', receitas: 2780, despesas: 3908 },
  { month: 'Mai', receitas: 1890, despesas: 4800 },
  { month: 'Jun', receitas: 2390, despesas: 3800 },
  { month: 'Jul', receitas: 3490, despesas: 4300 },
]

export function CashFlowChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Fluxo de Caixa - Últimos 7 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${Number(value).toLocaleString('pt-BR')}`,
                name === 'receitas' ? 'Receitas' : 'Despesas'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10b981" 
              strokeWidth={2}
              name="receitas"
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="despesas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
