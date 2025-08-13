
import { getSuppliers, getPieces } from '@/lib/db';
import { DashboardClientPage } from './components/dashboard-client-page';


export default async function DashboardPage() {
  const suppliers = await getSuppliers();
  const pieces = await getPieces();

  return <DashboardClientPage suppliers={suppliers} pieces={pieces} />;
}
