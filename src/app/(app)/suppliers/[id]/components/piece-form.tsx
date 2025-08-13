
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addPiece, updatePiece } from '../actions';
import { useTransition, useEffect } from 'react';
import type { Piece } from '@/lib/types';


const pieceFormSchema = z.object({
  date: z.date({ required_error: 'La date est requise.' }),
  type: z.enum(['BL', 'FACTURE'], { required_error: 'Le type est requis.' }),
  total_piece: z.coerce.number().min(0, { message: 'Le total doit être positif.' }),
  montant_paye: z.coerce.number().min(0, { message: 'Le montant payé doit être positif.' }),
  description: z.string().optional(),
}).refine(data => data.montant_paye <= data.total_piece, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});

type PieceFormValues = z.infer<typeof pieceFormSchema>;

interface PieceFormProps {
  supplierId: string;
  onClose: () => void;
  pieceToEdit?: Piece;
}

export function PieceForm({ supplierId, onClose, pieceToEdit }: PieceFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!pieceToEdit;

  const form = useForm<PieceFormValues>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: {
        date: new Date(),
        type: 'FACTURE',
        total_piece: 0,
        montant_paye: 0,
        description: ''
    },
  });

  useEffect(() => {
    if (isEditMode && pieceToEdit) {
      form.reset({
        ...pieceToEdit,
        date: new Date(pieceToEdit.date),
      });
    } else {
        form.reset({
            date: new Date(),
            type: 'FACTURE',
            total_piece: 0,
            montant_paye: 0,
            description: ''
        });
    }
  }, [pieceToEdit, isEditMode, form]);


  function onSubmit(data: PieceFormValues) {
    startTransition(async () => {
      const action = isEditMode
        ? updatePiece(pieceToEdit.id, supplierId, data)
        : addPiece({ ...data, supplier_id: supplierId });
      
      const result = await action;

      if (result.success) {
        toast({
          title: isEditMode ? 'Pièce mise à jour' : 'Pièce enregistrée',
          description: `La pièce a été ${isEditMode ? 'mise à jour' : 'ajoutée'} avec succès.`,
        });
        onClose();
      } else {
        toast({
          title: 'Erreur',
          description: result.message || "Une erreur est survenue.",
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Date de la pièce</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: fr})
                            ) : (
                                <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Type de pièce</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="FACTURE" />
                            </FormControl>
                            <FormLabel className="font-normal">Facture</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="BL" />
                            </FormControl>
                            <FormLabel className="font-normal">BL</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="total_piece"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Pièce (DZD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="montant_paye"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant Payé (DZD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description de la pièce..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Enregistrement..." : "Enregistrer la Pièce"}</Button>
        </div>
      </form>
    </Form>
  );
}
