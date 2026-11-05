"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";

const esquema = z.object({
  id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(80),
  rol: z.enum(["coordinador", "dueno", "contadora", "vendedor", "pendiente"]),
});

export async function actualizarUsuario(formData: FormData) {
  const { supabase, user } = await exigirRol(["coordinador"]);
  const d = esquema.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/usuarios", "error", "datos");
  const activo = formData.get("activo") === "on" && d.data.rol !== "pendiente";
  if (d.data.id === user.id && (!activo || d.data.rol !== "coordinador")) ir("/usuarios", "error", "propio");
  const { error } = await supabase.from("profiles").update({ nombre: d.data.nombre, rol: d.data.rol, activo }).eq("id", d.data.id);
  if (error) ir("/usuarios", "error", "guardar");
  revalidatePath("/usuarios");
  ir("/usuarios", "ok", "actualizado");
}
