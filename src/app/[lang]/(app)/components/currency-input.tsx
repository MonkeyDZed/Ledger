
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

interface CurrencyInputProps<TFieldValues extends FieldValues = FieldValues> {
  field: ControllerRenderProps<TFieldValues, any>;
  onValueChange: (value: number) => void;
  className?: string;
}

const CurrencyInputInternal = forwardRef(
  <TFieldValues extends FieldValues = FieldValues>(
    { field, onValueChange, className }: CurrencyInputProps<TFieldValues>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    
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

// Type cast to support generic TFieldValues while maintaining React.forwardRef compatibility
export const CurrencyInput = CurrencyInputInternal as <TFieldValues extends FieldValues = FieldValues>(
  props: CurrencyInputProps<TFieldValues> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement;
