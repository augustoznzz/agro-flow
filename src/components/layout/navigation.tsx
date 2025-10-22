'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Crop, 
  DollarSign, 
  MapPin, 
  BarChart3, 
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'crops', label: 'Safras', icon: Crop },
    { id: 'transactions', label: 'Caixa', icon: DollarSign },
    { id: 'properties', label: 'Propriedades', icon: MapPin },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Navigation */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">AgroFlow</h1>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
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

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
