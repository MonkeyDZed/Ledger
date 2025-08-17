
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
    const [localValue, setLocalValue] = useState<string>(
        field.value ? String(field.value.toFixed(2)) : ''
    );
    
    // Synchroniser l'état local si la valeur du formulaire change de l'extérieur.
    useEffect(() => {
        const formValue = field.value ? String(Number(field.value).toFixed(2)) : '0.00';
        if (Number(formValue).toFixed(2) !== Number(parseValue(localValue)).toFixed(2)) {
             setLocalValue(formValue.replace('.',','));
        }
    }, [field.value]);


    const handleFocus = () => {
        setIsFocused(true);
        // Au focus, on affiche la valeur numérique brute pour l'édition.
        setLocalValue(field.value ? String(field.value.toFixed(2)).replace('.', ',') : '');
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        const numValue = parseValue(e.target.value);
        onValueChange(numValue); // Mettre à jour le formulaire
        // On ne met à jour l'affichage local qu'au blur pour éviter les re-render pendant la saisie
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

    // Pour éviter l'erreur d'hydratation, le rendu initial (serveur et client) doit être identique.
    // On n'affiche la valeur formatée que côté client et après le montage pour être sûr.
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
      setHasMounted(true);
    }, []);

    if (!hasMounted) {
      // Rendu initial (serveur et premier rendu client)
      return (
         <Input
            {...field}
            ref={ref}
            type="text" 
            className={cn('text-end font-mono', className)}
            value={field.value ? Number(field.value).toFixed(2) : ''}
            onChange={() => {}}
            onFocus={() => {}}
            onBlur={() => {}}
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
