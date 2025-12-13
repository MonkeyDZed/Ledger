
'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface CurrencyInputProps {
  field: ControllerRenderProps<FieldValues, any>;
  onValueChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

const parseLocaleNumber = (stringNumber: string, locale: string = 'fr-FR'): number => {
    const thousandSeparator = Intl.NumberFormat(locale).format(11111).replace(/1/g, '');
    const decimalSeparator = Intl.NumberFormat(locale).format(1.1).replace(/1/g, '');

    const parsed = parseFloat(
        stringNumber
            .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
            .replace(new RegExp('\\' + decimalSeparator), '.')
    );

    return isNaN(parsed) ? 0 : parsed;
};


export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ field, onValueChange, className, placeholder = "0,00" }, ref) => {
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const numValue = parseLocaleNumber(e.target.value);
      onValueChange(numValue);
      field.onBlur(); // Important pour la validation de react-hook-form
    };

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="number"
          step="0.01"
          className={cn('text-end font-mono', className)}
          onBlur={handleBlur}
          placeholder={placeholder}
          // La valeur est directement celle du formulaire (un nombre)
          value={field.value === undefined || field.value === null ? '' : field.value}
          onChange={(e) => {
             // Permet la saisie directe, la validation se fait au "onBlur"
             const value = e.target.value === '' ? null : e.target.valueAsNumber;
             field.onChange(value);
          }}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
