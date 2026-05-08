import { getTrainers } from "@/lib/actions/trainers-actions";
import { TrainersClient } from "./TrainersClient";

export default async function TrainersPage() {
  const trainers = await getTrainers();
  
  return <TrainersClient data={trainers} />;
}