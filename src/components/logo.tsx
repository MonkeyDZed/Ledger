import { BriefcaseBusiness } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-foreground font-headline">
       <div className="bg-primary/20 p-2 rounded-lg">
         <BriefcaseBusiness className="h-5 w-5 text-primary" />
       </div>
       <span className="hidden sm:inline-block">AutoBook</span>
    </div>
  );
}
