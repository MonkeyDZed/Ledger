
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
  const num = typeof value === 'string' ? parseFloat(value.toString().replace(/[^0-9,.]/g, '').replace(',', '.')) : value;
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
    const [localValue, setLocalValue] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    useEffect(() => {
        if(isMounted) {
            setLocalValue(formatValue(field.value));
        }
    }, [field.value, isMounted]);


    const handleFocus = () => {
        setIsFocused(true);
        // Au focus, on affiche la valeur numérique brute pour l'édition.
        setLocalValue(field.value ? String(field.value.toFixed(2)).replace('.', ',') : '');
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        const numValue = parseValue(e.target.value);
        onValueChange(numValue); // Mettre à jour le formulaire
        setLocalValue(formatValue(numValue));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
         // Permettre la saisie de nombres avec virgule ou point
        const numberValue = rawValue.replace(/[^0-9.,]/g, '');
        setLocalValue(numberValue);
    };

    // La valeur affichée est soit la valeur en cours de saisie, soit la valeur formatée au blur.
    const displayValue = isFocused ? localValue : formatValue(field.value);

    if (!isMounted) {
        // Rendu initial (serveur et premier rendu client)
        return (
            <Input
                {...field}
                ref={ref}
                type="text" 
                className={cn('text-end font-mono', className)}
                value={field.value ? Number(field.value).toFixed(2) : '0.00'}
                readOnly
            />
        );
    }
    
    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type="text" 
          className={cn('text-end font-mono', className)}
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="0,00"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
