import { 
  getExercisesAction, 
  getAllAssignedRoutinesAction,
  getMembersForRoutineAction,
  getTrainersForRoutineAction
} from "@/lib/actions/routine-management-actions";
import { RoutinesClient } from "./RoutinesClient";

export default async function RoutinesAdminPage() {
  const [exercisesRes, routinesRes, membersRes, trainersRes] = await Promise.all([
    getExercisesAction(),
    getAllAssignedRoutinesAction(),
    getMembersForRoutineAction(),
    getTrainersForRoutineAction()
  ]);

  return (
    <div className="container mx-auto py-8">
      <RoutinesClient 
        initialExercises={exercisesRes.success && exercisesRes.data ? exercisesRes.data : []}
        initialRoutines={routinesRes.success && routinesRes.data ? routinesRes.data : []}
        members={membersRes.success && membersRes.data ? membersRes.data : []}
        trainers={trainersRes.success && trainersRes.data ? trainersRes.data : []}
      />
    </div>
  );
}
