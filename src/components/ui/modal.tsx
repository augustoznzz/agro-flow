'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initialFocusRef?: React.RefObject<HTMLElement>
}

const sizeToMaxWidth: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl'
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  initialFocusRef
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  // Keep latest onClose without retriggering the focus effect
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Close on ESC and trap focus within the modal
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      }
      if (e.key === 'Tab') {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Focus handling - only if explicitly provided via initialFocusRef
    // Don't auto-focus first input to avoid interfering with form field focus
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus()
    }

    // Prevent background scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, initialFocusRef])

  if (!open) return null

  const maxWidth = sizeToMaxWidth[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true"></div>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={`relative z-10 w-full ${maxWidth} rounded-lg border bg-background p-0 shadow-lg`}
      >
        {(title || description) && (
          <div className="px-6 pt-5 pb-2">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-6 pb-5 pt-2 border-t flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal



