import { prisma } from "./index";

async function main() {
  console.log("🌱 Seeding Routines and Exercises...");

  // 1. Create default exercises
  const exercisesData = [
    { name: "Sentadilla Libre", category: "STRENGTH", muscleGroup: "Cuádriceps", equipment: "Barra Olimpica" },
    { name: "Press de Banca", category: "STRENGTH", muscleGroup: "Pecho", equipment: "Barra Olimpica" },
    { name: "Peso Muerto", category: "STRENGTH", muscleGroup: "Espalda/Isquios", equipment: "Barra Olimpica" },
    { name: "Press Militar", category: "STRENGTH", muscleGroup: "Hombros", equipment: "Mancuernas" },
    { name: "Remo con Barra", category: "STRENGTH", muscleGroup: "Espalda", equipment: "Barra Olimpica" },
    { name: "Curl de Bíceps", category: "STRENGTH", muscleGroup: "Bíceps", equipment: "Mancuernas" },
    { name: "Extensión de Tríceps", category: "STRENGTH", muscleGroup: "Tríceps", equipment: "Polea" },
    { name: "Zancadas", category: "STRENGTH", muscleGroup: "Piernas", equipment: "Mancuernas" },
    { name: "Plancha Abdominal", category: "CORE", muscleGroup: "Core", equipment: "Peso Corporal" },
  ];

  const exercises = [];
  for (const ex of exercisesData) {
    const created = await prisma.exercise.upsert({
      where: { id: `ex_${ex.name.toLowerCase().replace(/ /g, '_')}` },
      update: {},
      create: {
        id: `ex_${ex.name.toLowerCase().replace(/ /g, '_')}`,
        ...ex
      }
    });
    exercises.push(created);
  }

  // 2. Get all members with a userId
  const membersWithUser = await prisma.member.findMany({
    where: { NOT: { userId: null } }
  });

  const trainer = await prisma.trainer.findFirst();
  if (!trainer) {
    console.log("❌ No trainer found to assign routines. Run global seed first.");
    return;
  }

  console.log(`💪 Assigning routines to ${membersWithUser.length} members...`);

  for (const member of membersWithUser) {
    // Create a routine for each member
    const routine = await prisma.routine.create({
      data: {
        name: "Fuerza y Tonificación G1",
        description: "Plan de 5 días enfocado en hipertrofia y fuerza funcional.",
        memberId: member.id,
        trainerId: trainer.id,
        isActive: true,
      }
    });

    // Add exercises for Lunes, Miércoles, Viernes
    const days = ["Lunes", "Miércoles", "Viernes"];
    for (const day of days) {
      for (let i = 0; i < 4; i++) {
        const ex = exercises[Math.floor(Math.random() * exercises.length)];
        await prisma.routineExercise.create({
          data: {
            routineId: routine.id,
            exerciseId: ex.id,
            day,
            order: i,
            sets: 3 + Math.floor(Math.random() * 2),
            reps: "10-12",
            weight: `${10 + Math.floor(Math.random() * 40)}kg`,
            rest: "90s",
            notes: "Controlar el tempo 2-1-2"
          }
        });
      }
    }
  }

  console.log("✅ Routine seeding completed.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
