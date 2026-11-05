"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { exigirRol } from "@/lib/auth";
import { ir } from "@/lib/flash";
import { MEDIOS } from "@/lib/format";

const item = z.object({
  producto_id: z.string().uuid(),
  peso: z.number().positive().max(100_000),
  precio: z.number().int().min(0).max(100_000_000),
});
const esquema = z.object({
  cliente_id: z.union([z.string().uuid(), z.literal("")]),
  forma_pago: z.enum(["contado", "fiado"]),
  medio: z.enum(MEDIOS),
  nota: z.string().trim().max(300),
});

export async function registrarVenta(formData: FormData) {
  const { supabase } = await exigirRol(["coordinador", "contadora", "vendedor"]);
  const base = esquema.safeParse({
    cliente_id: formData.get("cliente_id") ?? "",
    forma_pago: formData.get("forma_pago"),
    medio: formData.get("medio") ?? "efectivo",
    nota: formData.get("nota") ?? "",
  });
  let items: z.infer<typeof item>[] = [];
  try {
    const parsed = z.array(item).min(1).max(50).safeParse(JSON.parse(String(formData.get("items") ?? "[]")));
    if (parsed.success) items = parsed.data;
  } catch { /* JSON inválido */ }
  if (!base.success || !items.length) ir("/vender", "error", "datos");
  if (base.data.forma_pago === "fiado" && !base.data.cliente_id) ir("/vender", "error", "datos");

  const { data, error } = await supabase.rpc("registrar_venta", {
    p_cliente: base.data.cliente_id || null,
    p_forma_pago: base.data.forma_pago,
    p_medio: base.data.medio,
    p_nota: base.data.nota,
    p_items: items,
  });
  if (error || !data) ir("/vender", "error", "guardar");
  redirect(`/comprobante/venta/${data}`);
}
