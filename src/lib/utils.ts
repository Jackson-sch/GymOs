import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serialización profunda y segura para tipos complejos de Prisma (BigInt, Decimal, Date)
 * Útil para pasar datos desde Server Actions/Components a Client Components.
 */
export function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Manejar BigInt
    if (typeof value === 'bigint') return value.toString();
    
    // Manejar Decimal de Prisma (decimal.js)
    if (value && typeof value === 'object' && (value.constructor?.name === 'Decimal' || value.d !== undefined)) {
       return value.toString();
    }
    
    return value;
  }));
}

/**
 * Helper seguro para obtener el rol del usuario desde cualquier sesión (cliente o servidor).
 */
export function getUserRole(session: any): string {
  return session?.user?.role || "MEMBER";
}
