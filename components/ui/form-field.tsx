"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function FormField({
  label,
  help,
  error,
  type = "text",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  error?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const password = type === "password";
  const descriptionId = error ? `${id}-error` : help ? `${id}-help` : undefined;

  return (
    <label className={cn("form-field", error && "form-field--error")} htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="field-control">
        <input
          {...props}
          id={id}
          type={password && revealed ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
        />
        {password ? (
          <button type="button" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide password" : "Show password"}>
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        ) : null}
      </span>
      {error ? <span className="field-error" id={`${id}-error`}>{error}</span> : null}
      {!error && help ? <span className="field-help" id={`${id}-help`}>{help}</span> : null}
    </label>
  );
}
