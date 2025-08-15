
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
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '').replace(',', '.')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
       if (!isFocused) {
            const numValue = field.value ? Number(field.value) : 0;
            setDisplayValue(formatValue(numValue));
       }
    }, [field.value, isFocused]);
    

    const handleFocus = () => {
        setIsFocused(true);
        const numValue = field.value ? Number(field.value) : 0;
        if (numValue === 0) {
             setDisplayValue('');
        } else {
            setDisplayValue(numValue.toString().replace('.', ','));
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
        const sanitizedValue = rawValue.replace(/[^0-9,]/g, '').replace(',', '.');
        
        // Prevent multiple commas/dots
        if (sanitizedValue.split('.').length > 2) return;
        
        setDisplayValue(sanitizedValue.replace('.', ','));
        onValueChange(parseValue(sanitizedValue));
    };
    
    const showFictiveZero = !isFocused && (field.value === 0 || field.value === '' || field.value === undefined);

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text"
          className={cn('text-end font-mono', className, { 'text-muted-foreground': showFictiveZero })}
          value={isFocused ? displayValue.replace('.', ',') : (showFictiveZero ? formatValue(0) : displayValue) }
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
