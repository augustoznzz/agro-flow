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
        // Dados de exemplo - usados apenas na primeira vez
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1 // Mês atual (1-12)
        const currentDate = now.getDate()
        
        // Gera datas para o mês atual e anterior
        const getDateString = (monthOffset: number, day: number) => {
          const targetMonth = currentMonth + monthOffset
          const targetYear = targetMonth <= 0 ? currentYear - 1 : currentYear
          const finalMonth = targetMonth <= 0 ? 12 + targetMonth : targetMonth
          return `${targetYear}-${String(finalMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        }
        
        const defaultTransactions: Transaction[] = [
          {
            id: '1',
            user_id: 'user-1',
            description: 'Venda de Soja',
            amount: 15000,
            type: 'income',
            category: 'Vendas',
            date: getDateString(0, currentDate),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: 'user-1',
            description: 'Compra de Fertilizantes',
            amount: 3200,
            type: 'expense',
            category: 'Insumos',
            date: getDateString(0, Math.max(1, currentDate - 1)),
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            user_id: 'user-1',
            description: 'Venda de Milho',
            amount: 8500,
            type: 'income',
            category: 'Vendas',
            date: getDateString(0, Math.max(1, currentDate - 2)),
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            user_id: 'user-1',
            description: 'Mão de Obra',
            amount: 1800,
            type: 'expense',
            category: 'Mão de Obra',
            date: getDateString(0, Math.max(1, currentDate - 3)),
            created_at: new Date().toISOString()
          },
          {
            id: '5',
            user_id: 'user-1',
            description: 'Venda de Algodão',
            amount: 12000,
            type: 'income',
            category: 'Vendas',
            date: getDateString(-1, 5),
            created_at: new Date().toISOString()
          },
          {
            id: '6',
            user_id: 'user-1',
            description: 'Sementes',
            amount: 2500,
            type: 'expense',
            category: 'Insumos',
            date: getDateString(-1, 3),
            created_at: new Date().toISOString()
          },
          {
            id: '7',
            user_id: 'user-1',
            description: 'Combustível',
            amount: 1200,
            type: 'expense',
            category: 'Combustível',
            date: getDateString(-1, 8),
            created_at: new Date().toISOString()
          },
          {
            id: '8',
            user_id: 'user-1',
            description: 'Venda de Feijão',
            amount: 6800,
            type: 'income',
            category: 'Vendas',
            date: getDateString(-1, 15),
            created_at: new Date().toISOString()
          },
          {
            id: '9',
            user_id: 'user-1',
            description: 'Defensivos',
            amount: 4200,
            type: 'expense',
            category: 'Insumos',
            date: getDateString(-1, 12),
            created_at: new Date().toISOString()
          },
          {
            id: '10',
            user_id: 'user-1',
            description: 'Venda de Trigo',
            amount: 9500,
            type: 'income',
            category: 'Vendas',
            date: getDateString(-2, 2),
            created_at: new Date().toISOString()
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
            // MIGRAÇÃO CRÍTICA: Normaliza E converte todas as datas para DD-MM-AAAA brasileiro
            console.log('🔄 MIGRAÇÃO: processando', storedTransactions.length, 'transações existentes')
            
            const migrateDateFormat = (dateStr: string): string => {
              if (!dateStr || typeof dateStr !== 'string') return dateStr

              // Se já está no formato DD-MM-AAAA, mantém como está
              if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
                return dateStr
              }

              // Se está no formato YYYY-MM-DD, converte para DD-MM-AAAA
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [year, month, day] = dateStr.split('-')
                const converted = `${day}-${month}-${year}`
                console.log('✅ MIGRAÇÃO:', dateStr, '->', converted)
                return converted
              }

              // Fallback para outros formatos
              try {
                const d = new Date(dateStr)
                if (!isNaN(d.getTime())) {
                  const year = d.getFullYear()
                  const month = String(d.getMonth() + 1).padStart(2, '0')
                  const day = String(d.getDate()).padStart(2, '0')
                  return `${day}-${month}-${year}`
                }
              } catch {}

              return dateStr
            }
            
            const normalizedTx = storedTransactions.map((t) => ({
              ...t,
              amount: Number((t as Transaction).amount) || 0,
              date: migrateDateFormat(typeof (t as Transaction).date === 'string' ? (t as Transaction).date : new Date((t as Transaction).date).toISOString().split('T')[0])
            }))
            
            console.log('✅ MIGRAÇÃO CONCLUÍDA:', normalizedTx.length, 'transações migradas para DD-MM-AAAA')
            
            // Salva as transações migradas de volta no IndexedDB
            await idb.bulkPut('transactions', normalizedTx)
            setTransactions(normalizedTx)
            setCrops(storedCrops)
            setProperties(storedProperties)
            localStorage.setItem('agroflow-initialized', 'true')
          }
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('DataProvider: Initialization error:', error)
      }
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
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as Crypto).randomUUID() : `${Date.now()}-${Math.random()}`
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
    // Função auxiliar para garantir data válida no formato DD-MM-AAAA
    const ensureValidDate = (dateString: string): string => {
      if (!dateString || dateString.trim() === '') {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        return `${day}-${month}-${year}`
      }
      
      // Se já está no formato DD-MM-AAAA, valida e retorna
      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = dateString.split('-')
        const testDate = new Date(Number(year), Number(month) - 1, Number(day))
        if (!isNaN(testDate.getTime())) {
          return dateString
        }
      }
      
      // Se está no formato YYYY-MM-DD, converte para DD-MM-AAAA
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-')
        const testDate = new Date(Number(year), Number(month) - 1, Number(day))
        if (!isNaN(testDate.getTime())) {
          return `${day}-${month}-${year}`
        }
      }
      
      // Se a data é inválida, usa a data atual no formato DD-MM-AAAA
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${day}-${month}-${year}`
    }

    const finalDate = ensureValidDate(transaction.date)
    
    const newTransaction: Transaction = {
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      date: finalDate,
      property_id: transaction.property_id,
      crop_cycle_id: transaction.crop_cycle_id,
      notes: transaction.notes,
      status: transaction.status,
      project: transaction.project,
      client: transaction.client,
      isRecurring: transaction.isRecurring,
      recurrenceType: transaction.recurrenceType,
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-1',
      created_at: new Date().toISOString()
    }
    
    setTransactions(prev => [...prev, newTransaction])
    enqueue({ entity: 'transactions', action: 'create', payload: newTransaction as unknown as Record<string, unknown> })
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    // Função auxiliar para garantir data válida no formato DD-MM-AAAA (reutilizada)
    const ensureValidDate = (dateString: string | undefined): string | undefined => {
      if (dateString === undefined) return undefined
      
      if (!dateString || dateString.trim() === '') {
        // Se não há data, usa a data atual no formato DD-MM-AAAA
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        return `${day}-${month}-${year}`
      }
      
      // Se já está no formato DD-MM-AAAA, valida e retorna
      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = dateString.split('-')
        const testDate = new Date(Number(year), Number(month) - 1, Number(day))
        if (!isNaN(testDate.getTime())) {
          return dateString
        }
      }
      
      // Se está no formato YYYY-MM-DD, converte para DD-MM-AAAA
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-')
        const testDate = new Date(Number(year), Number(month) - 1, Number(day))
        if (!isNaN(testDate.getTime())) {
          return `${day}-${month}-${year}`
        }
      }
      
      // Se a data é inválida, usa a data atual no formato DD-MM-AAAA
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${day}-${month}-${year}`
    }

    // Se há uma data sendo atualizada, valida ela
    const updatedTransaction = transaction.date !== undefined 
      ? { ...transaction, date: ensureValidDate(transaction.date) }
      : transaction

    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    )
    enqueue({ entity: 'transactions', action: 'update', payload: { id, ...updatedTransaction } })
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
      id: `crop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setCrops(prev => [...prev, newCrop])
    enqueue({ entity: 'crops', action: 'create', payload: newCrop as unknown as Record<string, unknown> })
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
    const newProperty: PropertyItem = { ...property, id: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }
    setProperties(prev => [...prev, newProperty])
    enqueue({ entity: 'properties', action: 'create', payload: newProperty as unknown as Record<string, unknown> })
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
