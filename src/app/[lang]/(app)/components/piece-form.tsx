
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr, ar } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTransition, useEffect } from 'react';
import { addPiece, updatePiece } from '../suppliers/[id]/actions';
import { useParams } from 'next/navigation';
import type { Piece } from '@/lib/types';

type Locale = 'fr' | 'ar';

// Local type definition to avoid importing server-only modules
type PieceFormDictionary = {
    addTitle: string;
    addDescription: string;
    editTitle: string;
    editDescription: string;
    dateLabel: string;
    datePlaceholder: string;
    typeLabel: string;
    typeInvoice: string;
    typeBl: string;
    totalLabel: string;
    paidLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    cancelButton: string;
    saveButton: string;
    savingButton: string;
    saveChangesButton: string;
    savingChangesButton: string;
    toast: {
        success: { title: string; description: string };
        updateSuccess: { title: string; description: string };
        error: { title: string; description: string };
    };
};


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
  dictionary: PieceFormDictionary;
}

export function PieceForm({ supplierId, onClose, pieceToEdit, dictionary }: PieceFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const lang = params.lang as Locale;
  
  const isEditMode = !!pieceToEdit;

  const form = useForm<PieceFormValues>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: isEditMode && pieceToEdit ? {
        ...pieceToEdit,
        date: new Date(pieceToEdit.date),
    } : {
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
    }
  }, [pieceToEdit, isEditMode, form]);


  function onSubmit(data: PieceFormValues) {
    startTransition(async () => {
      const action = isEditMode
        ? updatePiece(pieceToEdit!.id, supplierId, data)
        : addPiece({ ...data, supplier_id: supplierId });
      
      const result = await action;

      if (result.success) {
        toast({
          title: isEditMode ? dictionary.toast.updateSuccess.title : dictionary.toast.success.title,
          description: isEditMode ? dictionary.toast.updateSuccess.description : dictionary.toast.success.description,
        });
        onClose();
      } else {
        toast({
          title: dictionary.toast.error.title,
          description: result.message || dictionary.toast.error.description,
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
                    <FormLabel>{dictionary.dateLabel}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "ps-3 text-start font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: lang === 'ar' ? ar : fr})
                            ) : (
                                <span>{dictionary.datePlaceholder}</span>
                            )}
                            <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
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
                    <FormLabel>{dictionary.typeLabel}</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                            <RadioGroupItem value="FACTURE" />
                            </FormControl>
                            <FormLabel className="font-normal">{dictionary.typeInvoice}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                            <RadioGroupItem value="BL" />
                            </FormControl>
                            <FormLabel className="font-normal">{dictionary.typeBl}</FormLabel>
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
                  <FormLabel>{dictionary.totalLabel}</FormLabel>
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
                  <FormLabel>{dictionary.paidLabel}</FormLabel>
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
              <FormLabel>{dictionary.descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder={dictionary.descriptionPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{dictionary.cancelButton}</Button>
            <Button type="submit" disabled={isPending}>{isPending ? (isEditMode ? dictionary.savingChangesButton : dictionary.savingButton) : (isEditMode ? dictionary.saveChangesButton : dictionary.saveButton)}</Button>
        </div>
      </form>
    </Form>
  );
}
