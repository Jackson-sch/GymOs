"use server";

import { prisma } from "../../../prisma";
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
    const baseAmount = Number(trainer.baseSalary) || 0;
    const totalAmount = baseAmount + perClassTotal;

    return {
      success: true,
      data: {
        classesCount,
        perClassRate: Number(trainer.perClassRate) || 0,
        perClassTotal,
        baseAmount,
        totalAmount,
        classes: serialize(completedClasses),
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
    await verifySession(["ADMIN", "SUPER_ADMIN"]);
    const history = await prisma.payroll.findMany({
      where: { trainerId },
      orderBy: { createdAt: "desc" },
      include: { expense: true }
    });
    return { success: true, data: serialize(history) };
  } catch (error) {
    return { success: false, error: "Error al cargar historial" };
  }
}
