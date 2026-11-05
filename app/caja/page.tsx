import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import AnularForm from "@/components/AnularForm";
import { anularMovimiento, registrarMovimiento } from "./actions";
import { MEDIOS, bonito, cop, fechaHora, inicioHoyBogota } from "@/lib/format";

export const metadata = { title: "Caja" };

const TIPOS: Record<string, string> = { ingreso: "Entra plata", egreso: "Sale plata (gasto)", retiro_dueno: "Retiro del dueño" };

export default async function Caja({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(["coordinador", "dueno", "contadora"]);
  const puedeEditar = perfil.rol !== "dueno";
  const desde = inicioHoyBogota();

  const [{ data: ventas }, { data: abonos }, { data: movs }] = await Promise.all([
    supabase.from("ventas").select("total, medio_pago").eq("estado", "activa").eq("forma_pago", "contado").gte("created_at", desde),
    supabase.from("abonos").select("monto, medio").eq("estado", "activa").gte("created_at", desde),
    supabase.from("caja_movimientos").select("id, consecutivo, created_at, tipo, negocio, monto, medio, motivo, estado, anulado_motivo, quien:profiles!caja_movimientos_registrado_por_fkey(nombre)").order("created_at", { ascending: false }).limit(40),
  ]);

  // Neto de hoy separado en efectivo y medios digitales
  const neto = { efectivo: 0, digital: 0 };
  const sumar = (medio: string | null, valor: number) => { neto[(medio ?? "efectivo") === "efectivo" ? "efectivo" : "digital"] += valor; };
  (ventas ?? []).forEach((v) => sumar(v.medio_pago, Number(v.total)));
  (abonos ?? []).forEach((a) => sumar(a.medio, Number(a.monto)));
  (movs ?? []).filter((m) => m.estado === "activa" && m.created_at >= desde)
    .forEach((m) => sumar(m.medio, m.tipo === "ingreso" ? Number(m.monto) : -Number(m.monto)));

  return (
    <Pagina titulo="Caja de hoy">
      <Aviso sp={searchParams} />
      <div className="rejilla">
        <div className="tarjeta"><div className="suave">Efectivo del día</div><div className="grande">{cop(neto.efectivo)}</div></div>
        <div className="tarjeta"><div className="suave">Nequi / bancos del día</div><div className="grande">{cop(neto.digital)}</div></div>
      </div>
      <p className="suave">Suma las ventas de contado y los abonos de hoy, y resta los gastos y retiros registrados.</p>

      {puedeEditar && (
        <details className="tarjeta" open>
          <summary>➕ Registrar movimiento de caja</summary>
          <form action={registrarMovimiento}>
            <div className="fila-form">
              <div><label htmlFor="tipo">¿Qué pasó?</label>
                <select id="tipo" name="tipo" defaultValue="egreso">{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label htmlFor="monto">Valor ($)</label><input id="monto" name="monto" type="number" inputMode="numeric" min={1} required /></div>
              <div><label htmlFor="medio">Medio</label>
                <select id="medio" name="medio" defaultValue="efectivo">{MEDIOS.map((m) => <option key={m} value={m}>{bonito(m)}</option>)}</select></div>
              <div><label htmlFor="negocio">Negocio</label>
                <select id="negocio" name="negocio" defaultValue="pescado"><option value="pescado">Pescado</option><option value="hielo">Hielo</option></select></div>
            </div>
            <label htmlFor="motivo">¿Para qué fue? (obligatorio)</label>
            <input id="motivo" name="motivo" required minLength={3} maxLength={300} />
            <p><button className="boton" type="submit">Guardar movimiento</button></p>
          </form>
        </details>
      )}

      <h2>Últimos movimientos</h2>
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>N.º</th><th>Fecha</th><th>Tipo</th><th>Motivo</th><th>Registró</th><th className="num">Valor</th><th /></tr></thead>
          <tbody>
            {(movs ?? []).map((m) => {
              const quien = m.quien as unknown as { nombre: string } | null;
              return (
                <tr key={m.id} className={m.estado === "anulada" ? "anulada" : ""}>
                  <td>{m.consecutivo}</td><td>{fechaHora(m.created_at)}</td>
                  <td>{TIPOS[m.tipo]} <span className="etiqueta">{bonito(m.negocio)}</span></td>
                  <td>{m.motivo}</td><td>{quien?.nombre}</td>
                  <td className="num">{m.tipo === "ingreso" ? "+" : "−"}{cop(m.monto)} <div className="suave">{bonito(m.medio)}</div></td>
                  <td>{m.estado === "anulada" ? <span className="etiqueta mala">Anulado: {m.anulado_motivo}</span> : puedeEditar && <AnularForm action={anularMovimiento} id={m.id} />}</td>
                </tr>
              );
            })}
            {!movs?.length && <tr><td colSpan={7} className="suave">Todavía no hay movimientos.</td></tr>}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
