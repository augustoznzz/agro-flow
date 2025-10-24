import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
}

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
      const text = input.value
      
      // Remove all non-digits except decimal separator (comma or dot)
      const digitsOnly = text.replace(/[^0-9,]/g, "")
      
      // Pass the raw numeric value (without formatting) to parent
      const rawValue = digitsOnly.replace(/,/g, ".")
      
      // Create synthetic event with raw value
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: rawValue },
        currentTarget: { ...e.currentTarget, value: rawValue }
      } as React.ChangeEvent<HTMLInputElement>
      
      onChange?.(syntheticEvent)
    }

    // Format value for display with thousand separators (dots every 3 digits)
    const rawValue = props.value
    const rawString = typeof rawValue === "number" ? String(rawValue) : typeof rawValue === "string" ? rawValue : ""
    
    const formatDisplay = (val: string) => {
      if (!val) return ""
      
      // Split into integer and decimal parts
      const parts = val.split(".")
      let intPart = parts[0] || ""
      const decPart = parts[1] || ""
      
      // Remove any existing dots/formatting
      intPart = intPart.replace(/\D/g, "")
      
      // Add dots every 3 digits from right to left
      if (intPart) {
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      }
      
      // Return formatted value (use comma for decimal separator if exists)
      return intPart + (decPart ? "," + decPart : "")
    }

    return (
      <input
        type="text"
        inputMode="decimal"
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
      const input = e.currentTarget
      const text = input.value
      const onlyDigits = text.replace(/\D/g, "").slice(0, 8)
      
      let formatted = ""
      // Format: DD-MM-AAAA
      if (onlyDigits.length > 0) {
        formatted = onlyDigits.slice(0, 2) // DD
      }
      if (onlyDigits.length > 2) {
        formatted += "-" + onlyDigits.slice(2, 4) // MM
      }
      if (onlyDigits.length > 4) {
        formatted += "-" + onlyDigits.slice(4, 8) // AAAA
      }
      
      // Pass formatted value to parent
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: formatted },
        currentTarget: { ...e.currentTarget, value: formatted }
      } as React.ChangeEvent<HTMLInputElement>
      
      onChange?.(syntheticEvent)
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
    
    // Format value for display
    const rawValue = props.value || ""
    const formatDateDisplay = (val: string) => {
      const digits = val.replace(/\D/g, "").slice(0, 8)
      let result = ""
      if (digits.length > 0) {
        result = digits.slice(0, 2)
      }
      if (digits.length > 2) {
        result += "-" + digits.slice(2, 4)
      }
      if (digits.length > 4) {
        result += "-" + digits.slice(4, 8)
      }
      return result
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
        value={formatDateDisplay(String(rawValue))}
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
      onChange={onChange}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
