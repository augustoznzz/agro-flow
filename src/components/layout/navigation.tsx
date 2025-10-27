'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Crop, 
  DollarSign, 
  MapPin, 
  BarChart3, 
  History,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Adicionar classe ao body para controlar o blur
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    // Limpa o localStorage para simular logout mesmo sem Supabase
    localStorage.clear()
    window.location.reload()
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'crops', label: 'Safras', icon: Crop },
    { id: 'transactions', label: 'Caixa', icon: DollarSign },
    { id: 'properties', label: 'Propriedades', icon: MapPin },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <>
      {/* Mobile header - Fixed at top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center">
            <img 
              src="/logo2.png" 
              alt="AgroFlow Logo" 
              className="h-7 w-7 mr-2"
            />
            <h1 className="text-lg font-bold text-primary">AgroFlow</h1>
          </div>
        </div>
      </header>

      {/* Navigation sidebar */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:shadow-none lg:z-30 mt-16 lg:mt-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo - Only visible on desktop */}
          <div className="hidden lg:flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <img 
              src="/logo2.png" 
              alt="AgroFlow Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-bold text-primary">AgroFlow</h1>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* Sign Out */}
          <div className="px-4 pb-6">
            <Button
              variant="ghost"
              className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </nav>

      {/* Invisible overlay for mobile - allows clicking outside to close menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden mt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
