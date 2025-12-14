'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

// Formate le nombre avec un espace comme séparateur de milliers
function formatNumber(value: number): string {
    if (value === 0 || isNaN(value)) {
        return '';
    }
    return new Intl.NumberFormat('fr-FR').format(value);
}

// Nettoie l'input pour ne garder que les chiffres
function parseInput(value: string): string {
  return value.replace(/[^\d]/g, '');
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
            'text-end font-mono',
            className
          )}
          value={formatNumber(field.value || 0)}
          onChange={handleChange}
          onBlur={field.onBlur}
          autoComplete="off"
          suppressHydrationWarning // Clé de la résolution
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';