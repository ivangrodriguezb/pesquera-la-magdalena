"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";

export async function anularVenta(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora"]);
  const d = z.object({ id: z.string().uuid(), motivo: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/ventas", "error", "datos");
  const { error } = await supabase.from("ventas").update({ estado: "anulada", anulado_motivo: d.data.motivo }).eq("id", d.data.id);
  if (error) ir("/ventas", "error", "guardar");
  revalidatePath("/ventas");
  ir("/ventas", "ok", "anulado");
}
