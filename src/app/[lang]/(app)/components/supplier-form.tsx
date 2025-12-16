
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTransition, forwardRef, useImperativeHandle, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { addSupplier, updateSupplier } from '../suppliers/actions';
import type { Supplier } from '@/lib/types';
import { CurrencyInput } from './currency-input';

// Client-side schema, completely independent of server-side dictionaries.
const clientSupplierFormSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
    wilaya: z.string().optional(),
    phone: z.string().optional(),
    nif: z.string().optional(),
    bank_info: z.string().optional(),
    solde_initial: z.coerce.number().default(0),
    notes: z.string().optional(),
});
type SupplierFormValues = z.infer<typeof clientSupplierFormSchema>;

interface SupplierFormProps {
  onClose: () => void;
  dictionary: any;
  supplierToEdit?: Supplier;
  addSupplierAction: typeof addSupplier;
  updateSupplierAction: typeof updateSupplier;
}

export const SupplierForm = forwardRef<SupplierFormRef, SupplierFormProps>(({ onClose, dictionary, supplierToEdit, addSupplierAction, updateSupplierAction }, ref) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const isEditMode = !!supplierToEdit;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(clientSupplierFormSchema),
    defaultValues: {
      name: '',
      wilaya: '',
      phone: '',
      nif: '',
      bank_info: '',
      solde_initial: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditMode && supplierToEdit) {
      form.reset(supplierToEdit);
    } else {
        form.reset({
            name: '',
            wilaya: '',
            phone: '',
            nif: '',
            bank_info: '',
            solde_initial: 0,
            notes: '',
        });
    }
  }, [supplierToEdit, isEditMode, form]);
  
  useImperativeHandle(ref, () => ({
    autoFill: () => {
        form.reset({
            name: 'Innovate SARL',
            wilaya: 'Sétif',
            phone: '0555-99-88-77',
            nif: '987654321098765',
            bank_info: 'BEA-00200082082210036974',
            solde_initial: 25000,
            notes: 'Fournisseur de solutions technologiques avancées et consulting.'
        });
    }
  }));

  function onSubmit(data: SupplierFormValues) {
    startTransition(async () => {
        const action = isEditMode
          ? updateSupplierAction(supplierToEdit!.id, data)
          : addSupplierAction(data);

        const result = await action;
        
        if (result.success) {
            toast({
              title: isEditMode ? dictionary.toast.updateSuccess.title : dictionary.toast.success.title,
              description: `${isEditMode ? dictionary.toast.updateSuccess.description : dictionary.toast.success.description} ${data.name}.`,
            });
            onClose();
        } else {
             toast({
              title: dictionary.toast.error.title,
              description: result.message || dictionary.toast.error.description,
              variant: "destructive",
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wilaya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.wilayaLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.wilayaPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.phoneLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.phonePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nifLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.nifPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
            control={form.control}
            name="bank_info"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{dictionary.bankInfoLabel}</FormLabel>
                <FormControl>
                <Input placeholder={dictionary.bankInfoPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="solde_initial"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{dictionary.initialBalanceLabel}</FormLabel>
                <FormControl>
                    <CurrencyInput field={field} onValueChange={(value) => form.setValue('solde_initial', value)} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.notesLabel}</FormLabel>
              <FormControl>
                <Textarea placeholder={dictionary.notesPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{dictionary.cancelButton}</Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? dictionary.savingButton : (isEditMode ? dictionary.saveChangesButton : dictionary.saveButton)}
            </Button>
        </div>
      </form>
    </Form>
  );
});

SupplierForm.displayName = 'SupplierForm';

export type SupplierFormRef = {
    autoFill: () => void;
};
