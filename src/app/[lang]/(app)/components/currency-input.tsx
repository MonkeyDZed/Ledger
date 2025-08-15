
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
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        // Met à jour l'affichage formaté si la valeur du formulaire change de l'extérieur
        const numValue = field.value ? Number(field.value) : 0;
        setDisplayValue(formatValue(numValue));
    }, [field.value]);
    

    const handleFocus = () => {
        setIsFocused(true);
        // Affiche la valeur brute (ex: 120000.50) sans formatage pour la modification
        const numValue = field.value ? Number(field.value) : 0;
        if (numValue === 0) {
             setDisplayValue('');
        } else {
            setDisplayValue(String(numValue));
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Parse la valeur brute et la met à jour dans le formulaire
        const numValue = parseValue(displayValue);
        onValueChange(numValue);
        // Met à jour l'affichage avec la valeur formatée
        setDisplayValue(formatValue(numValue));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Accepte uniquement les chiffres, le point et la virgule
        const numberValue = rawValue.replace(/[^0-9.,]/g, '');
        setDisplayValue(numberValue); // Affiche la saisie brute en temps réel
        
        const parsed = parseValue(numberValue);
        if (!isNaN(parsed)) {
            onValueChange(parsed); // Met à jour la valeur numérique du formulaire
        }
    };
    
    // Condition pour afficher le zéro fictif
    const showFictiveZero = !isFocused && !field.value;
    // Détermine la valeur à afficher : saisie brute si focus, sinon valeur formatée
    const finalDisplayValue = isFocused ? displayValue : (showFictiveZero ? formatValue(0) : formatValue(field.value));

    return (
      <div className="relative">
        <Input
          {...field}
          ref={ref}
          type={isFocused ? 'text' : 'text'} // On utilise toujours text pour afficher le format
          className={cn('text-end font-mono', className, { 'text-muted-foreground': showFictiveZero && !isFocused })}
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
