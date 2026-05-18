import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Añadir índices a Member
schema = schema.replace(/@@map\("members"\)/, '@@map("members")\n  @@index([fullName])\n  @@index([phone])');

// 2. Añadir cascade a relations
const cascadeRelations = [
  { model: 'Membership', field: 'member', ref: 'memberId' },
  { model: 'Payment', field: 'member', ref: 'memberId' },
  { model: 'ClassBooking', field: 'member', ref: 'memberId' },
  { model: 'AppNotification', field: 'member', ref: 'memberId' },
  { model: 'Routine', field: 'member', ref: 'memberId' },
  { model: 'RoutineExercise', field: 'routine', ref: 'routineId' },
  { model: 'WorkoutLog', field: 'routine', ref: 'routineId' },
  { model: 'WorkoutExerciseLog', field: 'workoutLog', ref: 'workoutLogId' }
];

for (const { field, ref } of cascadeRelations) {
  const regex = new RegExp(`(${field}\\s+\\w+\\s+@relation\\(fields: \\[${ref}\\], references: \\[id\\])\\)`, 'g');
  schema = schema.replace(regex, '$1, onDelete: Cascade)');
}

// 3. Modificar WorkoutLog para añadir member y updatedAt
schema = schema.replace(
  /model WorkoutLog \{[\s\S]*?@@map\("workout_logs"\)\n\}/,
  (match) => {
    let newModel = match.replace(/routineId String\n/, 'routineId String\n  memberId  String\n');
    newModel = newModel.replace(/date      DateTime             @default\(now\(\)\)\n/, 'date      DateTime             @default(now())\n  updatedAt DateTime             @updatedAt\n');
    newModel = newModel.replace(/routine Routine @relation\(fields: \[routineId\], references: \[id\], onDelete: Cascade\)\n/, 'routine Routine @relation(fields: [routineId], references: [id], onDelete: Cascade)\n  member  Member  @relation(fields: [memberId], references: [id], onDelete: Cascade)\n');
    return newModel;
  }
);

// 4. Modificar WorkoutExerciseLog para añadir updatedAt
schema = schema.replace(
  /model WorkoutExerciseLog \{[\s\S]*?@@map\("workout_exercise_logs"\)\n\}/,
  (match) => {
    let newModel = match.replace(/repsDone          String\?\n/, 'repsDone          String?\n  updatedAt         DateTime        @updatedAt\n');
    return newModel;
  }
);

// 5. Modificar BodyMetric para añadir updatedAt
schema = schema.replace(
  /model BodyMetric \{[\s\S]*?@@map\("body_metrics"\)\n\}/,
  (match) => {
    let newModel = match.replace(/measuredAt    DateTime @default\(now\(\)\)\n/, 'measuredAt    DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n');
    return newModel;
  }
);


fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated successfully.');
