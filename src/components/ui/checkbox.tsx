"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={cn(
              "peer h-4 w-4 shrink-0 rounded border border-border bg-card",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors cursor-pointer",
              // Hide default checkbox
              "appearance-none",
              // Checked state
              "checked:bg-primary checked:border-primary",
              className
            )}
            {...props}
          />
          <Check className="absolute left-0 top-0 h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none" />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-card-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
