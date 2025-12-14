
'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

function formatNumber(value: number): string {
    if (!value || isNaN(value)) {
        return '';
    }
    return new Intl.NumberFormat('fr-FR').format(value);
}

function parseInput(value: string): string {
  return value.replace(/\D/g, '');
}

interface CurrencyInputProps {
  field: ControllerRenderProps<FieldValues, any>;
  onValueChange: (value: number) => void;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ field, onValueChange, className }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = parseInput(e.target.value);
      const numberValue = cleanValue === '' ? 0 : Number(cleanValue);
      onValueChange(numberValue);
    };

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn(
            'text-end font-mono focus:placeholder:text-transparent',
            className
          )}
          value={formatNumber(field.value || 0)}
          onChange={handleChange}
          onBlur={field.onBlur}
          autoComplete="off"
          suppressHydrationWarning
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
