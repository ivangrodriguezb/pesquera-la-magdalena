import { exigirRol } from "@/lib/auth";
import Pagina from "@/components/Pagina";
import { fechaHora } from "@/lib/format";

export const metadata = { title: "Historial de movimientos" };

const TABLAS: Record<string, string> = {
  profiles: "Usuarios", clientes: "Clientes", productos: "Productos", precios: "Precios", ventas: "Ventas",
  venta_items: "Detalle de venta", abonos: "Abonos", caja_movimientos: "Caja",
};

export default async function Auditoria() {
  const { supabase } = await exigirRol(["coordinador", "dueno"]);
  const [{ data: reg }, { data: perfiles }] = await Promise.all([
    supabase.from("auditoria").select("id, usuario_id, accion, tabla, registro_id, datos, created_at").order("created_at", { ascending: false }).limit(150),
    supabase.from("profiles").select("id, nombre"),
  ]);
  const nombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));

  return (
    <Pagina titulo="Historial de movimientos">
      <p className="suave">Quién hizo qué y cuándo. Este historial no se puede editar ni borrar. Muestra los últimos 150.</p>
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Quién</th><th>Qué hizo</th><th>Dónde</th></tr></thead>
          <tbody>
            {(reg ?? []).map((r) => {
              const anulo = r.accion === "UPDATE" && (r.datos as { despues?: { estado?: string } } | null)?.despues?.estado === "anulada";
              return (
                <tr key={r.id}>
                  <td>{fechaHora(r.created_at)}</td>
                  <td>{r.usuario_id ? nombre.get(r.usuario_id) ?? "—" : "Sistema"}</td>
                  <td>{anulo ? <span className="etiqueta mala">Anuló</span> : r.accion === "INSERT" ? "Creó" : "Cambió"}</td>
                  <td>{TABLAS[r.tabla] ?? r.tabla}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
