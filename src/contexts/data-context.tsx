'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Transaction } from '@/types'

export interface CropCycle {
  id: string
  cropType: string
  area: number
  plantingDate: string
  estimatedCost: number
  estimatedRevenue: number
  status: 'planning' | 'planted' | 'harvested'
}

export interface PropertyItem {
  id: string
  name: string
  area: number
  location: string
  description?: string
}

interface DataContextType {
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  deleteAllTransactions: () => void
  
  crops: CropCycle[]
  setCrops: (crops: CropCycle[]) => void
  addCrop: (crop: Omit<CropCycle, 'id'>) => void
  updateCrop: (id: string, crop: Partial<CropCycle>) => void
  deleteCrop: (id: string) => void

  properties: PropertyItem[]
  setProperties: (properties: PropertyItem[]) => void
  addProperty: (property: Omit<PropertyItem, 'id'>) => void
  updateProperty: (id: string, property: Partial<PropertyItem>) => void
  deleteProperty: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      user_id: 'user-1',
      description: 'Venda de Soja',
      amount: 15000,
      type: 'income',
      category: 'Vendas',
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'user-1',
      description: 'Compra de Fertilizantes',
      amount: 3200,
      type: 'expense',
      category: 'Insumos',
      date: '2024-01-14',
      created_at: '2024-01-14T10:00:00Z'
    },
    {
      id: '3',
      user_id: 'user-1',
      description: 'Venda de Milho',
      amount: 8500,
      type: 'income',
      category: 'Vendas',
      date: '2024-01-20',
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '4',
      user_id: 'user-1',
      description: 'Mão de Obra',
      amount: 1800,
      type: 'expense',
      category: 'Mão de Obra',
      date: '2024-01-18',
      created_at: '2024-01-18T10:00:00Z'
    },
    {
      id: '5',
      user_id: 'user-1',
      description: 'Venda de Algodão',
      amount: 12000,
      type: 'income',
      category: 'Vendas',
      date: '2024-02-05',
      created_at: '2024-02-05T10:00:00Z'
    },
    {
      id: '6',
      user_id: 'user-1',
      description: 'Sementes',
      amount: 2500,
      type: 'expense',
      category: 'Insumos',
      date: '2024-02-03',
      created_at: '2024-02-03T10:00:00Z'
    },
    {
      id: '7',
      user_id: 'user-1',
      description: 'Combustível',
      amount: 1200,
      type: 'expense',
      category: 'Combustível',
      date: '2024-02-08',
      created_at: '2024-02-08T10:00:00Z'
    },
    {
      id: '8',
      user_id: 'user-1',
      description: 'Venda de Feijão',
      amount: 6800,
      type: 'income',
      category: 'Vendas',
      date: '2024-02-15',
      created_at: '2024-02-15T10:00:00Z'
    },
    {
      id: '9',
      user_id: 'user-1',
      description: 'Defensivos',
      amount: 4200,
      type: 'expense',
      category: 'Insumos',
      date: '2024-02-12',
      created_at: '2024-02-12T10:00:00Z'
    },
    {
      id: '10',
      user_id: 'user-1',
      description: 'Venda de Trigo',
      amount: 9500,
      type: 'income',
      category: 'Vendas',
      date: '2024-03-02',
      created_at: '2024-03-02T10:00:00Z'
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

  const [properties, setProperties] = useState<PropertyItem[]>([
    {
      id: '1',
      name: 'Fazenda São José',
      area: 150,
      location: 'Rio Verde - GO',
      description: 'Propriedade principal para cultivo de soja e milho'
    },
    {
      id: '2',
      name: 'Sítio Boa Vista',
      area: 45,
      location: 'Chapadão do Céu - GO',
      description: 'Pequena propriedade para horticultura'
    }
  ])

  // Persist and hydrate data from localStorage
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('agroflow:transactions')
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions))
      }
    } catch {}

    try {
      const storedCrops = localStorage.getItem('agroflow:crops')
      if (storedCrops) {
        setCrops(JSON.parse(storedCrops))
      }
    } catch {}

    try {
      const storedProperties = localStorage.getItem('agroflow:properties')
      if (storedProperties) {
        setProperties(JSON.parse(storedProperties))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('agroflow:transactions', JSON.stringify(transactions))
    } catch {}
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem('agroflow:crops', JSON.stringify(crops))
    } catch {}
  }, [crops])

  useEffect(() => {
    try {
      localStorage.setItem('agroflow:properties', JSON.stringify(properties))
    } catch {}
  }, [properties])

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

  const deleteAllTransactions = () => {
    setTransactions([])
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

  const addProperty = (property: Omit<PropertyItem, 'id'>) => {
    const newProperty: PropertyItem = { ...property, id: Date.now().toString() }
    setProperties(prev => [...prev, newProperty])
  }

  const updateProperty = (id: string, property: Partial<PropertyItem>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...property } : p))
  }

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  return (
    <DataContext.Provider value={{
      transactions,
      setTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteAllTransactions,
      crops,
      setCrops,
      addCrop,
      updateCrop,
      deleteCrop,
      properties,
      setProperties,
      addProperty,
      updateProperty,
      deleteProperty
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
