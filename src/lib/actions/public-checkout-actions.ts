"use server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { auth } from "@/lib/auth";
import crypto from "crypto";

/**
 * Obtiene la información pública de un gimnasio y sus planes activos por su slug
 */
export async function getPublicGymInfoAction(slug: string) {
  try {
    if (!slug) {
      return { success: false, error: "Identificador de gimnasio requerido" };
    }

    const cleanSlug = slug.toLowerCase().trim();

    const organization = await prisma.organization.findUnique({
      where: { slug: cleanSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        address: true,
        phone: true,
        email: true,
        isActive: true,
        plans: {
          where: { isActive: true },
          orderBy: { price: "asc" }
        },
        branches: {
          where: { isActive: true },
          select: { id: true, name: true, address: true }
        }
      }
    });

    if (!organization || !organization.isActive) {
      return { success: false, error: "Gimnasio no encontrado o inactivo" };
    }

    return { success: true, data: serialize(organization) };
  } catch (error: any) {
    console.error("Error al obtener información pública del gimnasio:", error);
    return { success: false, error: "No se pudo cargar la información del gimnasio" };
  }
}

/**
 * Registra a un nuevo alumno desde la landing pública del gimnasio y activa su membresía
 */
export async function processPublicSelfRegistrationAction(data: {
  slug: string;
  planId: string;
  branchId?: string;
  fullName: string;
  email: string;
  phone: string;
  dni?: string;
  password?: string;
  paymentMethod: "CARD" | "YAPE" | "PLIN" | "TRANSFER" | "CULQI" | "MERCADOPAGO";
}) {
  try {
    if (!data.slug || !data.planId || !data.fullName || !data.email || !data.phone) {
      return { success: false, error: "Por favor complete todos los campos obligatorios" };
    }

    const cleanSlug = data.slug.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Validar que la organización exista y esté activa
    const organization = await prisma.organization.findUnique({
      where: { slug: cleanSlug }
    });

    if (!organization || !organization.isActive) {
      return { success: false, error: "Gimnasio no válido o inactivo" };
    }

    // 2. Validar que el plan exista
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId }
    });

    if (!plan || !plan.isActive) {
      return { success: false, error: "El plan seleccionado ya no se encuentra disponible" };
    }

    // 3. Verificar si el email o DNI ya están registrados en este gimnasio
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId: organization.id,
        OR: [
          { email: cleanEmail },
          ...(data.dni ? [{ dni: data.dni }] : [])
        ]
      }
    });

    if (existingMember) {
      return {
        success: false,
        error: "Ya existe un socio registrado con este correo o DNI en el gimnasio. Inicia sesión en el portal para renovar."
      };
    }

    // 4. Crear el Usuario para el Portal PWA de Alumnos (si se especificó contraseña o autogenerar)
    const userPassword = data.password || (crypto.randomBytes(8).toString("hex") + "A1#");
    let userId: string | null = null;

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      const res = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password: userPassword,
          name: data.fullName,
        }
      });
      user = res.user as any;
    }

    if (user) {
      userId = user.id;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "MEMBER",
          organizationId: organization.id,
          branchId: data.branchId || null,
          emailVerified: true,
        }
      });
    }

    // 5. Transacción de creación de Miembro, Membresía y Pago
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      // a. Crear Miembro
      const member = await tx.member.create({
        data: {
          organizationId: organization.id,
          branchId: data.branchId || null,
          userId: userId,
          fullName: data.fullName,
          email: cleanEmail,
          phone: data.phone,
          dni: data.dni || null,
          status: "ACTIVE",
          qrCode: crypto.randomUUID(),
        }
      });

      // b. Crear Membresía Activa
      const membership = await tx.membership.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          startDate,
          endDate,
          status: "ACTIVE",
          price: plan.price,
        }
      });

      // c. Crear Registro de Pago Completo
      const payment = await tx.payment.create({
        data: {
          memberId: member.id,
          membershipId: membership.id,
          branchId: data.branchId || null,
          amount: plan.price,
          method: data.paymentMethod as any,
          status: "COMPLETED",
          paidAt: new Date(),
          invoiceNumber: `F-${Date.now().toString().slice(-6)}`,
          notes: "Registro y pago online desde Landing Pública",
        }
      });

      return { member, membership, payment };
    });

    return {
      success: true,
      message: `¡Bienvenido a ${organization.name}! Tu membresía '${plan.name}' ha sido activada con éxito.`,
      data: {
        member: serialize(result.member),
        membership: serialize(result.membership),
        tempPassword: data.password ? undefined : userPassword,
      }
    };
  } catch (error: any) {
    console.error("Error en registro público de alumno:", error);
    return { success: false, error: error.message || "Error al procesar la inscripción" };
  }
}
