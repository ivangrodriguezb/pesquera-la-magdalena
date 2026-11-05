"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";
import { CATEGORIAS, UNIDADES } from "@/lib/format";

const producto = z.object({
  nombre: z.string().trim().min(2).max(80),
  unidad: z.enum(Object.keys(UNIDADES) as [string, ...string[]]),
  negocio: z.enum(["pescado", "hielo"]),
});
const precio = z.object({
  producto_id: z.string().uuid(),
  categoria: z.enum(CATEGORIAS),
  precio: z.coerce.number().int().min(1).max(100_000_000),
  vigente_desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function crearProducto(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora"]);
  const d = producto.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/productos", "error", "datos");
  const { error } = await supabase.from("productos").insert(d.data);
  if (error) ir("/productos", "error", "guardar");
  revalidatePath("/productos");
  ir("/productos", "ok", "creado");
}

export async function crearPrecio(formData: FormData) {
  const { supabase, user } = await exigirRol(["coordinador", "contadora"]);
  const d = precio.safeParse(Object.fromEntries(formData));
  if (!d.success) ir("/productos", "error", "datos");
  const { error } = await supabase.from("precios").insert({ ...d.data, creado_por: user.id });
  if (error) ir("/productos", "error", "guardar");
  revalidatePath("/productos");
  ir("/productos", "ok", "creado");
}

export async function cambiarEstadoProducto(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora"]);
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) ir("/productos", "error", "datos");
  const activo = formData.get("activo") === "true";
  const { error } = await supabase.from("productos").update({ activo }).eq("id", id.data);
  if (error) ir("/productos", "error", "guardar");
  revalidatePath("/productos");
  ir("/productos", "ok", "actualizado");
}
