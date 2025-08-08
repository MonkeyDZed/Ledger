import { BriefcaseBusiness } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
       <BriefcaseBusiness className="h-7 w-7" />
       <span>LedgerSync</span>
       <Badge variant="outline" className="text-xs font-mono">Local</Badge>
    </div>
  );
}
