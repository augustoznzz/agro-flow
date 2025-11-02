// Netlify Functions handler - sem import de tipos externos para compatibilidade

// Variável de ambiente para autenticar webhooks da Cakto
const WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || ''

interface CaktoWebhookPayload {
  event: string
  data: {
    payment_id: string
    email: string
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
    payment_date?: string
    amount?: number
    metadata?: Record<string, any>
  }
}

export const handler = async (event: any) => {
  // Apenas permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Validar autenticação (se configurado)
    if (WEBHOOK_SECRET) {
      const authHeader = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret']
      if (authHeader !== WEBHOOK_SECRET) {
        console.error('Webhook authentication failed')
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
    }

    const payload: CaktoWebhookPayload = JSON.parse(event.body || '{}')

    console.log('Received webhook:', payload)

    // Verificar se é um evento de pagamento válido
    if (!payload.event || !payload.data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid payload' }),
      }
    }

    const { event: eventType, data } = payload

    // Processar apenas eventos de pagamento aprovado
    if (eventType === 'payment.approved' || data.status === 'paid') {
      await processPaymentApproved(data)
    } else if (eventType === 'payment.cancelled' || data.status === 'cancelled') {
      await processPaymentCancelled(data)
    } else if (eventType === 'payment.failed' || data.status === 'failed') {
      await processPaymentFailed(data)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Webhook processed' }),
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
    }
  }
}

async function processPaymentApproved(data: CaktoWebhookPayload['data']) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not configured')
    return
  }

  try {
    // Criar cliente Supabase com service role para bypass RLS
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se já existe usuário com este email
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const user = existingUser.users.find(u => u.email === data.email)

    let userId: string

    if (user) {
      userId = user.id
    } else {
      // Criar usuário se não existir
      // A Cakto deve enviar email e senha no metadata, ou você precisa implementar outra lógica
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: {
          source: 'cakto',
          payment_id: data.payment_id,
        },
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      userId = newUser.user.id
    }

    // Criar ou atualizar assinatura
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Assinatura válida por 1 ano

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        email: data.email,
        payment_id: data.payment_id,
        payment_status: 'paid',
        payment_date: data.payment_date || new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (subError) {
      console.error('Error saving subscription:', subError)
      throw subError
    }

    console.log(`Subscription activated for user: ${userId}`)
  } catch (error) {
    console.error('Error in processPaymentApproved:', error)
    throw error
  }
}

async function processPaymentCancelled(data: CaktoWebhookPayload['data']) {
  // Atualizar status da assinatura para cancelled
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  await supabase
    .from('subscriptions')
    .update({
      payment_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', data.payment_id)

  console.log(`Subscription cancelled for payment: ${data.payment_id}`)
}

async function processPaymentFailed(data: CaktoWebhookPayload['data']) {
  // Atualizar status da assinatura para failed
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  await supabase
    .from('subscriptions')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('payment_id', data.payment_id)

  console.log(`Subscription failed for payment: ${data.payment_id}`)
}

