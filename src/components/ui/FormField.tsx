import React, { forwardRef, useId } from 'react';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      prefix,
      suffix,
      id,
      className = '',
      disabled,
      ...props
    }: FormFieldProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </span>
        </label>

        <div
          className={`relative flex items-center rounded-md border bg-bg transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:border-accent ${
            error
              ? 'border-danger focus-within:ring-danger focus-within:border-danger'
              : 'border-border-input'
          } ${disabled ? 'bg-surface-alt opacity-60 pointer-events-none' : ''}`}
        >
          {prefix && (
            <div className="pl-3 pr-1 text-text-muted select-none flex items-center">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`w-full h-10 px-3 bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          {suffix && (
            <div className="pr-3 pl-1 text-text-muted select-none flex items-center">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-danger font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
