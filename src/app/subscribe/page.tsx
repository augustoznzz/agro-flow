'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    // Redireciona para o link de pagamento da Cakto
    window.location.href = 'https://pay.cakto.com.br/buk8mfi_632549'
  }

  const features = [
    'Gestão completa de propriedades rurais',
    'Controle de fluxo de caixa em tempo real',
    'Planejamento inteligente de safras',
    'Relatórios financeiros detalhados',
    'Acesso offline com sincronização automática',
    'Dashboard interativo com gráficos',
    'Suporte prioritário',
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold">Assine o AgroFlow</CardTitle>
          <CardDescription className="text-lg">
            Transforme sua gestão rural com inteligência e tecnologia
          </CardDescription>
          <div className="pt-4">
            <div className="text-5xl font-bold text-primary">R$ 99</div>
            <div className="text-muted-foreground">único pagamento</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? 'Redirecionando...' : 'Assinar Agora'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Ao clicar em "Assinar Agora", você será redirecionado para realizar o pagamento seguro.</p>
            <p className="mt-2">Após o pagamento confirmado, você receberá acesso imediato à plataforma.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

