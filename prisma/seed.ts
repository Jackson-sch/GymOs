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
  const trainers = await Promise.all([
    prisma.trainer.upsert({
      where: { email: "carlos.fit@gymos.com" },
      update: {},
      create: { fullName: "Carlos Rodriguez", email: "carlos.fit@gymos.com", phone: "999111222", specialties: ["Crossfit", "HIIT"] },
    }),
    prisma.trainer.upsert({
      where: { email: "ana.yoga@gymos.com" },
      update: {},
      create: { fullName: "Ana Martínez", email: "ana.yoga@gymos.com", phone: "999333444", specialties: ["Yoga", "Pilates"] },
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
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    try {
      await auth.api.signUpEmail({
        body: { email: adminEmail, password: "admin123", name: "Admin GymOS" },
      });
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "ADMIN" }
      });
    } catch (e) {
      console.log("Admin ya existe o error en signUp");
    }
  }

  // 6. Logs de Auditoría Recientes
  console.log("📝 Generando logs de auditoría...");
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    const actions = ["MEMBER_CREATE", "PAYMENT_RECEIVE", "PLAN_UPDATE", "CONFIG_CHANGE", "ATTENDANCE_LOG"];
    for (let i = 0; i < 30; i++) {
      await prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: actions[Math.floor(Math.random() * actions.length)],
          entity: "SYSTEM",
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 72) * 3600000),
        },
      });
    }
  }

  console.log("✅ Seeding masivo completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seeding:", e);
    process.exit(1);
  });
