'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  AlertCircle,
  Save,
  XCircle
} from 'lucide-react'
import { Transaction } from '@/types'

interface TransactionHistoryProps {
  transactions: Transaction[]
  onUpdateTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void
  onDeleteTransaction: (id: string) => void
  onDeleteAll: () => void
}

export function TransactionHistory({ 
  transactions, 
  onUpdateTransaction, 
  onDeleteTransaction,
  onDeleteAll
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: '',
    date: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteMessage, setShowDeleteMessage] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('')
  const [showDeleteAllMessage, setShowDeleteAllMessage] = useState(false)

  // Get unique categories for filter
  const categories = Array.from(new Set(transactions.map(t => t.category)))

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = !filterCategory || transaction.category === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  // Sort by date (most recent first)
  const sortedTransactions = filteredTransactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
    })
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!editForm.description.trim()) {
      errors.description = 'Descrição é obrigatória'
    }
    
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }
    
    if (!editForm.category.trim()) {
      errors.category = 'Categoria é obrigatória'
    }
    
    if (!editForm.date) {
      errors.date = 'Data é obrigatória'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveEdit = () => {
    if (validateForm() && editingTransaction) {
      onUpdateTransaction(editingTransaction.id, {
        description: editForm.description,
        amount: Number(editForm.amount),
        type: editForm.type,
        category: editForm.category,
        date: editForm.date
      })
      setEditingTransaction(null)
      setEditForm({
        description: '',
        amount: '',
        type: 'income',
        category: '',
        date: ''
      })
      setFormErrors({})
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
    setEditForm({
      description: '',
      amount: '',
      type: 'income',
      category: '',
      date: ''
    })
    setFormErrors({})
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      onDeleteTransaction(id)
      setShowDeleteMessage(true)
      setTimeout(() => setShowDeleteMessage(false), 3000)
    }
  }

  const handleConfirmDeleteAll = () => {
    if (deleteAllConfirmText.trim().toLowerCase() === 'deletar tudo') {
      onDeleteAll()
      setShowDeleteAllModal(false)
      setDeleteAllConfirmText('')
      setShowDeleteAllMessage(true)
      setTimeout(() => setShowDeleteAllMessage(false), 3000)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Success Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4" />
          Transação atualizada com sucesso!
        </div>
      )}
      
      {showDeleteMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Transação excluída com sucesso!
        </div>
      )}

      {showDeleteAllMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Todas as transações foram excluídas!
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Histórico de Transações</h1>
        {transactions.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAllModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar tudo
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setFilterCategory('')
              }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          sortedTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {editingTransaction?.id === transaction.id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Descrição</label>
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          placeholder="Descrição da transação"
                          className={formErrors.description ? 'border-red-500' : ''}
                        />
                        {formErrors.description && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.description}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Valor</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                          placeholder="0.00"
                          className={formErrors.amount ? 'border-red-500' : ''}
                        />
                        {formErrors.amount && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.amount}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value as 'income' | 'expense'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="income">Receita</option>
                          <option value="expense">Despesa</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Categoria</label>
                        <Input
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          placeholder="Categoria"
                          className={formErrors.category ? 'border-red-500' : ''}
                        />
                        {formErrors.category && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.category}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Data</label>
                        <Input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className={formErrors.date ? 'border-red-500' : ''}
                        />
                        {formErrors.date && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.date}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Transaction Display
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{transaction.description}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{transaction.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {sortedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Transações</p>
                <p className="text-2xl font-bold">{sortedTransactions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    sortedTransactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    sortedTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${
                  sortedTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) -
                  sortedTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(
                    sortedTransactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0) -
                    sortedTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteAllModal(false)}></div>
          <div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Deletar todas as transações
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação é irreversível. Para confirmar, digite <span className="font-semibold">deletar tudo</span> abaixo.
            </p>
            <Input
              placeholder="Digite: deletar tudo"
              value={deleteAllConfirmText}
              onChange={(e) => setDeleteAllConfirmText(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowDeleteAllModal(false); setDeleteAllConfirmText('') }}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteAll}
                disabled={deleteAllConfirmText.trim().toLowerCase() !== 'deletar tudo'}
              >
                Deletar tudo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
