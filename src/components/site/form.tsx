import { forwardRef, useState, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  hint,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <Input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "h-10 rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60",
      invalid && "border-destructive/60 focus-visible:ring-destructive/60",
      className,
    )}
    {...props}
  />
));
TextInput.displayName = "TextInput";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <Textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "rounded-lg bg-white/[0.03] border-white/10 focus-visible:ring-2 focus-visible:ring-brand/60 min-h-24",
      invalid && "border-destructive/60",
      className,
    )}
    {...props}
  />
));
TextArea.displayName = "TextArea";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-10 rounded-lg bg-white/[0.03] border-white/10 pr-10 focus-visible:ring-2 focus-visible:ring-brand/60",
          invalid && "border-destructive/60",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const checks = [
    { label: "12+ characters", ok: value.length >= 12 },
    { label: "Uppercase", ok: /[A-Z]/.test(value) },
    { label: "Lowercase", ok: /[a-z]/.test(value) },
    { label: "Number", ok: /[0-9]/.test(value) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const pct = (passed / checks.length) * 100;
  const tone = passed === 5 ? "bg-emerald-500" : passed >= 3 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="space-y-2">
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" aria-hidden>
        <div className={cn("h-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={cn(
              "text-[11px] flex items-center gap-1",
              c.ok ? "text-brand-light" : "text-muted-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", c.ok ? "bg-brand" : "bg-white/20")} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2"
    >
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand-light flex items-center gap-2"
    >
      {message}
    </div>
  );
}
