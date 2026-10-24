import React, { forwardRef, useState, useEffect } from 'react';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number; // Cents or Baht
  asCents?: boolean; // if true, internal value is integer cents (e.g. 10000 = 100.00 THB)
  onChangeValue?: (value: number) => void;
  currencyPrefix?: string;
  label?: string;
  error?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value = 0,
      asCents = false,
      onChangeValue,
      currencyPrefix = '฿',
      label,
      error,
      disabled,
      className = '',
      ...props
    }: CurrencyInputProps,
    ref: React.Ref<HTMLInputElement>
  ) => {
    const rawNumber = asCents ? value / 100 : value;
    const [displayString, setDisplayString] = useState<string>(
      rawNumber ? rawNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
    );
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayString(
          rawNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
      }
    }, [value, isFocused, rawNumber]);

    const handleFocus = () => {
      setIsFocused(true);
      setDisplayString(rawNumber === 0 ? '' : rawNumber.toString());
    };

    const handleBlur = () => {
      setIsFocused(false);
      const parsed = parseFloat(displayString.replace(/,/g, ''));
      const validNumber = isNaN(parsed) ? 0 : parsed;
      if (onChangeValue) {
        onChangeValue(asCents ? Math.round(validNumber * 100) : validNumber);
      }
      setDisplayString(
        validNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Allow only digits and at most one decimal point
      if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
        setDisplayString(val);
        const parsed = parseFloat(val);
        if (!isNaN(parsed) && onChangeValue) {
          onChangeValue(asCents ? Math.round(parsed * 100) : parsed);
        }
      }
    };

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs font-medium text-text">{label}</label>}
        <div
          className={`flex items-center rounded-md border bg-bg px-3 h-10 transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:border-accent ${
            error ? 'border-danger focus-within:ring-danger' : 'border-border-input'
          } ${disabled ? 'bg-surface-alt opacity-60' : ''}`}
        >
          <span className="text-text-muted text-sm font-medium mr-2 select-none" aria-hidden="true">
            {currencyPrefix}
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={displayString}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={`w-full bg-transparent text-sm text-text font-mono tabular-nums text-right focus:outline-none ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
