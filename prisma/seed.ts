import "dotenv/config";
import { prisma } from "./index";
import { auth } from "../src/lib/auth";
import { Prisma } from "@prisma/client";

async function main() {
  console.log("🌱 Iniciando seeding masivo...");

  // 0. Organización Demostración (Tenant Inicial)
  console.log("🏢 Creando gimnasio de prueba (Tenant)...");
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "elite-fitness" },
    update: { isActive: true },
    create: {
      name: "GymOS - Elite Fitness",
      slug: "elite-fitness",
      subdomain: "elite-fitness",
      email: "contacto@elitefitness.com",
      phone: "999888777",
      address: "Av. Principal 123, Miraflores",
      isActive: true,
    },
  });

  // 1. Configuración Inicial
  console.log("⚙️ Configurando sistema...");
  const existingGymName = await prisma.systemConfig.findFirst({
    where: { organizationId: demoOrg.id, key: "GYM_NAME" },
  });
  if (!existingGymName) {
    await prisma.systemConfig.create({
      data: {
        organizationId: demoOrg.id,
        key: "GYM_NAME",
        value: "GymOS - Elite Fitness",
        category: "GENERAL",
      },
    });
  }

  const existingMaxCap = await prisma.systemConfig.findFirst({
    where: { organizationId: demoOrg.id, key: "MAX_CAPACITY" },
  });
  if (!existingMaxCap) {
    await prisma.systemConfig.create({
      data: {
        organizationId: demoOrg.id,
        key: "MAX_CAPACITY",
        value: "50",
        category: "GENERAL",
        description: "Capacidad máxima del local",
      },
    });
  }

  // 2. Planes de Membresía
  console.log("📋 Creando planes con beneficios diferenciados...");
  const plansData = [
    {
      name: "Básico",
      description: "Acceso esencial a sala de musculación y máquinas en horario regular.",
      price: 80,
      duration: 30,
      maxFreezeDays: 0,
      category: "ESENCIAL",
      allowedClasses: false,
      color: "oklch(50% 0.1 220)",
    },
    {
      name: "Estándar",
      description: "Acceso completo a máquinas, cardio y todas las clases grupales dirigidas.",
      price: 120,
      duration: 30,
      maxFreezeDays: 7,
      category: "RECOMENDADO",
      allowedClasses: true,
      color: "oklch(60% 0.12 250)",
    },
    {
      name: "Premium",
      description: "Pase VIP Todo Incluido: clases ilimitadas, 30 días congelación e invitados.",
      price: 180,
      duration: 30,
      maxFreezeDays: 30,
      category: "VIP",
      allowedClasses: true,
      color: "oklch(70% 0.15 280)",
    },
    {
      name: "Anual VIP",
      description: "Membresía anual exclusiva con tarifa con descuento y máximos beneficios.",
      price: 1200,
      duration: 365,
      maxFreezeDays: 60,
      category: "ANUAL VIP",
      allowedClasses: true,
      color: "oklch(80% 0.2 300)",
    },
  ];

  const plans = await Promise.all(
    plansData.map(async p => {
      const existing = await prisma.plan.findFirst({
        where: { name: { equals: p.name, mode: "insensitive" } },
      });
      if (existing) {
        return prisma.plan.update({
          where: { id: existing.id },
          data: {
            color: p.color,
            price: new Prisma.Decimal(p.price),
            description: p.description,
            category: p.category,
            allowedClasses: p.allowedClasses,
            maxFreezeDays: p.maxFreezeDays,
            organizationId: demoOrg.id,
          },
        });
      }
      return prisma.plan.create({
        data: {
          name: p.name,
          description: p.description,
          price: new Prisma.Decimal(p.price),
          durationDays: p.duration,
          maxFreezeDays: p.maxFreezeDays,
          category: p.category,
          allowedClasses: p.allowedClasses,
          color: p.color,
          isActive: true,
          organizationId: demoOrg.id,
        },
      });
    })
  );

  // 3. Entrenadores
  console.log("💪 Creando entrenadores...");

  async function createTrainerWithUser(data: {
    fullName: string;
    email: string;
    phone: string;
    specialties: string[];
    dni: string;
  }) {
    try {
      const userEmail = data.email;

      const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
      if (existingUser) {
        console.log(`♻️ Recreando usuario para ${userEmail}...`);
        await prisma.user.delete({ where: { id: existingUser.id } });
      }

      await auth.api.signUpEmail({
        body: {
          email: userEmail,
          password: data.dni,
          name: data.fullName,
        },
      });

      const user = await prisma.user.findUnique({ where: { email: userEmail } });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "TRAINER",
            mustChangePassword: true,
            emailVerified: true,
            organizationId: demoOrg.id,
          },
        });

        return await prisma.trainer.upsert({
          where: { email: userEmail },
          update: {
            userId: user.id,
            dni: data.dni,
            organizationId: demoOrg.id,
          },
          create: {
            fullName: data.fullName,
            email: userEmail,
            phone: data.phone,
            specialties: data.specialties,
            userId: user.id,
            dni: data.dni,
            organizationId: demoOrg.id,
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
      specialties: ["Crossfit", "HIIT"],
    }),
    createTrainerWithUser({
      fullName: "Ana Martínez",
      email: "ana.yoga@gymos.com",
      phone: "999333444",
      dni: "20212223",
      specialties: ["Yoga", "Pilates"],
    }),
  ]);

  // 4. Miembros y Membresías
  console.log("👥 Creando 200 miembros con historial...");
  const firstNames = [
    "Juan",
    "Maria",
    "Pedro",
    "Lucia",
    "Carlos",
    "Elena",
    "Roberto",
    "Sofia",
    "Diego",
    "Paula",
    "Andres",
    "Camila",
    "Mateo",
    "Valentina",
    "Gabriel",
    "Isabella",
    "Lucas",
    "Mia",
    "Sebastian",
    "Victoria",
  ];
  const lastNames = [
    "Perez",
    "Garcia",
    "Lopez",
    "Rodriguez",
    "Sanchez",
    "Martinez",
    "Gomez",
    "Fernandez",
    "Diaz",
    "Torres",
    "Vargas",
    "Castro",
    "Rios",
    "Morales",
    "Suarez",
    "Ortega",
    "Rojas",
    "Flores",
    "Soto",
    "Luna",
  ];

  const CHUNK_SIZE = 20;
  for (let chunkStart = 0; chunkStart < 200; chunkStart += CHUNK_SIZE) {
    await Promise.all(
      Array.from({ length: Math.min(CHUNK_SIZE, 200 - chunkStart) }, async (_, j) => {
        const i = chunkStart + j;
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const dni = (10000000 + i).toString();
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;

        const member = await prisma.member.upsert({
          where: { dni },
          update: { organizationId: demoOrg.id },
          create: {
            fullName: `${fn} ${ln}`,
            email,
            phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            dni,
            status: Math.random() > 0.05 ? "ACTIVE" : "INACTIVE",
            organizationId: demoOrg.id,
          },
        });

        if (member.status === "ACTIVE") {
          const plan = plans[Math.floor(Math.random() * plans.length)];
          if (!plan) return;
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

          const monthsToPay = Math.floor(Math.random() * 6) + 1;
          await Promise.all(
            Array.from({ length: monthsToPay }, async (_, m) => {
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
            })
          );

          const attendancesCount = Math.floor(Math.random() * 20);
          await Promise.all(
            Array.from({ length: attendancesCount }, async (_, d) => {
              const attDate = new Date();
              const daysAgo = Math.floor(Math.random() * 30);
              const hoursAgo = Math.floor(Math.random() * 16) + 1;
              const minutesAgo = Math.floor(Math.random() * 60);
              attDate.setTime(
                attDate.getTime() - daysAgo * 86400000 - hoursAgo * 3600000 - minutesAgo * 60000
              );

              const isToday = daysAgo === 0;
              const isStillIn = isToday && Math.random() > 0.9;

              const checkOut = isStillIn
                ? null
                : new Date(attDate.getTime() + (Math.floor(Math.random() * 75) + 45) * 60000);

              await prisma.attendance.create({
                data: {
                  memberId: member.id,
                  checkIn: attDate,
                  checkOut: checkOut,
                  method: "QR",
                },
              });
            })
          );
        }
      })
    );
  }

  // 5. Usuarios Administrador y Super Administrador
  console.log("🔐 Asegurando usuarios administradores...");

  // 5.1 Super Admin (Plataforma SaaS Global)
  const superAdminEmail = "superadmin@gymos.com";
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || process.env.NEXTAUTH_SECRET;
  if (!superAdminPassword) {
    throw new Error(
      "CRITICAL SECURITY ERROR: SEED_SUPER_ADMIN_PASSWORD o NEXTAUTH_SECRET debe estar configurada en las variables de entorno"
    );
  }
  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existingSuperAdmin) {
    try {
      await auth.api.signUpEmail({
        body: { email: superAdminEmail, password: superAdminPassword, name: "Super Admin SaaS" },
      });
      await prisma.user.update({
        where: { email: superAdminEmail },
        data: { role: "SUPER_ADMIN", mustChangePassword: false, emailVerified: true },
      });
      console.log("✅ Super Admin creado: superadmin@gymos.com");
    } catch (e) {
      console.log("Super Admin ya existe o error al registrar");
    }
  } else {
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: { role: "SUPER_ADMIN" },
    });
  }

  // 5.2 Admin Local del Gimnasio
  const adminEmail = "admin@gymos.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.NEXTAUTH_SECRET;
  if (!adminPassword) {
    throw new Error(
      "CRITICAL SECURITY ERROR: SEED_ADMIN_PASSWORD o NEXTAUTH_SECRET debe estar configurada en las variables de entorno"
    );
  }
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    try {
      await auth.api.signUpEmail({
        body: { email: adminEmail, password: adminPassword, name: "Admin GymOS" },
      });
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          mustChangePassword: true,
          emailVerified: true,
          organizationId: demoOrg.id,
        },
      });
      console.log("✅ Admin local creado: admin@gymos.com");
    } catch (e) {
      console.log("Admin ya existe o error en signUp");
    }
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { organizationId: demoOrg.id },
    });
  }

  // 7. Datos de Entrenamiento (Clases y Rutinas) para probar el Portal
  console.log("🏋️ Generando clases y rutinas para el portal...");

  const allMembers = await prisma.member.findMany({ where: { status: "ACTIVE" }, take: 50 });

  await Promise.all(
    trainers.map(async trainer => {
      if (!trainer) return;

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
          location: "Sala A",
        },
      });

      // Inscribir 12 miembros aleatorios a la clase
      const shuffled = [...allMembers].sort(() => 0.5 - Math.random()).slice(0, 12);
      await Promise.all(
        shuffled.map(async member => {
          if (!member) return;
          await prisma.classBooking.upsert({
            where: {
              classId_memberId: {
                classId: classRecord.id,
                memberId: member.id,
              },
            },
            update: {},
            create: {
              classId: classRecord.id,
              memberId: member.id,
              status: "CONFIRMED",
            },
          });
        })
      );

      // Crear una rutina para un miembro aleatorio
      await prisma.routine.create({
        data: {
          name: "Rutina de Definición",
          description: "Enfoque en resistencia",
          trainerId: trainer.id,
          memberId: allMembers[Math.floor(Math.random() * allMembers.length)].id,
          isActive: true,
        },
      });
    })
  );

  console.log("✅ Seeding masivo completado.");
}

main().catch(e => {
  console.error("❌ Error en el seeding:", e);
  process.exit(1);
});
