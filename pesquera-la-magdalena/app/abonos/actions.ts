"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";
import { MEDIOS } from "@/lib/format";

const esquema = z.object({
  cliente_id: z.string().uuid(),
  monto: z.coerce.number().int().min(1).max(1_000_000_000),
  medio: z.enum(MEDIOS),
  referencia: z.string().trim().max(80).optional(),
  nota: z.string().trim().max(300).optional(),
});

export async function registrarAbono(formData: FormData) {
  const { supabase, user } = await exigirRol(["coordinador", "contadora", "vendedor"]);
  const d = esquema.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/abonos", "error", "datos");
  const { data, error } = await supabase
    .from("abonos")
    .insert({ ...d.data, referencia: d.data.referencia || null, nota: d.data.nota || null, registrado_por: user.id })
    .select("id")
    .single();
  if (error || !data) ir("/abonos", "error", "guardar");
  revalidatePath("/abonos");
  redirect(`/comprobante/abono/${data.id}`);
}

export async function anularAbono(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora"]);
  const d = z.object({ id: z.string().uuid(), motivo: z.string().trim().min(3).max(300) }).safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/abonos", "error", "datos");
  const { error } = await supabase.from("abonos").update({ estado: "anulada", anulado_motivo: d.data.motivo }).eq("id", d.data.id);
  if (error) ir("/abonos", "error", "guardar");
  revalidatePath("/abonos");
  ir("/abonos", "ok", "anulado");
}
