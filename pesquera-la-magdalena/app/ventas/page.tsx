import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import AnularForm from "@/components/AnularForm";
import { anularVenta } from "./actions";
import { bonito, cop, fechaHora } from "@/lib/format";

export const metadata = { title: "Ventas hechas" };

export default async function Ventas({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(["coordinador", "dueno", "contadora", "vendedor"]);
  const puedeAnular = perfil.rol === "coordinador" || perfil.rol === "contadora";
  const { data: ventas } = await supabase
    .from("ventas")
    .select("id, consecutivo, created_at, total, forma_pago, medio_pago, estado, anulado_motivo, cliente:clientes(nombre), vendedor:profiles!ventas_vendedor_id_fkey(nombre)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <Pagina titulo="Ventas hechas">
      <Aviso sp={searchParams} />
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Pago</th><th className="num">Total</th><th /></tr></thead>
          <tbody>
            {(ventas ?? []).map((v) => {
              const cliente = v.cliente as unknown as { nombre: string } | null;
              const vendedor = v.vendedor as unknown as { nombre: string } | null;
              return (
                <tr key={v.id} className={v.estado === "anulada" ? "anulada" : ""}>
                  <td><Link href={`/comprobante/venta/${v.id}`}>{v.consecutivo}</Link></td>
                  <td>{fechaHora(v.created_at)}</td>
                  <td>{cliente?.nombre ?? "Mostrador"}</td>
                  <td>{vendedor?.nombre ?? "—"}</td>
                  <td>{v.forma_pago === "fiado" ? <span className="etiqueta mala">Fiado</span> : <span className="etiqueta buena">{bonito(v.medio_pago ?? "efectivo")}</span>}</td>
                  <td className="num">{cop(v.total)}</td>
                  <td>{v.estado === "anulada" ? <span className="etiqueta mala">Anulada: {v.anulado_motivo}</span> : puedeAnular && <AnularForm action={anularVenta} id={v.id} />}</td>
                </tr>
              );
            })}
            {!ventas?.length && <tr><td colSpan={7} className="suave">Todavía no hay ventas.</td></tr>}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
