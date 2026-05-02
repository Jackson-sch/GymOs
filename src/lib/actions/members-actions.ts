"use server";

import { prisma } from "../../../prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/utils";



export async function getMembersAction() {
  try {
    const members = await prisma.member.findMany({
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, data: serialize(members) };
  } catch (error) {
    return { success: false, error: "Error al cargar socios" };
  }
}

export async function createMemberAction(data: any) {
  try {
    const member = await prisma.member.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dni: data.dni,
        address: data.address,
        photo: data.photo,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        status: "ACTIVE"
      }
    });
    revalidatePath("/members");
    return { success: true, data: serialize(member) };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "El Email o DNI ya existe" };
    return { success: false, error: "Error al crear socio" };
  }
}

export async function updateMemberAction(id: string, data: any) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dni: data.dni,
        address: data.address,
        photo: data.photo,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        status: data.status
      }
    });
    revalidatePath("/members");
    return { success: true, data: serialize(member) };
  } catch (error) {
    return { success: false, error: "Error al actualizar socio" };
  }
}

export async function deleteMemberAction(id: string) {
  try {
    await prisma.member.delete({ where: { id } });
    revalidatePath("/members");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar (tiene registros asociados)" };
  }
}
