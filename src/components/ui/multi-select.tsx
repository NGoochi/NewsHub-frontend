"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    onChange(options.map(option => option.value))
  }

  const handleDeselectAll = () => {
    onChange([])
  }

  const selectedOptions = options.filter(option => selected.includes(option.value))

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between bg-slate-700/50 border-slate-600 text-slate-100 hover:bg-slate-700",
          !selected.length && "text-slate-400"
        )}
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {selectedOptions.length} selected
            </Badge>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg">
          {/* Select All / Deselect All buttons */}
          <div className="flex border-b border-slate-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="flex-1 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            >
              Deselect All
            </Button>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm text-slate-100 hover:bg-slate-700",
                  selected.includes(option.value) && "bg-slate-700"
                )}
                onClick={() => handleToggle(option.value)}
              >
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-slate-600",
                    selected.includes(option.value) && "bg-blue-600 border-blue-600"
                  )}>
                    {selected.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
