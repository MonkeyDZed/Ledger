
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTransition, forwardRef, useImperativeHandle } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addSupplier } from '../actions';

const supplierFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  wilaya: z.string().optional(),
  phone: z.string().optional(),
  nif: z.string().optional(),
  bank_info: z.string().optional(),
  solde_initial: z.coerce.number().default(0),
  notes: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  onClose: () => void;
  defaultValues?: Partial<SupplierFormValues>;
}

export type SupplierFormRef = {
    autoFill: () => void;
};

export const SupplierForm = forwardRef<SupplierFormRef, SupplierFormProps>(({ onClose, defaultValues }, ref) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: defaultValues || {
      name: '',
      wilaya: '',
      phone: '',
      nif: '',
      bank_info: '',
      solde_initial: 0,
      notes: '',
    },
  });

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
        const result = await addSupplier(data);
        if (result.success) {
            toast({
              title: 'Fournisseur enregistré',
              description: `Le fournisseur ${data.name} a été ajouté avec succès.`,
            });
            onClose();
        } else {
             toast({
              title: 'Erreur',
              description: result.message || "Une erreur est survenue.",
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
                  <FormLabel>Nom du Fournisseur</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tech Solutions Inc." {...field} />
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
                  <FormLabel>Wilaya</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alger" {...field} />
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
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 0555-123-456" {...field} />
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
                  <FormLabel>NIF</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro d'Identification Fiscale" {...field} />
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
                <FormLabel>Informations Bancaires</FormLabel>
                <FormControl>
                <Input placeholder="RIB ou autre" {...field} />
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
                <FormLabel>Solde Initial (DZD)</FormLabel>
                <FormControl>
                <Input type="number" {...field} />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Ajouter des notes sur le fournisseur..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
        </div>
      </form>
    </Form>
  );
});

SupplierForm.displayName = 'SupplierForm';
