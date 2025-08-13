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
import type { Dictionary } from '@/lib/dictionaries';

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
  defaultValues?: Partial<PieceFormValues>;
  dictionary: Dictionary['supplierDetailPage']['form']
}

export function PieceForm({ supplierId, onClose, defaultValues, dictionary }: PieceFormProps) {
  const { toast } = useToast();
  const form = useForm<PieceFormValues>({
    resolver: zodResolver(pieceFormSchema),
    defaultValues: defaultValues || {
        date: new Date(),
        type: 'FACTURE',
        total_piece: 0,
        montant_paye: 0
    },
  });

  function onSubmit(data: PieceFormValues) {
    const reste = data.total_piece - data.montant_paye;
    console.log({ ...data, supplierId, reste });
    toast({
      title: dictionary.toast.success.title,
      description: dictionary.toast.success.description,
    });
    onClose();
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
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: fr})
                            ) : (
                                <span>{dictionary.datePlaceholder}</span>
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
                    <FormLabel>{dictionary.typeLabel}</FormLabel>
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
                            <FormLabel className="font-normal">{dictionary.typeInvoice}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
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
            <Button type="submit">{dictionary.saveButton}</Button>
        </div>
      </form>
    </Form>
  );
}
