import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-brand-soft bg-paper px-4 text-sm text-ink placeholder:text-ink-soft/70",
        "transition-colors focus:border-liderlar-blue focus:outline-none focus:ring-2 focus:ring-cyan/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-brand-soft bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70",
      "transition-colors focus:border-liderlar-blue focus:outline-none focus:ring-2 focus:ring-cyan/30",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-brand-soft bg-paper px-4 text-sm text-ink",
        "transition-colors focus:border-liderlar-blue focus:outline-none focus:ring-2 focus:ring-cyan/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function SearchInput({
  className,
  containerClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { containerClassName?: string }) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
      <input
        className={cn(
          "h-12 w-full rounded-full border border-brand-soft bg-paper pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft/70",
          "transition-colors focus:border-liderlar-blue focus:outline-none focus:ring-2 focus:ring-cyan/30",
          className
        )}
        {...props}
      />
    </div>
  );
}

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-5 w-5 rounded-sm border border-brand-soft text-liderlar-blue accent-liderlar-blue focus:ring-2 focus:ring-cyan/30",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";

export const Radio = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="radio"
      className={cn("h-5 w-5 border border-brand-soft text-liderlar-blue accent-liderlar-blue focus:ring-2 focus:ring-cyan/30", className)}
      {...props}
    />
  )
);
Radio.displayName = "Radio";

export function Switch({
  checked,
  onCheckedChange,
  className,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-200",
        checked ? "bg-gradient-blue" : "bg-navy/15",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
