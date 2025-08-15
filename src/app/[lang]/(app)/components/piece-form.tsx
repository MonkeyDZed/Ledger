
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Banknote, Landmark, Hand, FileText } from 'lucide-react';
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
import { useTransition, useEffect, useState } from 'react';
import { addPiece, updatePiece } from '../suppliers/[id]/actions';
import { useParams } from 'next/navigation';
import type { Piece } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Client-side schema without server-side dependencies
const baseSchema = z.object({
    date: z.date({ required_error: "La date est requise." }),
    type: z.enum(['BL', 'FACTURE', 'VERSEMENT'], { required_error: "Le type est requis." }),
    total_piece: z.coerce.number().min(0, { message: "Le total doit être positif." }),
    montant_paye: z.coerce.number().min(0, { message: "Le montant payé doit être positif." }),
    description: z.string().optional(),
    payment_method: z.enum(['espece', 'cheque', 'virement', 'traite']).optional(),
});
const pieceFormSchema = baseSchema.refine((data) => {
    if (data.type === 'VERSEMENT') return true;
    return data.montant_paye <= data.total_piece;
}, {
    message: "Le montant payé ne peut pas dépasser le total de la pièce.",
    path: ["montant_paye"],
});
type PieceFormValues = z.infer<typeof pieceFormSchema>;


interface PieceFormProps {
  supplierId: string;
  onClose: () => void;
  pieceToEdit?: Piece;
  dictionary: any;
  formType?: 'VERSEMENT' | 'PIECE';
}

export function PieceForm({ supplierId, onClose, pieceToEdit, dictionary, formType = 'PIECE' }: PieceFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const lang = params.lang as 'fr' | 'ar';
  
  const isEditMode = !!pieceToEdit;

  const defaultType = formType === 'VERSEMENT' ? 'VERSEMENT' : (isEditMode ? pieceToEdit.type : 'FACTURE');

  const form = useForm<PieceFormValues>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: isEditMode && pieceToEdit ? {
        ...pieceToEdit,
        date: new Date(pieceToEdit.date),
        description: pieceToEdit.description ?? '',
    } : {
        date: new Date(),
        type: defaultType,
        total_piece: 0,
        montant_paye: 0,
        description: ''
    },
  });

  const [currentType, setCurrentType] = useState(form.getValues('type'));
  
  useEffect(() => {
    if (isEditMode && pieceToEdit) {
      form.reset({
        ...pieceToEdit,
        date: new Date(pieceToEdit.date),
        description: pieceToEdit.description ?? '',
      });
      setCurrentType(pieceToEdit.type);
    } else {
        form.reset({
            date: new Date(),
            type: defaultType,
            total_piece: 0,
            montant_paye: 0,
            description: '',
        });
        setCurrentType(defaultType);
    }
  }, [pieceToEdit, isEditMode, form, defaultType]);


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
  
  const handleTypeChange = (value: 'FACTURE' | 'BL' | 'VERSEMENT') => {
    form.setValue('type', value);
    setCurrentType(value);
    if (value === 'VERSEMENT') {
        form.setValue('total_piece', 0, { shouldValidate: true });
    }
  }

  const isVersement = currentType === 'VERSEMENT';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{isVersement ? dictionary.paymentDateLabel : dictionary.dateLabel}</FormLabel>
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
                        onValueChange={(v) => handleTypeChange(v as any)}
                        value={field.value}
                        className="flex items-center space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                            <RadioGroupItem value="FACTURE" id="type_facture" disabled={isEditMode && isVersement} />
                            </FormControl>
                            <FormLabel htmlFor="type_facture" className="font-normal">{dictionary.typeInvoice}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                            <RadioGroupItem value="BL" id="type_bl" disabled={isEditMode && isVersement} />
                            </FormControl>
                            <FormLabel htmlFor="type_bl" className="font-normal">{dictionary.typeBl}</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                            <FormControl>
                            <RadioGroupItem value="VERSEMENT" id="type_versement" disabled={isEditMode && !isVersement} />
                            </FormControl>
                            <FormLabel htmlFor="type_versement" className="font-normal">{dictionary.typeVersement}</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            {!isVersement && <FormField
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
            />}

             <FormField
              control={form.control}
              name="montant_paye"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isVersement ? dictionary.amountPaidLabel : dictionary.paidLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {isVersement && <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{dictionary.paymentMethodLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={dictionary.paymentMethodPlaceholder} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="espece"><div className="flex items-center gap-2"><Hand />{dictionary.paymentMethods.cash}</div></SelectItem>
                            <SelectItem value="cheque"><div className="flex items-center gap-2"><FileText />{dictionary.paymentMethods.check}</div></SelectItem>
                            <SelectItem value="virement"><div className="flex items-center gap-2"><Landmark/>{dictionary.paymentMethods.transfer}</div></SelectItem>
                            <SelectItem value="traite"><div className="flex items-center gap-2"><Banknote/>{dictionary.paymentMethods.draft}</div></SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />}

        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isVersement ? dictionary.paymentReasonLabel : dictionary.descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder={isVersement ? dictionary.paymentReasonPlaceholder : dictionary.descriptionPlaceholder} {...field} />
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
