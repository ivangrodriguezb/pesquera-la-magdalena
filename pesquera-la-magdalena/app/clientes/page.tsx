import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import { crearCliente } from "./actions";
import { CATEGORIAS, bonito, cop } from "@/lib/format";

export const metadata = { title: "Clientes" };

export default async function Clientes({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(["coordinador", "dueno", "contadora", "vendedor"]);
  const puedeCrear = perfil.rol !== "dueno";
  const verSaldo = perfil.rol !== "vendedor";

  const { data: clientes } = await supabase.from("clientes").select("id, nombre, telefono, categoria, cupo_credito").eq("activo", true).order("nombre").limit(500);
  const saldos = new Map<string, number>();
  if (verSaldo) {
    const { data } = await supabase.from("saldo_clientes").select("cliente_id, saldo");
    (data ?? []).forEach((s) => saldos.set(s.cliente_id, Number(s.saldo)));
  }

  return (
    <Pagina titulo="Clientes">
      <Aviso sp={searchParams} />
      {puedeCrear && (
        <details className="tarjeta" open={!clientes?.length}>
          <summary>➕ Nuevo cliente</summary>
          <form action={crearCliente}>
            <div className="fila-form">
              <div><label htmlFor="nombre">Nombre</label><input id="nombre" name="nombre" required minLength={2} maxLength={120} /></div>
              <div><label htmlFor="telefono">Celular</label><input id="telefono" name="telefono" type="tel" inputMode="tel" maxLength={20} /></div>
              <div><label htmlFor="direccion">Dirección</label><input id="direccion" name="direccion" maxLength={200} /></div>
              <div>
                <label htmlFor="categoria">Tipo de cliente</label>
                <select id="categoria" name="categoria" defaultValue="publico">{CATEGORIAS.map((c) => <option key={c} value={c}>{bonito(c)}</option>)}</select>
              </div>
              <div><label htmlFor="cupo">Hasta cuánto se le fía ($)</label><input id="cupo" name="cupo_credito" type="number" inputMode="numeric" min={0} defaultValue={0} /></div>
            </div>
            <label htmlFor="notas">Notas</label><input id="notas" name="notas" maxLength={500} />
            <p><button className="boton" type="submit">Guardar cliente</button></p>
          </form>
        </details>
      )}
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Celular</th><th>Tipo</th>{verSaldo && <th className="num">Debe</th>}</tr></thead>
          <tbody>
            {(clientes ?? []).map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td><td>{c.telefono ?? "—"}</td><td><span className="etiqueta">{bonito(c.categoria)}</span></td>
                {verSaldo && <td className="num">{cop(saldos.get(c.id) ?? 0)}</td>}
              </tr>
            ))}
            {!clientes?.length && <tr><td colSpan={4} className="suave">Todavía no hay clientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
