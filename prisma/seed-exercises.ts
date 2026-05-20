import "dotenv/config";
import { prisma } from "./index";

async function main() {
  console.log("🌱 Iniciando la siembra del Catálogo de Ejercicios...");

  const exercises = [
    // ─────────────────────────────────────────
    // PECHO (Chest)
    // ─────────────────────────────────────────
    {
      name: "Press de Banca con Barra",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Barra y Banco",
      demoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3ps",
    },
    {
      name: "Press Inclinado con Mancuernas",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Mancuernas y Banco",
      demoUrl: "https://www.youtube.com/watch?v=8iPty5_9rYg",
    },
    {
      name: "Aperturas con Mancuernas en Banco Plano",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Mancuernas y Banco",
      demoUrl: "https://www.youtube.com/watch?v=eGjt4lk6g34",
    },
    {
      name: "Cruces de Polea Alta",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Poleas",
      demoUrl: "https://www.youtube.com/watch?v=taI4HcLDtFY",
    },
    {
      name: "Fondos en Paralelas (Enfoque Pecho)",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Paralelas",
      demoUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As",
    },
    {
      name: "Flexiones de Pecho (Push-ups)",
      category: "STRENGTH",
      muscleGroup: "Pecho",
      equipment: "Peso Corporal",
      demoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    },

    // ─────────────────────────────────────────
    // ESPALDA (Back)
    // ─────────────────────────────────────────
    {
      name: "Dominadas Pronas (Pull-ups)",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Barra de Dominadas",
      demoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    },
    {
      name: "Jalón al Pecho en Polea",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Poleas",
      demoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    },
    {
      name: "Remo con Barra Olimpica",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Barra Olimpica",
      demoUrl: "https://www.youtube.com/watch?v=RQU8wLiHyBg",
    },
    {
      name: "Remo con Mancuerna a una Mano",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Mancuernas y Banco",
      demoUrl: "https://www.youtube.com/watch?v=dFzUjASaOMg",
    },
    {
      name: "Remo Gironda (Polea Baja con Agarre Estrecho)",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Poleas",
      demoUrl: "https://www.youtube.com/watch?v=GZbfZ033fM4",
    },
    {
      name: "Hiperextensiones Lumbares",
      category: "STRENGTH",
      muscleGroup: "Espalda",
      equipment: "Banco de Hiperextensión",
      demoUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw",
    },

    // ─────────────────────────────────────────
    // PIERNAS (Legs)
    // ─────────────────────────────────────────
    {
      name: "Sentadilla Trasera con Barra (Back Squat)",
      category: "STRENGTH",
      muscleGroup: "Cuádriceps",
      equipment: "Barra y Rack",
      demoUrl: "https://www.youtube.com/watch?v=ultWZbUMM8s",
    },
    {
      name: "Prensa Inclinada a 45 Grados",
      category: "STRENGTH",
      muscleGroup: "Cuádriceps",
      equipment: "Máquina de Prensa",
      demoUrl: "https://www.youtube.com/watch?v=IZxyjWwKGcM",
    },
    {
      name: "Extensión de Cuádriceps en Máquina",
      category: "STRENGTH",
      muscleGroup: "Cuádriceps",
      equipment: "Máquina de Extensiones",
      demoUrl: "https://www.youtube.com/watch?v=YyvSfV9dBGo",
    },
    {
      name: "Peso Muerto Rumano con Mancuernas",
      category: "STRENGTH",
      muscleGroup: "Femorales",
      equipment: "Mancuernas",
      demoUrl: "https://www.youtube.com/watch?v=JCXUYuzw0fU",
    },
    {
      name: "Curl Femoral Acostado (Leg Curl)",
      category: "STRENGTH",
      muscleGroup: "Femorales",
      equipment: "Máquina Curl Femoral",
      demoUrl: "https://www.youtube.com/watch?v=F488kZ558fM",
    },
    {
      name: "Zancadas Búlgaras con Mancuernas",
      category: "STRENGTH",
      muscleGroup: "Glúteos y Piernas",
      equipment: "Mancuernas y Banco",
      demoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
    },
    {
      name: "Hip Thrust con Barra",
      category: "STRENGTH",
      muscleGroup: "Glúteos",
      equipment: "Barra y Banco",
      demoUrl: "https://www.youtube.com/watch?v=LM8XHLYJoYs",
    },
    {
      name: "Elevación de Talones de Pie (Pantorrillas)",
      category: "STRENGTH",
      muscleGroup: "Pantorrillas",
      equipment: "Máquina o Barra",
      demoUrl: "https://www.youtube.com/watch?v=YMmgq9m1w3U",
    },

    // ─────────────────────────────────────────
    // HOMBROS (Shoulders)
    // ─────────────────────────────────────────
    {
      name: "Press Militar con Barra",
      category: "STRENGTH",
      muscleGroup: "Hombros",
      equipment: "Barra Olimpica",
      demoUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    },
    {
      name: "Press de Hombros Sentado con Mancuernas",
      category: "STRENGTH",
      muscleGroup: "Hombros",
      equipment: "Mancuernas y Banco",
      demoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    },
    {
      name: "Elevaciones Laterales con Mancuernas",
      category: "STRENGTH",
      muscleGroup: "Hombros",
      equipment: "Mancuernas",
      demoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    },
    {
      name: "Pájaros con Mancuernas (Hombro Posterior)",
      category: "STRENGTH",
      muscleGroup: "Hombros",
      equipment: "Mancuernas",
      demoUrl: "https://www.youtube.com/watch?v=nlZ1K31yC4A",
    },
    {
      name: "Remo al Mentón con Barra Z",
      category: "STRENGTH",
      muscleGroup: "Hombros",
      equipment: "Barra Z",
      demoUrl: "https://www.youtube.com/watch?v=4T1sQW4H7sI",
    },

    // ─────────────────────────────────────────
    // BRAZOS (Biceps & Triceps)
    // ─────────────────────────────────────────
    {
      name: "Curl de Bíceps con Barra Z",
      category: "STRENGTH",
      muscleGroup: "Bíceps",
      equipment: "Barra Z",
      demoUrl: "https://www.youtube.com/watch?v=i1YgFZB6alI",
    },
    {
      name: "Curl Alterno con Mancuernas (Supinado)",
      category: "STRENGTH",
      muscleGroup: "Bíceps",
      equipment: "Mancuernas",
      demoUrl: "https://www.youtube.com/watch?v=sAq_oLXwDSQ",
    },
    {
      name: "Curl de Bíceps Martillo",
      category: "STRENGTH",
      muscleGroup: "Bíceps",
      equipment: "Mancuernas",
      demoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4",
    },
    {
      name: "Curl Predicador en Banco Scott",
      category: "STRENGTH",
      muscleGroup: "Bíceps",
      equipment: "Banco Scott y Barra Z",
      demoUrl: "https://www.youtube.com/watch?v=py7Z4QzYQZg",
    },
    {
      name: "Rompecráneos (Skull Crushers)",
      category: "STRENGTH",
      muscleGroup: "Tríceps",
      equipment: "Barra Z y Banco Plano",
      demoUrl: "https://www.youtube.com/watch?v=d_KZxkY_0cM",
    },
    {
      name: "Extensión de Tríceps en Polea Alta (Cuerda)",
      category: "STRENGTH",
      muscleGroup: "Tríceps",
      equipment: "Poleas",
      demoUrl: "https://www.youtube.com/watch?v=-vHAIS3p7Z8",
    },
    {
      name: "Copa de Tríceps Sentado con Mancuerna",
      category: "STRENGTH",
      muscleGroup: "Tríceps",
      equipment: "Mancuerna",
      demoUrl: "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
    },

    // ─────────────────────────────────────────
    // CORE (Zona Media)
    // ─────────────────────────────────────────
    {
      name: "Crunch Abdominal Clásico",
      category: "CORE",
      muscleGroup: "Core",
      equipment: "Colchoneta",
      demoUrl: "https://www.youtube.com/watch?v=MKmrqcoCZ-M",
    },
    {
      name: "Elevación de Piernas Suspendido en Barra",
      category: "CORE",
      muscleGroup: "Core",
      equipment: "Barra de Dominadas",
      demoUrl: "https://www.youtube.com/watch?v=uX3B_A2wL9g",
    },
    {
      name: "Abdominales en Rueda (Rollouts)",
      category: "CORE",
      muscleGroup: "Core",
      equipment: "Rueda Abdominal",
      demoUrl: "https://www.youtube.com/watch?v=rqiDarhyMBs",
    },
    {
      name: "Plancha Abdominal Estática (Plank)",
      category: "CORE",
      muscleGroup: "Core",
      equipment: "Colchoneta",
      demoUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
    },
    {
      name: "Giros Rusos (Russian Twists)",
      category: "CORE",
      muscleGroup: "Core",
      equipment: "Colchoneta o Disco",
      demoUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI",
    },

    // ─────────────────────────────────────────
    // CARDIO Y HIIT
    // ─────────────────────────────────────────
    {
      name: "Burpees",
      category: "CARDIO",
      muscleGroup: "Cuerpo Completo",
      equipment: "Peso Corporal",
      demoUrl: "https://www.youtube.com/watch?v=qLBImZy7gto",
    },
    {
      name: "Jumping Jacks (Saltos de Tijera)",
      category: "CARDIO",
      muscleGroup: "Cuerpo Completo",
      equipment: "Peso Corporal",
      demoUrl: "https://www.youtube.com/watch?v=2W4ZNSyW-t8",
    },
    {
      name: "Saltos de Cuerda (Double Unders)",
      category: "CARDIO",
      muscleGroup: "Cuerpo Completo",
      equipment: "Cuerda de Saltar",
      demoUrl: "https://www.youtube.com/watch?v=u3zgHI8OdNQ",
    },
    {
      name: "Cinta de Correr (Intervalos HIIT)",
      category: "CARDIO",
      muscleGroup: "Piernas",
      equipment: "Treadmill",
      demoUrl: "https://www.youtube.com/watch?v=84_NlD3s_uY",
    },
    {
      name: "Bicicleta Estática (Spinning)",
      category: "CARDIO",
      muscleGroup: "Piernas",
      equipment: "Bicicleta",
      demoUrl: "https://www.youtube.com/watch?v=cM3uYq9F_90",
    },
    {
      name: "Remo en Máquina (Ergómetro)",
      category: "CARDIO",
      muscleGroup: "Cuerpo Completo",
      equipment: "Máquina de Remo",
      demoUrl: "https://www.youtube.com/watch?v=G8vL9fD9d6I",
    },

    // ─────────────────────────────────────────
    // FLEXIBILIDAD Y MOVILIDAD
    // ─────────────────────────────────────────
    {
      name: "Estiramiento de Cobra (Yoga)",
      category: "FLEXIBILITY",
      muscleGroup: "Core y Espalda",
      equipment: "Colchoneta",
      demoUrl: "https://www.youtube.com/watch?v=JDdJu7X9134",
    },
    {
      name: "Postura del Perro Mirando Abajo",
      category: "FLEXIBILITY",
      muscleGroup: "Cuerpo Completo",
      equipment: "Colchoneta",
      demoUrl: "https://www.youtube.com/watch?v=EC7RGJ975EA",
    },
    {
      name: "Movilidad de Cadera 90/90",
      category: "FLEXIBILITY",
      muscleGroup: "Cadera",
      equipment: "Colchoneta",
      demoUrl: "https://www.youtube.com/watch?v=nO3_eZ1e-C0",
    },
  ];

  console.log(`📦 Preparando para insertar ${exercises.length} ejercicios en la base de datos...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const ex of exercises) {
    const slug = ex.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/ /g, "_");

    const id = `ex_${slug}`;

    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id },
        data: {
          category: ex.category,
          equipment: ex.equipment,
          muscleGroup: ex.muscleGroup,
          demoUrl: ex.demoUrl,
        },
      });
      updatedCount++;
    } else {
      await prisma.exercise.create({
        data: {
          id,
          name: ex.name,
          category: ex.category,
          equipment: ex.equipment,
          muscleGroup: ex.muscleGroup,
          demoUrl: ex.demoUrl,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Catálogo de Ejercicios poblado correctamente.`);
  console.log(`✨ Ejercicios creados: ${createdCount}`);
  console.log(`🔄 Ejercicios actualizados: ${updatedCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en la siembra de ejercicios:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
