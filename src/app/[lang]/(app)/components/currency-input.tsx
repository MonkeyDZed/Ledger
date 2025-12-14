
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
  ({ field, onValueChange, className, placeholder: initialPlaceholder = "0,00" }, ref) => {
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Allow empty string to be treated as 0
      const valueToParse = e.target.value === '' ? '0' : e.target.value;
      const numValue = parseLocaleNumber(valueToParse);
      onValueChange(numValue);
      field.onBlur(); // Important for react-hook-form validation
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Allow decimal and comma, filter out other non-numeric characters except for a leading minus
        const sanitizedValue = rawValue.replace(/[^0-9,.-]/g, '');
        
        // Directly update the form state with the string value for immediate feedback
        field.onChange(sanitizedValue);
    }

    const valueToDisplay = (value: any) => {
        if (value === null || value === undefined || value === '') return '';
        // Format to a string with a dot, then replace with a comma for display
        return String(value).replace('.', ',');
    }

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn('text-end font-mono placeholder:text-muted-foreground focus:placeholder:text-transparent', className)}
          onBlur={handleBlur}
          placeholder={initialPlaceholder}
          value={valueToDisplay(field.value)}
          onChange={handleChange}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
