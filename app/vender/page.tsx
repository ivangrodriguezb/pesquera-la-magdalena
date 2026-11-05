import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import FormVenta from "@/components/FormVenta";
import { registrarVenta } from "./actions";

export const metadata = { title: "Vender" };

export default async function Vender({ searchParams }: { searchParams: SP }) {
  const { supabase } = await exigirRol(["coordinador", "contadora", "vendedor"]);
  const [{ data: clientes }, { data: productos }, { data: precios }] = await Promise.all([
    supabase.from("clientes").select("id, nombre, categoria").eq("activo", true).order("nombre").limit(500),
    supabase.from("productos").select("id, nombre, unidad").eq("activo", true).order("nombre"),
    supabase.from("precios_vigentes").select("producto_id, categoria, precio"),
  ]);
  return (
    <Pagina titulo="Vender">
      <Aviso sp={searchParams} />
      <FormVenta
        clientes={clientes ?? []}
        productos={productos ?? []}
        precios={(precios ?? []).map((p) => ({ ...p, precio: Number(p.precio) }))}
        action={registrarVenta}
      />
    </Pagina>
  );
}
