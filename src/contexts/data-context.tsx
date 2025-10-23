'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Transaction } from '@/types'
import { idb, type OutboxOperation } from '@/lib/idb'
import { supabase } from '@/lib/supabase'

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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  deleteAllTransactions: () => Promise<void>
  
  crops: CropCycle[]
  setCrops: (crops: CropCycle[]) => void
  addCrop: (crop: Omit<CropCycle, 'id'>) => void
  updateCrop: (id: string, crop: Partial<CropCycle>) => void
  deleteCrop: (id: string) => void
  deleteAllCrops: () => Promise<void>

  properties: PropertyItem[]
  setProperties: (properties: PropertyItem[]) => void
  addProperty: (property: Omit<PropertyItem, 'id'>) => void
  updateProperty: (id: string, property: Partial<PropertyItem>) => void
  deleteProperty: (id: string) => void
  deleteAllProperties: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  // Dados de exemplo - usados apenas na primeira vez
  const defaultTransactions: Transaction[] = [
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
  ]

  const defaultCrops: CropCycle[] = [
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
  ]

  const defaultProperties: PropertyItem[] = [
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
  ]

  // Inicializar com arrays vazios - os dados virão do IndexedDB
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [crops, setCrops] = useState<CropCycle[]>([])
  const [properties, setProperties] = useState<PropertyItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Verifica se já foi inicializado antes (flag no localStorage)
        const hasInitialized = localStorage.getItem('agroflow-initialized')
        
        const [storedTransactions, storedCrops, storedProperties] = await Promise.all([
          idb.getAll<Transaction>('transactions'),
          idb.getAll<CropCycle>('crops'),
          idb.getAll<PropertyItem>('properties'),
        ])
        
        if (!cancelled) {
          // Se nunca foi inicializado e não tem dados, usa os dados default
          if (!hasInitialized && storedTransactions.length === 0 && storedCrops.length === 0 && storedProperties.length === 0) {
            setTransactions(defaultTransactions)
            setCrops(defaultCrops)
            setProperties(defaultProperties)
            // Salva os dados default no IndexedDB
            await idb.bulkPut('transactions', defaultTransactions)
            await idb.bulkPut('crops', defaultCrops)
            await idb.bulkPut('properties', defaultProperties)
            localStorage.setItem('agroflow-initialized', 'true')
          } else {
            // Sempre usa os dados do IndexedDB (mesmo que esteja vazio)
            setTransactions(storedTransactions)
            setCrops(storedCrops)
            setProperties(storedProperties)
            localStorage.setItem('agroflow-initialized', 'true')
          }
          setIsInitialized(true)
        }
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  // Persist changes to IndexedDB (clear + bulkPut to keep stores in sync)
  // Só persiste após a inicialização para não sobrescrever durante o carregamento
  useEffect(() => {
    if (!isInitialized) return
    ;(async () => {
      try {
        await idb.clear('transactions')
        await idb.bulkPut('transactions', transactions)
      } catch {}
    })()
  }, [transactions, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    ;(async () => {
      try {
        await idb.clear('crops')
        await idb.bulkPut('crops', crops)
      } catch {}
    })()
  }, [crops, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    ;(async () => {
      try {
        await idb.clear('properties')
        await idb.bulkPut('properties', properties)
      } catch {}
    })()
  }, [properties, isInitialized])

  // Outbox helpers
  const enqueue = async (op: Omit<OutboxOperation, 'id' | 'timestamp'>) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`
    await idb.enqueue({ id, timestamp: Date.now(), ...op })
  }

  const syncOutbox = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    try {
      const ops = await idb.peekAll()
      for (const op of ops) {
        try {
          const table = op.entity
          if (op.action === 'create' || op.action === 'update') {
            const { error } = await supabase.from(table).upsert(op.payload)
            if (error) throw error
          } else if (op.action === 'delete') {
            const { error } = await supabase.from(table).delete().eq('id', op.payload?.id)
            if (error) throw error
          }
          await idb.removeFromOutbox(op.id)
        } catch {
          // Stop processing to retry later if any op fails
          break
        }
      }
    } catch {}
  }

  useEffect(() => {
    const handleOnline = () => { syncOutbox() }
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
    }
    // try once on mount
    syncOutbox()
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
      }
    }
  }, [])

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      user_id: 'user-1',
      created_at: new Date().toISOString()
    }
    setTransactions(prev => [...prev, newTransaction])
    enqueue({ entity: 'transactions', action: 'create', payload: newTransaction })
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...transaction } : t)
    )
    enqueue({ entity: 'transactions', action: 'update', payload: { id, ...transaction } })
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    enqueue({ entity: 'transactions', action: 'delete', payload: { id } })
  }

  const deleteAllTransactions = async () => {
    // Enfileira deleção de cada transação existente para sincronizar com Supabase
    const deletePromises = transactions.map(t => 
      enqueue({ entity: 'transactions', action: 'delete', payload: { id: t.id } })
    )
    await Promise.all(deletePromises)
    
    // Limpa estado local
    setTransactions([])
    
    // Tenta sincronizar imediatamente
    syncOutbox()
  }

  const addCrop = (crop: Omit<CropCycle, 'id'>) => {
    const newCrop: CropCycle = {
      ...crop,
      id: Date.now().toString()
    }
    setCrops(prev => [...prev, newCrop])
    enqueue({ entity: 'crops', action: 'create', payload: newCrop })
  }

  const updateCrop = (id: string, crop: Partial<CropCycle>) => {
    setCrops(prev => 
      prev.map(c => c.id === id ? { ...c, ...crop } : c)
    )
    enqueue({ entity: 'crops', action: 'update', payload: { id, ...crop } })
  }

  const deleteCrop = (id: string) => {
    setCrops(prev => prev.filter(c => c.id !== id))
    enqueue({ entity: 'crops', action: 'delete', payload: { id } })
  }

  const deleteAllCrops = async () => {
    // Enfileira deleção de cada safra existente para sincronizar com Supabase
    const deletePromises = crops.map(c => 
      enqueue({ entity: 'crops', action: 'delete', payload: { id: c.id } })
    )
    await Promise.all(deletePromises)
    
    // Limpa estado local
    setCrops([])
    
    // Tenta sincronizar imediatamente
    syncOutbox()
  }

  const addProperty = (property: Omit<PropertyItem, 'id'>) => {
    const newProperty: PropertyItem = { ...property, id: Date.now().toString() }
    setProperties(prev => [...prev, newProperty])
    enqueue({ entity: 'properties', action: 'create', payload: newProperty })
  }

  const updateProperty = (id: string, property: Partial<PropertyItem>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...property } : p))
    enqueue({ entity: 'properties', action: 'update', payload: { id, ...property } })
  }

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id))
    enqueue({ entity: 'properties', action: 'delete', payload: { id } })
  }

  const deleteAllProperties = async () => {
    // Enfileira deleção de cada propriedade existente para sincronizar com Supabase
    const deletePromises = properties.map(p => 
      enqueue({ entity: 'properties', action: 'delete', payload: { id: p.id } })
    )
    await Promise.all(deletePromises)
    
    // Limpa estado local
    setProperties([])
    
    // Tenta sincronizar imediatamente
    syncOutbox()
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
      deleteAllCrops,
      properties,
      setProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      deleteAllProperties
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
