import { getEquipmentAction } from "@/lib/actions/inventory-actions";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const result = await getEquipmentAction();
  const equipment = result.success ? (result.data as any[]) : [];

  return (
    <div className="animate-in fade-in duration-700">
      <InventoryClient data={equipment} />
    </div>
  );
}
