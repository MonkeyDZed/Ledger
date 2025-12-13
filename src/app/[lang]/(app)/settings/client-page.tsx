
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { clearDatabaseAction } from './actions';

interface ClientPageProps {
    dictionary: any;
    clearDatabaseAction: typeof clearDatabaseAction;
}

export const ClientPage: React.FC<ClientPageProps> = ({ dictionary, clearDatabaseAction }) => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { toast } = useToast();

    const handleClearDatabase = async () => {
        try {
            await clearDatabaseAction();
            toast({
                title: dictionary.dangerZone.toast.success.title,
                description: dictionary.dangerZone.toast.success.description,
            });
            // Optional: force a reload to reflect the empty state
            window.location.reload();
        } catch (error) {
             toast({
                title: dictionary.dangerZone.toast.error.title,
                description: dictionary.dangerZone.toast.error.description,
                variant: 'destructive',
            });
        } finally {
            setIsAlertOpen(false);
        }
    };

    return (
        <>
            <PageHeader
                title={dictionary.title}
                description={dictionary.description}
            />

            <div className="space-y-8">
                <Card className="border-destructive/50">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                            <CardTitle className="text-destructive">{dictionary.dangerZone.title}</CardTitle>
                        </div>
                        <CardDescription>{dictionary.dangerZone.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{dictionary.dangerZone.content}</p>
                    </CardContent>
                    <CardFooter className="bg-destructive/5 p-4 justify-between items-center rounded-b-xl">
                        <p className="text-sm font-medium">{dictionary.dangerZone.confirmation}</p>
                        <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
                            <Trash2 className="me-2 h-4 w-4" />
                            {dictionary.dangerZone.button}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dictionary.dangerZone.dialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                           {dictionary.dangerZone.dialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{dictionary.dangerZone.dialog.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClearDatabase}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {dictionary.dangerZone.dialog.confirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
