import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { className, type, ...props },
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

  if (type === "date") {
    return (
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 af-date",
            className
          )}
          ref={setRefs}
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
