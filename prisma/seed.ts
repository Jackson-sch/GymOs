import { prisma } from "./index";
import { auth } from "../src/lib/auth";
import { Prisma } from "@prisma/client";

async function main() {
  console.log("🌱 Iniciando seeding masivo...");

  // 1. Configuración Inicial
  console.log("⚙️ Configurando sistema...");
  await prisma.systemConfig.upsert({
    where: { key: "GYM_NAME" },
    update: {},
    create: { key: "GYM_NAME", value: "GymOS - Elite Fitness", category: "GENERAL" },
  });
  await prisma.systemConfig.upsert({
    where: { key: "MAX_CAPACITY" },
    update: {},
    create: { key: "MAX_CAPACITY", value: "50", category: "GENERAL", description: "Capacidad máxima del local" },
  });

  // 2. Planes de Membresía
  console.log("📋 Creando planes...");
  const plansData = [
    { name: "Básico", price: 80, duration: 30, color: "oklch(50% 0.1 220)" },
    { name: "Estándar", price: 120, duration: 30, color: "oklch(60% 0.12 250)" },
    { name: "Premium", price: 180, duration: 30, color: "oklch(70% 0.15 280)" },
    { name: "Anual VIP", price: 1200, duration: 365, color: "oklch(80% 0.2 300)" },
  ];

  const plans = await Promise.all(
    plansData.map((p) =>
      prisma.plan.upsert({
        where: { name: p.name },
        update: { color: p.color, price: new Prisma.Decimal(p.price) },
        create: {
          name: p.name,
          description: `Acceso ${p.name}`,
          price: new Prisma.Decimal(p.price),
          durationDays: p.duration,
          color: p.color,
          isActive: true,
        },
      })
    )
  );

  // 3. Entrenadores
  console.log("💪 Creando entrenadores...");
  
  // Función auxiliar para crear entrenador y su usuario
  async function createTrainerWithUser(data: { fullName: string, email: string, phone: string, specialties: string[], dni: string }) {
    try {
      const userEmail = data.email;
      
      // Forzamos el recreado para asegurar que el DNI sea la contraseña
      const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
      if (existingUser) {
        console.log(`♻️ Recreando usuario para ${userEmail}...`);
        await prisma.user.delete({ where: { id: existingUser.id } });
      }

      await auth.api.signUpEmail({
        body: { 
          email: userEmail, 
          password: data.dni, // Usamos el DNI como contraseña
          name: data.fullName 
        }
      });
      
      const user = await prisma.user.findUnique({ where: { email: userEmail } });

      if (user) {
        // 2. Asegurar que el rol sea TRAINER
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "TRAINER" }
        });

        // 3. Crear el registro de Trainer vinculado
        return await prisma.trainer.upsert({
          where: { email: userEmail },
          update: { 
            userId: user.id,
            dni: data.dni 
          },
          create: { 
            fullName: data.fullName, 
            email: userEmail, 
            phone: data.phone, 
            specialties: data.specialties,
            userId: user.id,
            dni: data.dni
          },
        });
      }
    } catch (error) {
      console.error(`Error creando entrenador ${data.email}:`, error);
    }
  }

  const trainers = await Promise.all([
    createTrainerWithUser({ 
      fullName: "Carlos Rodriguez", 
      email: "carlos.fit@gymos.com", 
      phone: "999111222", 
      dni: "19086514",
      specialties: ["Crossfit", "HIIT"] 
    }),
    createTrainerWithUser({ 
      fullName: "Ana Martínez", 
      email: "ana.yoga@gymos.com", 
      phone: "999333444", 
      dni: "20212223",
      specialties: ["Yoga", "Pilates"] 
    }),
  ]);

  // 4. Miembros y Membresías
  console.log("👥 Creando 200 miembros con historial...");
  const firstNames = ["Juan", "Maria", "Pedro", "Lucia", "Carlos", "Elena", "Roberto", "Sofia", "Diego", "Paula", "Andres", "Camila", "Mateo", "Valentina", "Gabriel", "Isabella", "Lucas", "Mia", "Sebastian", "Victoria"];
  const lastNames = ["Perez", "Garcia", "Lopez", "Rodriguez", "Sanchez", "Martinez", "Gomez", "Fernandez", "Diaz", "Torres", "Vargas", "Castro", "Rios", "Morales", "Suarez", "Ortega", "Rojas", "Flores", "Soto", "Luna"];

  for (let i = 0; i < 200; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dni = (10000000 + i).toString();
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;

    const member = await prisma.member.upsert({
      where: { dni },
      update: {},
      create: {
        fullName: `${fn} ${ln}`,
        email,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        dni,
        status: Math.random() > 0.05 ? "ACTIVE" : "INACTIVE",
      },
    });

    // Crear una membresía activa para la mayoría
    if (member.status === "ACTIVE") {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      const membership = await prisma.membership.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          startDate,
          endDate,
          status: "ACTIVE",
          price: plan.price,
        },
      });

      // Crear algunos pagos históricos (últimos 6 meses)
      const monthsToPay = Math.floor(Math.random() * 6) + 1;
      for (let m = 0; m < monthsToPay; m++) {
        const payDate = new Date();
        payDate.setMonth(payDate.getMonth() - m);
        payDate.setDate(Math.floor(Math.random() * 28) + 1);
        await prisma.payment.create({
          data: {
            memberId: member.id,
            membershipId: membership.id,
            amount: plan.price,
            method: Math.random() > 0.5 ? "CASH" : "CARD",
            status: "COMPLETED",
            paidAt: payDate,
            createdAt: payDate,
          },
        });
      }

      // Asistencias (últimos 30 días)
      const attendancesCount = Math.floor(Math.random() * 20);
      for (let d = 0; d < attendancesCount; d++) {
        const attDate = new Date();
        // Subtract random time: 0-30 days ago, then random hours within that day
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 16) + 1; // 1-16 hours back
        const minutesAgo = Math.floor(Math.random() * 60);
        attDate.setTime(attDate.getTime() - (daysAgo * 86400000) - (hoursAgo * 3600000) - (minutesAgo * 60000));

        // Decide if this person is "still in" (only if it's today and 10% chance)
        const isToday = daysAgo === 0;
        const isStillIn = isToday && Math.random() > 0.9;
        
        const checkOut = isStillIn ? null : new Date(attDate.getTime() + (Math.floor(Math.random() * 75) + 45) * 60000);

        await prisma.attendance.create({
          data: {
            memberId: member.id,
            checkIn: attDate,
            checkOut: checkOut,
            method: "QR",
          },
        });
      }
    }
  }

  // 5. Usuario Administrador
  console.log("🔐 Asegurando usuario admin...");
  const adminEmail = "admin@gymos.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    if (adminPassword === "admin123") {
      console.warn("⚠️ [ADVERTENCIA DE SEGURIDAD]: Se está creando el usuario administrador con la contraseña por defecto 'admin123'. Asegúrese de cambiarla inmediatamente en producción o defina la variable SEED_ADMIN_PASSWORD en el entorno.");
    }
    try {
      await auth.api.signUpEmail({
        body: { email: adminEmail, password: adminPassword, name: "Admin GymOS" },
      });
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "ADMIN" }
      });
    } catch (e) {
      console.log("Admin ya existe o error en signUp");
    }
  }

  

  // 7. Datos de Entrenamiento (Clases y Rutinas) para probar el Portal
  console.log("🏋️ Generando clases y rutinas para el portal...");
  
  const allMembers = await prisma.member.findMany({ where: { status: "ACTIVE" }, take: 50 });
  
  for (const trainer of trainers) {
    if (!trainer) continue;

    // Crear una clase para cada entrenador
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const classRecord = await prisma.class.create({
      data: {
        name: trainer.fullName === "Ana Martínez" ? "Yoga Flow" : "Entrenamiento Funcional",
        description: "Clase de prueba para el portal",
        trainerId: trainer.id,
        maxCapacity: 15,
        durationMins: 60,
        startTime,
        endTime,
        status: "SCHEDULED",
        location: "Sala A"
      }
    });

    // Inscribir 12 miembros aleatorios a la clase
    const shuffled = [...allMembers].sort(() => 0.5 - Math.random()).slice(0, 12);
    for (const member of shuffled) {
      if (!member) continue;
      await prisma.classBooking.upsert({
        where: {
          classId_memberId: {
            classId: classRecord.id,
            memberId: member.id
          }
        },
        update: {},
        create: {
          classId: classRecord.id,
          memberId: member.id,
          status: "CONFIRMED"
        }
      });
    }

    // Crear una rutina para un miembro aleatorio
    await prisma.routine.create({
      data: {
        name: "Rutina de Definición",
        description: "Enfoque en resistencia",
        trainerId: trainer.id,
        memberId: allMembers[Math.floor(Math.random() * allMembers.length)].id,
        isActive: true
      }
    });
  }

  console.log("✅ Seeding masivo completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seeding:", e);
    process.exit(1);
  });
