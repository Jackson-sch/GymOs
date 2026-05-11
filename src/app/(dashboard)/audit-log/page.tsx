import { getAuditLogsAction } from "@/lib/actions/audit-actions";
import { AuditLogClient } from "./AuditLogClient";

export const metadata = {
  title: "Auditoría de Sistema | GymOS",
  description: "Registro de acciones y cambios en el sistema.",
};

export default async function AuditLogPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const actionParam = typeof searchParams.action === 'string' ? searchParams.action : undefined;
  const entityParam = typeof searchParams.entity === 'string' ? searchParams.entity : undefined;

  const result = await getAuditLogsAction({ 
    limit: 100,
    action: actionParam,
    entity: entityParam
  });
  const logs = result.success ? result.data : [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif">Registro de Auditoría</h1>
        <p className="text-muted-foreground font-sans">
          Seguimiento de todas las acciones administrativas realizadas en el sistema.
        </p>
      </div>

      <AuditLogClient data={logs} />
    </div>
  );
}
