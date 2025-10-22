'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface Transaction {
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

export interface CropCycle {
  id: string
  cropType: string
  area: number
  plantingDate: string
  estimatedCost: number
  estimatedRevenue: number
  status: 'planning' | 'planted' | 'harvested'
}

interface DataContextType {
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  
  crops: CropCycle[]
  setCrops: (crops: CropCycle[]) => void
  addCrop: (crop: Omit<CropCycle, 'id'>) => void
  updateCrop: (id: string, crop: Partial<CropCycle>) => void
  deleteCrop: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
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

  const [crops, setCrops] = useState<CropCycle[]>([
    {
      id: '1',
      cropType: 'Soja',
      area: 50,
      plantingDate: '2024-02-15',
      estimatedCost: 25000,
      estimatedRevenue: 45000,
      status: 'planted'
    },
    {
      id: '2',
      cropType: 'Milho',
      area: 30,
      plantingDate: '2024-03-01',
      estimatedCost: 15000,
      estimatedRevenue: 30000,
      status: 'planted'
    },
    {
      id: '3',
      cropType: 'Algodão',
      area: 25,
      plantingDate: '2024-01-10',
      estimatedCost: 20000,
      estimatedRevenue: 35000,
      status: 'harvested'
    },
    {
      id: '4',
      cropType: 'Café',
      area: 15,
      plantingDate: '2024-04-01',
      estimatedCost: 12000,
      estimatedRevenue: 25000,
      status: 'planning'
    }
  ])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...transaction } : t)
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const addCrop = (crop: Omit<CropCycle, 'id'>) => {
    const newCrop: CropCycle = {
      ...crop,
      id: Date.now().toString()
    }
    setCrops(prev => [...prev, newCrop])
  }

  const updateCrop = (id: string, crop: Partial<CropCycle>) => {
    setCrops(prev => 
      prev.map(c => c.id === id ? { ...c, ...crop } : c)
    )
  }

  const deleteCrop = (id: string) => {
    setCrops(prev => prev.filter(c => c.id !== id))
  }

  return (
    <DataContext.Provider value={{
      transactions,
      setTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      crops,
      setCrops,
      addCrop,
      updateCrop,
      deleteCrop
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
