import { getMemberRoutinesAction, getTodayCompletionsAction } from "@/lib/actions/routine-actions";
import { RoutinesClient } from "./RoutinesClient";

export default async function RoutinesPage() {
  const [routinesResult, completionsResult] = await Promise.all([
    getMemberRoutinesAction(),
    getTodayCompletionsAction()
  ]);
  
  return (
    <RoutinesClient 
      initialData={routinesResult.success && routinesResult.data ? routinesResult.data : []} 
      todayCompletions={completionsResult.success && completionsResult.data ? completionsResult.data : []}
    />
  );
}
