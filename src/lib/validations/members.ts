import { z } from "zod";

export const memberSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().min(7, "Teléfono inválido"),
  dni: z.string().min(5, "DNI inválido").optional().nullable(),
  address: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  photoPosition: z.number().optional().default(50),
  birthDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional().default("ACTIVE"),
});

export type MemberInput = z.infer<typeof memberSchema>;
