'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => void | Promise<void>
  delay?: number // ms
  enabled?: boolean
}

/**
 * Hook para salvamento automático com debounce
 * @param data - Dados a serem salvos
 * @param onSave - Função de callback para salvar os dados
 * @param delay - Tempo de espera em ms antes de salvar (padrão: 1000ms)
 * @param enabled - Se o auto-save está ativado (padrão: true)
 */
export function useAutoSave<T>({ 
  data, 
  onSave, 
  delay = 1000,
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout>()
  const initialDataRef = useRef<T>(data)
  const isFirstRender = useRef(true)

  // Função para salvar
  const save = useCallback(async () => {
    if (!enabled) return
    
    try {
      setStatus('saving')
      await Promise.resolve(onSave(data))
      setStatus('saved')
      
      // Volta para 'idle' após 2 segundos
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error)
      setStatus('error')
      
      // Volta para 'idle' após 3 segundos
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    }
  }, [data, onSave, enabled])

  useEffect(() => {
    // Pula o primeiro render
    if (isFirstRender.current) {
      isFirstRender.current = false
      initialDataRef.current = data
      return
    }

    // Não salva se desabilitado
    if (!enabled) return

    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Configura novo timeout
    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, save])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Função para forçar salvamento imediato
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    save()
  }, [save])

  return { status, forceSave }
}

