'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/components/auth/auth-provider'
import { LoginForm } from '@/components/auth/login-form'
import { Navigation } from '@/components/layout/navigation'
import { DashboardMetrics } from '@/components/dashboard/metrics-card'
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { CropPlanning } from '@/components/crops/crop-planning'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { PropertyManagement } from '@/components/properties/property-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function MainApp() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginForm />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <DashboardMetrics />
            <div className="grid gap-4 md:grid-cols-7">
              <CashFlowChart />
              <RecentTransactions />
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
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Relatório consolidado do ano atual</p>
                  <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Gerar Relatório
                  </button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Safras</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Comparativo entre diferentes safras</p>
                  <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Gerar Relatório
                  </button>
                </CardContent>
              </Card>
            </div>
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
                <p className="text-gray-600">Email: {user.email}</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
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
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="md:ml-64 p-6 pt-16 md:pt-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}