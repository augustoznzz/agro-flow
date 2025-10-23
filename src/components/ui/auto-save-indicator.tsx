'use client'

import { CheckCircle2, CloudOff, Loader2 } from 'lucide-react'
import type { AutoSaveStatus } from '@/hooks/use-auto-save'

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus
  className?: string
}

export function AutoSaveIndicator({ status, className = '' }: AutoSaveIndicatorProps) {
  const getIndicator = () => {
    switch (status) {
      case 'saving':
        return (
          <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Salvando...</span>
          </div>
        )
      case 'saved':
        return (
          <div className={`flex items-center gap-2 text-green-600 ${className}`}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Salvo automaticamente</span>
          </div>
        )
      case 'error':
        return (
          <div className={`flex items-center gap-2 text-red-600 ${className}`}>
            <CloudOff className="h-4 w-4" />
            <span className="text-sm">Erro ao salvar</span>
          </div>
        )
      default:
        return null
    }
  }

  return <div className="transition-opacity duration-200">{getIndicator()}</div>
}

