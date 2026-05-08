import { getTrainerById } from "@/lib/actions/trainers-actions";
import { TrainerProfileClient } from "./TrainerProfileClient";

export default async function TrainerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainer = await getTrainerById(id);
  
  if (!trainer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Entrenador no encontrado</h1>
          <p className="text-muted-foreground mt-2">El entrenador que buscas no existe</p>
        </div>
      </div>
    );
  }
  
  return <TrainerProfileClient trainer={trainer} />;
}