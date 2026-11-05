import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type Rol = "coordinador" | "dueno" | "contadora" | "vendedor" | "pendiente";

export const ETIQUETA_ROL: Record<Rol, string> = {
  coordinador: "Coordinador",
  dueno: "Dueño",
  contadora: "Contadora",
  vendedor: "Vendedor",
  pendiente: "Pendiente de aprobar",
};

export const contexto = cache(async () => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, nombre, email, rol, activo")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, perfil: perfil as { id: string; nombre: string; email: string; rol: Rol; activo: boolean } | null };
});

// Cada página y cada acción llaman a esto. La base de datos (RLS) vuelve a verificar el permiso.
export async function exigirRol(roles: Rol[]) {
  const ctx = await contexto();
  if (!ctx.perfil || !ctx.perfil.activo || ctx.perfil.rol === "pendiente") redirect("/sin-acceso");
  if (!roles.includes(ctx.perfil.rol)) redirect("/?error=permiso");
  return { supabase: ctx.supabase, user: ctx.user, perfil: ctx.perfil };
}
