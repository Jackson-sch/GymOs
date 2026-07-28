import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Normaliza y parsea cualquier entrada de fecha (String ISO, Date o Timestamp) a un objeto Date seguro.
 */
export function parseDate(dateInput: string | Date | number): Date {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "number") return new Date(dateInput);
  return parseISO(dateInput);
}

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

/**
 * Format a number as Peruvian currency (PEN)
 * Nota: date-fns no maneja monedas, por lo que se mantiene Intl.NumberFormat
 */
export function formatCurrency(amount: number): string {
  return penFormatter.format(amount);
}

/* 
 * Formatea una fecha a una fecha (e.g., "16-12-2025")
 */
export function formatDate(dateStr: string | Date, pattern = "dd-MM-yyyy"): string {
  const date = parseDate(dateStr);
  return format(date, pattern, { locale: es });
}

/**
 * Format a date string to long format (e.g., "lunes, 16 de diciembre")
 */
export function formatLongDate(dateStr: string | Date, pattern = "EEEE, d 'de' MMMM"): string {
  const date = parseDate(dateStr);
  // 'EEEE' día completo, 'MMMM' mes completo. Se escapa 'de' con comillas simples.
  return format(date, pattern, { locale: es });
}

/* 
 * Formatea una fecha a una hora (e.g., "16:30")
 */
export function formatTime(date: string | Date, pattern = "HH:mm:ss"): string {
  const dateObj = parseDate(date);
  return format(dateObj, pattern, { locale: es });
}

// --- Helpers ---
/**
 * Formatea un método de pago a su versión amigable
 */
export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    YAPE: "Yape",
    PLIN: "Plin",
    OTHER: "Otro",
  };
  return map[method?.toUpperCase()] || method;
}