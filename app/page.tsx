import InventoryApp from '@/components/InventoryApp';
import { getInventory } from '@/lib/inventory-repository';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { items, purchases, sales } = await getInventory();

  return (
    <InventoryApp
      initialItems={items}
      initialPurchases={purchases}
      initialSales={sales}
    />
  );
}
