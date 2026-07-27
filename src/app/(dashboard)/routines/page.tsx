import {
  getExercisesAction,
  getAllAssignedRoutinesAction,
  getMembersForRoutineAction,
  getTrainersForRoutineAction,
  getRoutinesStatsAction,
} from "@/lib/actions/routine-management-actions";
import { RoutinesClient } from "./RoutinesClient";

export default async function RoutinesAdminPage() {
  const [exercisesRes, routinesRes, membersRes, trainersRes] =
    await Promise.all([
      getExercisesAction(),
      getAllAssignedRoutinesAction(),
      getMembersForRoutineAction(),
      getTrainersForRoutineAction(),
    ]);

  return (
    <RoutinesClient
      initialExercises={
        exercisesRes.success && exercisesRes.data ? exercisesRes.data : []
      }
      initialRoutines={
        routinesRes.success && routinesRes.data ? routinesRes.data : []
      }
      members={membersRes.success && membersRes.data ? membersRes.data : []}
      trainers={
        trainersRes.success && trainersRes.data ? trainersRes.data : []
      }
    />
  );
}
