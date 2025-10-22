'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Minus } from 'lucide-react'
import { FinancialCharts } from '@/components/dashboard/financial-charts'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  notes?: string
  status?: 'pending' | 'completed' | 'cancelled'
  project?: string
  client?: string
  isRecurring?: boolean
  recurrenceType?: 'monthly' | 'yearly' | 'weekly'
  attachments?: string[]
}

export function TransactionForm() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Venda de Soja',
      amount: 15000,
      type: 'income',
      category: 'Vendas',
      date: '2024-01-15'
    },
    {
      id: '2',
      description: 'Compra de Fertilizantes',
      amount: 3200,
      type: 'expense',
      category: 'Insumos',
      date: '2024-01-14'
    },
    {
      id: '3',
      description: 'Venda de Milho',
      amount: 8500,
      type: 'income',
      category: 'Vendas',
      date: '2024-01-20'
    },
    {
      id: '4',
      description: 'Mão de Obra',
      amount: 1800,
      type: 'expense',
      category: 'Mão de Obra',
      date: '2024-01-18'
    },
    {
      id: '5',
      description: 'Venda de Algodão',
      amount: 12000,
      type: 'income',
      category: 'Vendas',
      date: '2024-02-05'
    },
    {
      id: '6',
      description: 'Sementes',
      amount: 2500,
      type: 'expense',
      category: 'Insumos',
      date: '2024-02-03'
    },
    {
      id: '7',
      description: 'Combustível',
      amount: 1200,
      type: 'expense',
      category: 'Combustível',
      date: '2024-02-08'
    },
    {
      id: '8',
      description: 'Venda de Feijão',
      amount: 6800,
      type: 'income',
      category: 'Vendas',
      date: '2024-02-15'
    },
    {
      id: '9',
      description: 'Defensivos',
      amount: 4200,
      type: 'expense',
      category: 'Insumos',
      date: '2024-02-12'
    },
    {
      id: '10',
      description: 'Venda de Trigo',
      amount: 9500,
      type: 'income',
      category: 'Vendas',
      date: '2024-03-02'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'completed' as 'pending' | 'completed' | 'cancelled',
    project: '',
    client: '',
    isRecurring: false,
    recurrenceType: 'monthly' as 'monthly' | 'yearly' | 'weekly'
  })

  const handleAddTransaction = () => {
    if (newTransaction.description && newTransaction.amount) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        description: newTransaction.description,
        amount: Number(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        notes: newTransaction.notes,
        status: newTransaction.status,
        project: newTransaction.project,
        client: newTransaction.client,
        isRecurring: newTransaction.isRecurring,
        recurrenceType: newTransaction.recurrenceType
      }
      setTransactions([...transactions, transaction])
      setNewTransaction({
        description: '',
        amount: '',
        type: 'income',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'completed',
        project: '',
        client: '',
        isRecurring: false,
        recurrenceType: 'monthly'
      })
      setShowForm(false)
    }
  }

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Controle de Caixa</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {getTotalIncome().toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {getTotalExpenses().toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {getBalance().toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Financeiros */}
      <FinancialCharts transactions={transactions} />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Transação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    placeholder="Ex: Venda de Soja"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                      onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Receita
                    </Button>
                    <Button
                      type="button"
                      variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                      onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Despesa
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Input
                    placeholder="Ex: Vendas, Insumos, Mão de obra"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-48"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTransaction.status}
                    onChange={(e) => setNewTransaction({...newTransaction, status: e.target.value as 'pending' | 'completed' | 'cancelled'})}
                  >
                    <option value="completed">Concluída</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Detalhes Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Projeto/Cliente</label>
                  <Input
                    placeholder="Ex: Projeto Soja 2024, Cliente ABC"
                    value={newTransaction.project}
                    onChange={(e) => setNewTransaction({...newTransaction, project: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <Input
                    placeholder="Nome do cliente"
                    value={newTransaction.client}
                    onChange={(e) => setNewTransaction({...newTransaction, client: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTransaction.isRecurring}
                      onChange={(e) => setNewTransaction({...newTransaction, isRecurring: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Transação Recorrente</span>
                  </label>
                  {newTransaction.isRecurring && (
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTransaction.recurrenceType}
                      onChange={(e) => setNewTransaction({...newTransaction, recurrenceType: e.target.value as 'monthly' | 'yearly' | 'weekly'})}
                    >
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações adicionais sobre a transação..."
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                />
              </div>

              {/* Botão de Ação */}
              <div className="flex justify-end">
                <Button onClick={handleAddTransaction} className="px-8">
                  Adicionar Transação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                  </div>
                </div>
                
                {/* Detalhes Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {transaction.status && (
                    <div>
                      <span className="font-medium">Status:</span> {
                        transaction.status === 'completed' ? 'Concluída' :
                        transaction.status === 'pending' ? 'Pendente' :
                        transaction.status === 'cancelled' ? 'Cancelada' : transaction.status
                      }
                    </div>
                  )}
                  {transaction.project && (
                    <div>
                      <span className="font-medium">Projeto:</span> {transaction.project}
                    </div>
                  )}
                  {transaction.client && (
                    <div>
                      <span className="font-medium">Cliente:</span> {transaction.client}
                    </div>
                  )}
                  {transaction.isRecurring && (
                    <div>
                      <span className="font-medium">Recorrente:</span> {
                        transaction.recurrenceType === 'weekly' ? 'Semanal' :
                        transaction.recurrenceType === 'monthly' ? 'Mensal' :
                        transaction.recurrenceType === 'yearly' ? 'Anual' : transaction.recurrenceType
                      }
                    </div>
                  )}
                </div>
                
                {transaction.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Observações:</span> {transaction.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
