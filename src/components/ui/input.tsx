import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { className, type, onChange, ...props },
  ref
) => {
  // Keep a local ref so we can call showPicker()/click() reliably
  const localRef = React.useRef<HTMLInputElement | null>(null)

  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node
    if (typeof ref === "function") {
      ref(node)
    } else if (ref) {
      ;(ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    }
  }

  if (type === "number") {
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      const cursorPos = input.selectionStart || 0
      const text = input.value
      
      // Normalize input: remove formatting, keep only digits and decimal separators
      const sign = text.trim().startsWith("-") ? "-" : ""
      const digitsAndSeps = text.replace(/[^0-9.,-]/g, "")
      const lastDot = digitsAndSeps.lastIndexOf(".")
      const lastComma = digitsAndSeps.lastIndexOf(",")
      const sepIndex = Math.max(lastDot, lastComma)
      
      let intPart = digitsAndSeps
      let decPart = ""
      if (sepIndex > -1) {
        intPart = digitsAndSeps.slice(0, sepIndex)
        decPart = digitsAndSeps.slice(sepIndex + 1)
      }
      intPart = intPart.replace(/[^0-9]/g, "")
      decPart = decPart.replace(/[^0-9]/g, "")
      
      // Format display value with thousands separators
      const addThousandsDots = (int: string) => {
        if (!int) return ""
        return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      }
      
      const formattedInt = addThousandsDots(intPart)
      const displayValue = sign + formattedInt + (decPart ? "," + decPart : "")
      
      // Raw value for state (no formatting)
      const rawValue = sign + intPart + (decPart ? "." + decPart : "")
      
      // Calculate new cursor position
      const oldDigitsBeforeCursor = text.slice(0, cursorPos).replace(/[^0-9]/g, "").length
      let counted = 0
      let newCursorPos = 0
      for (let i = 0; i < displayValue.length; i++) {
        if (/\d/.test(displayValue[i])) {
          counted++
          if (counted === oldDigitsBeforeCursor) {
            newCursorPos = i + 1
            break
          }
        }
      }
      
      // Update display
      input.value = displayValue
      
      // Set raw value for onChange callback
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: rawValue },
        currentTarget: { ...e.currentTarget, value: rawValue }
      } as React.ChangeEvent<HTMLInputElement>
      
      // Restore cursor after React update
      setTimeout(() => {
        input.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
      
      onChange?.(syntheticEvent)
    }

    // Format initial value for display
    const rawValue = (props as any).value
    const rawString = typeof rawValue === "number" ? String(rawValue) : typeof rawValue === "string" ? rawValue : ""
    
    const formatDisplay = (val: string) => {
      if (!val) return ""
      const sign = val.trim().startsWith("-") ? "-" : ""
      const digitsAndSeps = val.replace(/[^0-9.,-]/g, "")
      const lastDot = digitsAndSeps.lastIndexOf(".")
      const lastComma = digitsAndSeps.lastIndexOf(",")
      const sepIndex = Math.max(lastDot, lastComma)
      
      let intPart = digitsAndSeps
      let decPart = ""
      if (sepIndex > -1) {
        intPart = digitsAndSeps.slice(0, sepIndex)
        decPart = digitsAndSeps.slice(sepIndex + 1)
      }
      intPart = intPart.replace(/[^0-9]/g, "")
      decPart = decPart.replace(/[^0-9]/g, "")
      
      const formattedInt = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
      return sign + formattedInt + (decPart ? "," + decPart : "")
    }

    return (
      <input
        type="text"
        inputMode={(props as any).inputMode ?? "decimal"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={setRefs}
        {...props}
        value={formatDisplay(rawString)}
        onChange={handleNumberChange}
      />
    )
  }

  if (type === "date") {
    const handleMaskedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = e.currentTarget
      const cursorPos = el.selectionStart || 0
      const oldValue = el.value
      const onlyDigits = oldValue.replace(/\D/g, "").slice(0, 8)
      
      let next = ""
      // Format: DD-MM-AAAA
      if (onlyDigits.length > 0) {
        next = onlyDigits.slice(0, 2) // DD
      }
      if (onlyDigits.length > 2) {
        next += "-" + onlyDigits.slice(2, 4) // MM
      }
      if (onlyDigits.length > 4) {
        next += "-" + onlyDigits.slice(4, 8) // AAAA
      }
      
      // Calculate new cursor position accounting for auto-inserted hyphens
      let newCursorPos = cursorPos
      if (oldValue !== next) {
        const oldDigitsBeforeCursor = oldValue.slice(0, cursorPos).replace(/\D/g, "").length
        let counted = 0
        for (let i = 0; i < next.length; i++) {
          if (/\d/.test(next[i])) {
            counted++
            if (counted === oldDigitsBeforeCursor) {
              newCursorPos = i + 1
              break
            }
          }
        }
        el.value = next
        // Restore cursor position after React updates
        setTimeout(() => {
          el.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
      }
      
      onChange?.(e)
    }

    const handleMaskedDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Tab", "Home", "End"
      ]
      if (allowedKeys.includes(e.key)) return
      // Allow only digits; we auto-insert hyphens
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }
    
    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="\\d{2}-\\d{2}-\\d{4}"
        maxLength={10}
        autoComplete="off"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 af-date",
          className
        )}
        ref={setRefs}
        placeholder="DD-MM-AAAA"
        onChange={handleMaskedDateChange}
        onKeyDown={handleMaskedDateKeyDown}
        {...props}
      />
    )
  }

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={setRefs}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
