export const cop = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(n ?? 0));

export const cantidad = (n: number | string) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 }).format(Number(n));

export const fechaHora = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));

// Colombia no tiene horario de verano: siempre UTC-5.
export function inicioHoyBogota(): string {
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  return new Date(`${dia}T00:00:00-05:00`).toISOString();
}

export const MEDIOS = ["efectivo", "nequi", "daviplata", "bancolombia", "otro"] as const;
export const CATEGORIAS = ["publico", "frecuente", "mayorista", "restaurante"] as const;
export const UNIDADES: Record<string, string> = {
  kg: "kilos", libra: "libras", bulto: "bultos", medio_bulto: "medios bultos", porcion: "porciones", unidad: "unidades",
};
export const bonito = (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)).replace("_", " ");

export function enlaceWhatsApp(telefono: string | null | undefined, texto: string): string | null {
  const d = (telefono ?? "").replace(/\D/g, "");
  if (d.length < 10) return null;
  const numero = d.length === 10 ? `57${d}` : d;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
