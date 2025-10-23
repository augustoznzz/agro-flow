'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Minus, Edit2, Trash2 } from 'lucide-react'
import { FinancialCharts } from '@/components/dashboard/financial-charts'
import { Modal } from '@/components/ui/modal'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { useData } from '@/contexts/data-context'
import { useAutoSave } from '@/hooks/use-auto-save'
import type { Transaction } from '@/types'

export function TransactionFormAuto() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: '',
    date: '',
    notes: '',
    status: 'completed' as 'pending' | 'completed' | 'cancelled',
    project: '',
    client: '',
    isRecurring: false,
    recurrenceType: 'monthly' as 'monthly' | 'yearly' | 'weekly'
  })

  // Auto-save quando editando uma transação existente
  const { status: autoSaveStatus } = useAutoSave({
    data: formData,
    onSave: (data) => {
      if (editingId && data.description && data.amount) {
        updateTransaction(editingId, {
          description: data.description,
          amount: Number(data.amount),
          type: data.type,
          category: data.category,
          date: data.date,
          notes: data.notes,
          status: data.status,
          project: data.project,
          client: data.client,
          isRecurring: data.isRecurring,
          recurrenceType: data.recurrenceType
        })
      }
    },
    delay: 800,
    enabled: editingId !== null // Só ativa auto-save quando está editando
  })

  const handleAddTransaction = () => {
    if (formData.description && formData.amount) {
      if (editingId) {
        // Ao salvar manualmente, atualiza a transação
        updateTransaction(editingId, {
          description: formData.description,
          amount: Number(formData.amount),
          type: formData.type,
          category: formData.category,
          date: formData.date,
          notes: formData.notes,
          status: formData.status,
          project: formData.project,
          client: formData.client,
          isRecurring: formData.isRecurring,
          recurrenceType: formData.recurrenceType
        })
      } else {
        // Adiciona nova transação
        addTransaction({
          description: formData.description,
          amount: Number(formData.amount),
          type: formData.type,
          category: formData.category,
          date: formData.date,
          notes: formData.notes,
          status: formData.status,
          project: formData.project,
          client: formData.client,
          isRecurring: formData.isRecurring,
          recurrenceType: formData.recurrenceType
        })
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'income',
      category: '',
      date: '',
      notes: '',
      status: 'completed',
      project: '',
      client: '',
      isRecurring: false,
      recurrenceType: 'monthly'
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      notes: transaction.notes || '',
      status: transaction.status || 'completed',
      project: transaction.project || '',
      client: transaction.client || '',
      isRecurring: transaction.isRecurring || false,
      recurrenceType: transaction.recurrenceType || 'monthly'
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id)
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Controle de Caixa</h2>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
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

      <Modal 
        open={showForm} 
        onClose={resetForm} 
        title={editingId ? 'Editar Transação' : 'Adicionar Nova Transação'} 
        size="xl"
      >
        <div className="space-y-6">
          {/* Indicador de Auto-Save */}
          {editingId && (
            <div className="flex justify-end">
              <AutoSaveIndicator status={autoSaveStatus} />
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Ex: Venda de Soja"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                placeholder="15000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'income'})}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Receita
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, type: 'expense'})}
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
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full sm:w-48"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'completed' | 'cancelled'})}
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
                value={formData.project}
                onChange={(e) => setFormData({...formData, project: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Input
                placeholder="Nome do cliente"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm font-medium">Transação Recorrente</span>
              </label>
              {formData.isRecurring && (
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.recurrenceType}
                  onChange={(e) => setFormData({...formData, recurrenceType: e.target.value as 'monthly' | 'yearly' | 'weekly'})}
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
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {/* Botão de Ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleAddTransaction} className="px-8 w-full sm:w-auto">
              {editingId ? 'Salvar Alterações' : 'Adicionar Transação'}
            </Button>
          </div>
        </div>
      </Modal>

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
                  <div className="flex items-center gap-3">
                    <div className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

