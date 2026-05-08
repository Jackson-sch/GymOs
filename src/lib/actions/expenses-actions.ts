"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpensesAction() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Serialize Decimal amounts to strings or floats for the client
    const serialized = expenses.map(expense => ({
      ...expense,
      amount: expense.amount.toNumber(),
    }));

    return { success: true, data: serialized };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExpenseAction(data: any) {
  try {
    const expense = await prisma.expense.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        categoryId: data.categoryId,
        reference: data.reference,
        status: data.status || "COMPLETED",
      },
      include: {
        category: true,
      },
    });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/");
    
    return { 
      success: true, 
      data: {
        ...expense,
        amount: expense.amount.toNumber(),
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    revalidatePath("/expenses");
    revalidatePath("/reports");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getExpenseCategoriesAction() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExpenseCategoryAction(data: { name: string; description?: string; color?: string }) {
  try {
    const category = await prisma.expenseCategory.create({
      data,
    });
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
