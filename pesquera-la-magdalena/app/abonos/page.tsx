import Link from "next/link";
import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import AnularForm from "@/components/AnularForm";
import { anularAbono, registrarAbono } from "./actions";
import { MEDIOS, bonito, cop, fechaHora } from "@/lib/format";

export const metadata = { title: "Recibir abono" };

export default async function Abonos({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(["coordinador", "contadora", "vendedor"]);
  const puedeAnular = perfil.rol !== "vendedor";
  const [{ data: clientes }, { data: abonos }] = await Promise.all([
    supabase.from("clientes").select("id, nombre").eq("activo", true).order("nombre").limit(500),
    supabase.from("abonos").select("id, consecutivo, created_at, monto, medio, referencia, estado, anulado_motivo, cliente:clientes(nombre)").order("created_at", { ascending: false }).limit(30),
  ]);

  return (
    <Pagina titulo="Recibir abono">
      <Aviso sp={searchParams} />
      <form action={registrarAbono} className="tarjeta">
        <label htmlFor="cliente">¿Quién abona?</label>
        <select id="cliente" name="cliente_id" required defaultValue="">
          <option value="" disabled>Escoja el cliente…</option>
          {(clientes ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <div className="fila-form">
          <div><label htmlFor="monto">¿Cuánto abona? ($)</label><input id="monto" name="monto" type="number" inputMode="numeric" min={1} required /></div>
          <div><label htmlFor="medio">¿Cómo abona?</label>
            <select id="medio" name="medio" defaultValue="efectivo">{MEDIOS.map((m) => <option key={m} value={m}>{bonito(m)}</option>)}</select></div>
          <div><label htmlFor="ref">N.º de comprobante (Nequi, banco)</label><input id="ref" name="referencia" maxLength={80} /></div>
        </div>
        <label htmlFor="nota">Nota (opcional)</label><input id="nota" name="nota" maxLength={300} />
        <p><button className="boton" type="submit">Guardar abono</button></p>
      </form>

      <h2>Últimos abonos</h2>
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>N.º</th><th>Fecha</th><th>Cliente</th><th>Medio</th><th className="num">Monto</th><th /></tr></thead>
          <tbody>
            {(abonos ?? []).map((a) => {
              const cliente = a.cliente as unknown as { nombre: string } | null;
              return (
                <tr key={a.id} className={a.estado === "anulada" ? "anulada" : ""}>
                  <td><Link href={`/comprobante/abono/${a.id}`}>{a.consecutivo}</Link></td>
                  <td>{fechaHora(a.created_at)}</td><td>{cliente?.nombre}</td>
                  <td>{bonito(a.medio)}{a.referencia ? ` · ${a.referencia}` : ""}</td>
                  <td className="num">{cop(a.monto)}</td>
                  <td>{a.estado === "anulada" ? <span className="etiqueta mala">Anulado: {a.anulado_motivo}</span> : puedeAnular && <AnularForm action={anularAbono} id={a.id} />}</td>
                </tr>
              );
            })}
            {!abonos?.length && <tr><td colSpan={6} className="suave">Todavía no hay abonos.</td></tr>}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
