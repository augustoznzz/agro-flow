import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

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
    const rawValue = (props as any).value
    const rawString =
      typeof rawValue === "number" ? String(rawValue) : typeof rawValue === "string" ? rawValue : ""

    const normalizeParts = (value: string) => {
      const sign = value.trim().startsWith("-") ? "-" : ""
      const digitsAndSeps = value.replace(/[^0-9.,-]/g, "")
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
      return { sign, intPart, decPart }
    }

    const addThousandsDots = (intPart: string) => {
      if (!intPart) return ""
      return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    const { sign, intPart, decPart } = normalizeParts(rawString)
    const formattedInt = addThousandsDots(intPart)
    const displayValue = sign + formattedInt + (decPart ? "," + decPart : "")

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.currentTarget.value
      const { sign, intPart, decPart } = normalizeParts(text)
      const raw = sign + intPart + (decPart ? "." + decPart : "")
      e.currentTarget.value = raw
      ;(e.target as any).value = raw
      onChange?.(e)
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
        value={displayValue}
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
      if (onlyDigits.length > 0) {
        next = onlyDigits.slice(0, 4)
      }
      if (onlyDigits.length > 4) {
        next += "-" + onlyDigits.slice(4, 6)
      }
      if (onlyDigits.length > 6) {
        next += "-" + onlyDigits.slice(6, 8)
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
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="\\d{4}-\\d{2}-\\d{2}"
          maxLength={10}
          autoComplete="off"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 af-date",
            className
          )}
          ref={setRefs}
          placeholder="AAAA-MM-DD"
          onChange={handleMaskedDateChange}
          onKeyDown={handleMaskedDateKeyDown}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-2 flex items-center justify-center p-1 text-muted-foreground"
        >
          <Calendar className="h-5 w-5" />
        </span>
      </div>
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
