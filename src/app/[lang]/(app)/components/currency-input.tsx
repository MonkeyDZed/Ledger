'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { forwardRef, useState, useEffect } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface CurrencyInputProps {
  field: ControllerRenderProps<FieldValues, any>;
  onValueChange: (value: number) => void;
  className?: string;
}

// Nettoie l'input pour ne garder que les chiffres
function parseInput(value: string): string {
  return value.replace(/[^\d]/g, '');
}

// Formate le nombre avec un espace comme séparateur de milliers
function formatNumber(value: number): string {
  // Si la valeur est 0, on retourne une chaîne vide pour un champ "vide"
  if (value === 0) {
    return '';
  }
  return new Intl.NumberFormat('fr-FR').format(value);
}


export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ field, onValueChange, className }, ref) => {
    
    // `displayValue` est ce que l'utilisateur voit (ex: "1 250 000")
    // Il est synchronisé avec la valeur du formulaire
    const [displayValue, setDisplayValue] = useState(formatNumber(field.value || 0));

    // Synchroniser avec les changements externes du formulaire (ex: reset, autofill)
    useEffect(() => {
        const numberValue = typeof field.value === 'number' ? field.value : 0;
        setDisplayValue(formatNumber(numberValue));
    }, [field.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = parseInput(e.target.value);
      const numberValue = cleanValue === '' ? 0 : Number(cleanValue);

      // Met à jour la valeur numérique brute pour react-hook-form
      onValueChange(numberValue);
      
      // Met à jour la valeur formatée pour l'affichage
      setDisplayValue(formatNumber(numberValue));
    };

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn('text-end font-mono placeholder:text-transparent focus:placeholder:text-transparent', className)}
          value={displayValue}
          onChange={handleChange}
          onBlur={field.onBlur}
          autoComplete="off"
        />
        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">DZD</span>
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
