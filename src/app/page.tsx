'use client'

import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '@/components/auth/auth-provider'
import { DataProvider, useData } from '@/contexts/data-context'
import { LoginForm } from '@/components/auth/login-form'
import { Navigation } from '@/components/layout/navigation'
import { DashboardMetrics } from '@/components/dashboard/metrics-card'
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CropPlanning } from '@/components/crops/crop-planning'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { PropertyManagement } from '@/components/properties/property-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportGenerator } from '@/components/reports/report-generator'
import { TransactionHistory } from '@/components/transactions/transaction-history'

function MainApp() {
  const { user, loading } = useAuth()
  const { transactions, updateTransaction, deleteTransaction, deleteAllTransactions } = useData()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Hydrate active tab from localStorage and persist on change
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('agroflow:activeTab')
      if (savedTab) setActiveTab(savedTab)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('agroflow:activeTab', activeTab)
    } catch {}
  }, [activeTab])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoginForm />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <DashboardMetrics />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <CashFlowChart />
              </div>
              <div className="lg:col-span-1">
                <RecentTransactions />
              </div>
            </div>
          </div>
        )
      case 'crops':
        return <CropPlanning />
      case 'transactions':
        return <TransactionForm />
      case 'properties':
        return <PropertyManagement />
      case 'reports':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <ReportGenerator />
          </div>
        )
      case 'history':
        return (
          <div className="space-y-6">
            <TransactionHistory 
              transactions={transactions}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
              onDeleteAll={deleteAllTransactions}
            />
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Email: {user.email}</p>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Editar Perfil
                </button>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return <div>Página não encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="w-full min-h-screen bg-background overflow-x-hidden pt-20 pb-12 sm:pb-16 lg:pt-8 lg:pl-64">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  )
}