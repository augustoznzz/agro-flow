export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Property {
  id: string
  user_id: string
  name: string
  area_hectares: number
  location: string
  created_at: string
}

export interface PropertyItem {
  id: string
  name: string
  area_hectares: number
  location: string
}

export interface CropCycle {
  id: string
  property_id: string
  crop_type: string
  planting_date: string
  harvest_date?: string
  area_hectares: number
  estimated_cost: number
  estimated_revenue: number
  status: 'planning' | 'planted' | 'harvested'
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  property_id?: string
  crop_cycle_id?: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  created_at: string
  // Optional client-only fields used by UI
  notes?: string
  status?: 'pending' | 'completed' | 'cancelled'
  project?: string
  client?: string
  isRecurring?: boolean
  recurrenceType?: 'monthly' | 'yearly' | 'weekly'
}

export interface DashboardMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  activeCrops: number
  propertiesCount: number
}
