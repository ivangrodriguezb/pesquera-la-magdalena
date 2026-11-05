"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";
import { CATEGORIAS } from "@/lib/format";

const esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().max(20).optional(),
  direccion: z.string().trim().max(200).optional(),
  categoria: z.enum(CATEGORIAS),
  cupo_credito: z.coerce.number().int().min(0).max(1_000_000_000),
  notas: z.string().trim().max(500).optional(),
});

export async function crearCliente(formData: FormData) {
  const { supabase, user } = await exigirRol(["coordinador", "contadora", "vendedor"]);
  const d = esquema.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/clientes", "error", "datos");
  const { error } = await supabase.from("clientes").insert({
    ...d.data,
    telefono: d.data.telefono || null,
    direccion: d.data.direccion || null,
    notas: d.data.notas || null,
    creado_por: user.id,
  });
  if (error) ir("/clientes", "error", "guardar");
  revalidatePath("/clientes");
  ir("/clientes", "ok", "creado");
}
