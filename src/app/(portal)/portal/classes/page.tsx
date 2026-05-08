import { getPortalClassesAction } from "@/lib/actions/portal-actions";
import { ClassesClient } from "./ClassesClient";

export default async function ClassesPage() {
  const result = await getPortalClassesAction();
  
  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return <ClassesClient initialData={result.data} />;
}
