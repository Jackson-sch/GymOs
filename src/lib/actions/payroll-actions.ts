"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";
import { verifySession } from "@/lib/security";

export async function getTrainerPayrollData(trainerId: string, startDate: Date, endDate: Date) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      select: {
        baseSalary: true,
        perClassRate: true,
        commissionPct: true,
      }
    });

    if (!trainer) return { success: false, error: "Entrenador no encontrado" };

    const completedClasses = await prisma.class.findMany({
      where: {
        trainerId,
        status: "COMPLETED",
        startTime: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        attendances: true,
      }
    });

    const classesCount = completedClasses.length;
    const perClassTotal = classesCount * (Number(trainer.perClassRate) || 0);

    // 2. Calcular comisiones por ventas (referidos)
    const referrals = await prisma.membership.findMany({
      where: {
        referralTrainerId: trainerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        member: true,
        plan: true,
      }
    });

    const salesCount = referrals.length;
    const commissionPct = Number(trainer.commissionPct) || 0;
    const commissionsTotal = referrals.reduce((acc, curr) => {
      const price = Number(curr.price) || 0;
      return acc + (price * (commissionPct / 100));
    }, 0);

    const baseAmount = Number(trainer.baseSalary) || 0;
    const totalAmount = baseAmount + perClassTotal + commissionsTotal;

    return {
      success: true,
      data: {
        classesCount,
        perClassRate: Number(trainer.perClassRate) || 0,
        perClassTotal,
        salesCount,
        commissionPct,
        commissionsTotal,
        baseAmount,
        totalAmount,
        classes: serialize(completedClasses),
        referrals: serialize(referrals),
      }
    };
  } catch (error) {
    console.error("Error calculating payroll:", error);
    return { success: false, error: "Error al calcular la liquidación" };
  }
}

export async function settlePayrollAction(data: {
  trainerId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  createExpense: boolean;
}) {
  try {
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const result = await prisma.$transaction(async (tx) => {
      let expenseId: string | undefined;

      if (data.createExpense) {
        let category = await tx.expenseCategory.findFirst({
          where: { name: { contains: "Nómina", mode: "insensitive" } }
        });

        if (!category) {
          category = await tx.expenseCategory.create({
            data: { name: "Nómina y Staff", color: "#ef4444" }
          });
        }

        const trainer = await tx.trainer.findUnique({ where: { id: data.trainerId } });

        const expense = await tx.expense.create({
          data: {
            amount: data.amount,
            description: `Pago de nómina: ${trainer?.fullName} (Periodo ${new Date(data.periodStart).toLocaleDateString()} - ${new Date(data.periodEnd).toLocaleDateString()})`,
            categoryId: category.id,
            reference: `PAYROLL-${data.trainerId}-${Date.now()}`,
          }
        });
        expenseId = expense.id;
      }

      const payroll = await tx.payroll.create({
        data: {
          trainerId: data.trainerId,
          amount: data.amount,
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          expenseId,
        }
      });

      return payroll;
    });

    revalidatePath(`/trainers/${data.trainerId}`);
    revalidatePath("/expenses");
    return { success: true, data: serialize(result) };
  } catch (error) {
    console.error("Error settling payroll:", error);
    return { success: false, error: "Error al registrar el pago" };
  }
}

export async function getTrainerPayrollHistory(trainerId: string) {
  try {
    const session = await verifySession(["ADMIN", "SUPER_ADMIN", "TRAINER"]);
    
    // Si es entrenador, solo puede ver el suyo
    if ((session.user as any).role === "TRAINER") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: session.user.id }
      });
      if (!trainer || trainer.id !== trainerId) {
        throw new Error("FORBIDDEN: Solo puedes ver tu propio historial");
      }
    }

    const history = await prisma.payroll.findMany({
      where: { trainerId },
      orderBy: { createdAt: "desc" },
      include: { expense: true }
    });
    return { success: true, data: serialize(history) };
  } catch (error: any) {
    console.error("Error fetching payroll history:", error);
    return { success: false, error: error.message || "Error al cargar historial" };
  }
}
