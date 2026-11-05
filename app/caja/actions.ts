"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";
import { MEDIOS } from "@/lib/format";

const esquema = z.object({
  tipo: z.enum(["ingreso", "egreso", "retiro_dueno"]),
  negocio: z.enum(["pescado", "hielo"]),
  monto: z.coerce.number().int().min(1).max(1_000_000_000),
  medio: z.enum(MEDIOS),
  motivo: z.string().trim().min(3).max(300),
});

export async function registrarMovimiento(formData: FormData) {
  const { supabase, user } = await exigirRol(["coordinador", "contadora"]);
  const d = esquema.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/caja", "error", "datos");
  const { error } = await supabase.from("caja_movimientos").insert({ ...d.data, registrado_por: user.id });
  if (error) ir("/caja", "error", "guardar");
  revalidatePath("/caja");
  ir("/caja", "ok", "creado");
}

export async function anularMovimiento(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora"]);
  const d = z.object({ id: z.string().uuid(), motivo: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/caja", "error", "datos");
  const { error } = await supabase.from("caja_movimientos").update({ estado: "anulada", anulado_motivo: d.data.motivo }).eq("id", d.data.id);
  if (error) ir("/caja", "error", "guardar");
  revalidatePath("/caja");
  ir("/caja", "ok", "anulado");
}
