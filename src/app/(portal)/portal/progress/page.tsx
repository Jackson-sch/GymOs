import { getPortalProgressAction } from "@/lib/actions/portal-actions";
import { ProgressClient } from "./ProgressClient";

export default async function ProgressPage() {
  const result = await getPortalProgressAction();
  
  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return <ProgressClient initialData={result.data} />;
}
