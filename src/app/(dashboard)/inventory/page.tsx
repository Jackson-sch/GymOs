import { getEquipmentAction, getEquipmentKPIs } from "@/lib/actions/inventory-actions";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const [result, kpis] = await Promise.all([
    getEquipmentAction(),
    getEquipmentKPIs()
  ]);
  
  const equipment = result.success ? (result.data as any[]) : [];

  return (
    <div className="animate-in fade-in duration-700">
      <InventoryClient data={equipment} kpis={kpis} />
    </div>
  );
}
