"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { ir } from "@/lib/flash";

const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  clave: z.string().min(6).max(72),
});

export async function iniciarSesion(formData: FormData) {
  const datos = esquemaLogin.safeParse({ email: formData.get("email"), clave: formData.get("clave") });
  if (!datos.success) ir("/login", "error", "credenciales");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email: datos.data.email, password: datos.data.clave });
  if (error) ir("/login", "error", "credenciales");
  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
