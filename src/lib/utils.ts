import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Categorias padronizadas para transações
export const TRANSACTION_CATEGORIES = [
  'Vendas',
  'Compra',
  'Insumos', 
  'Sementes',
  'Fertilizantes',
  'Defensivos',
  'Combustível',
  'Mão de obra',
  'Maquinário',
  'Manutenção',
  'Transporte',
  'Armazenamento',
  'Energia elétrica',
  'Água',
  'Impostos',
  'Financiamento',
  'Seguro',
  'Consultoria',
  'Outros'
] as const

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]