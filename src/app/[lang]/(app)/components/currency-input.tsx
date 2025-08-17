
'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, forwardRef, useEffect } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface CurrencyInputProps {
  field: ControllerRenderProps<FieldValues, any>;
  onValueChange: (value: number) => void;
  className?: string;
}

const formatValue = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) return '';
  const num = typeof value === 'string' ? parseFloat(value.toString().replace(/[^0-9.]/g, '')) : value;
  if (isNaN(num)) return '';
  // Utilise un espace comme séparateur de milliers et une virgule pour les décimales
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parseValue = (value: string): number => {
    // Gère à la fois les formats avec virgule et avec point pour la robustesse
    const parsed = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ field, onValueChange, className }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState<string | null>(null);

    const handleFocus = () => {
        setIsFocused(true);
        const numValue = field.value ? Number(field.value) : 0;
        setInputValue(numValue === 0 ? '' : String(numValue.toFixed(2)));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        const numValue = parseValue(e.target.value);
        onValueChange(numValue);
        setInputValue(null); // Clear local input state on blur
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numberValue = rawValue.replace(/[^0-9.,]/g, '');
        setInputValue(numberValue);
    };

    const displayValue = isFocused
      ? inputValue ?? ''
      : formatValue(field.value);

    // Condition to show placeholder-like zero
    const showFictiveZero = !isFocused && !field.value;


    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text" 
          className={cn('text-end font-mono', className, { 'text-muted-foreground': showFictiveZero && !isFocused })}
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
