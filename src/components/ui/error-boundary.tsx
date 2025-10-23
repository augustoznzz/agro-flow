'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Erro no Gráfico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ocorreu um erro ao carregar o gráfico. Tente recarregar a página.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
