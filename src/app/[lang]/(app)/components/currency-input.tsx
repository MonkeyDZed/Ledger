
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
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', ',');
};

const parseValue = (value: string): number => {
    const parsed = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ field, onValueChange, className }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const numValue = field.value ? Number(field.value) : 0;
        setDisplayValue(formatValue(numValue));
    }, [field.value]);
    

    const handleFocus = () => {
        setIsFocused(true);
        const numValue = field.value ? Number(field.value) : 0;
        if (numValue === 0) {
             setDisplayValue('');
        } else {
            setDisplayValue(numValue.toLocaleString('fr-FR').replace(/\s/g, ''));
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        const numValue = parseValue(displayValue);
        onValueChange(numValue);
        setDisplayValue(formatValue(numValue));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numberValue = rawValue.replace(/[^0-9,]/g, '');
        const parsed = parseValue(numberValue);
        
        if (!isNaN(parsed)) {
            onValueChange(parsed);
            // Format for display
            const parts = numberValue.split(',');
            const integerPart = parts[0].replace(/\s/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            const formatted = parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
            setDisplayValue(formatted);
        } else {
            setDisplayValue('');
            onValueChange(0);
        }
    };
    
    const showFictiveZero = !isFocused && !field.value;
    const finalDisplayValue = isFocused ? displayValue : (showFictiveZero ? formatValue(0) : formatValue(field.value));

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text"
          className={cn('text-end font-mono', className, { 'text-muted-foreground': showFictiveZero })}
          value={finalDisplayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
