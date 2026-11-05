import { exigirRol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import { cambiarEstadoProducto, crearPrecio, crearProducto } from "./actions";
import { CATEGORIAS, UNIDADES, bonito, cop } from "@/lib/format";

export const metadata = { title: "Productos y precios" };

export default async function Productos({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(["coordinador", "dueno", "contadora", "vendedor"]);
  const edita = perfil.rol === "coordinador" || perfil.rol === "contadora";

  const [{ data: productos }, { data: vigentes }] = await Promise.all([
    supabase.from("productos").select("id, nombre, unidad, negocio, activo").order("negocio").order("nombre"),
    supabase.from("precios_vigentes").select("producto_id, categoria, precio"),
  ]);
  const precio = (pid: string, cat: string) => vigentes?.find((v) => v.producto_id === pid && v.categoria === cat)?.precio;
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());

  return (
    <Pagina titulo="Productos y precios">
      <Aviso sp={searchParams} />
      <p className="suave">El precio cambia con la temporada: al poner un precio nuevo, las ventas anteriores no se alteran.</p>
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>Producto</th><th>Se vende por</th>{CATEGORIAS.map((c) => <th key={c} className="num">{bonito(c)}</th>)}{edita && <th />}</tr></thead>
          <tbody>
            {(productos ?? []).map((p) => (
              <tr key={p.id} className={p.activo ? "" : "anulada"}>
                <td>{p.nombre} {p.negocio === "hielo" && <span className="etiqueta">Hielo</span>}</td>
                <td>{UNIDADES[p.unidad] ?? p.unidad}</td>
                {CATEGORIAS.map((c) => <td key={c} className="num">{precio(p.id, c) ? cop(precio(p.id, c)) : "—"}</td>)}
                {edita && (
                  <td>
                    <form action={cambiarEstadoProducto}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="activo" value={String(!p.activo)} />
                      <button className="boton secundario chico" type="submit">{p.activo ? "Ocultar" : "Mostrar"}</button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edita && (
        <>
          <details className="tarjeta" open>
            <summary>💲 Poner o cambiar un precio</summary>
            <form action={crearPrecio}>
              <div className="fila-form">
                <div><label htmlFor="pid">Producto</label>
                  <select id="pid" name="producto_id" required>{(productos ?? []).filter((p) => p.activo).map((p) => <option key={p.id} value={p.id}>{p.nombre} ({UNIDADES[p.unidad]})</option>)}</select></div>
                <div><label htmlFor="cat">Tipo de cliente</label>
                  <select id="cat" name="categoria" defaultValue="publico">{CATEGORIAS.map((c) => <option key={c} value={c}>{bonito(c)}</option>)}</select></div>
                <div><label htmlFor="pr">Precio ($)</label><input id="pr" name="precio" type="number" inputMode="numeric" min={1} required /></div>
                <div><label htmlFor="vd">Desde el día</label><input id="vd" name="vigente_desde" type="date" defaultValue={hoy} required /></div>
              </div>
              <p><button className="boton" type="submit">Guardar precio</button></p>
            </form>
          </details>
          <details className="tarjeta">
            <summary>➕ Agregar un producto nuevo</summary>
            <form action={crearProducto}>
              <div className="fila-form">
                <div><label htmlFor="np">Nombre</label><input id="np" name="nombre" required minLength={2} maxLength={80} /></div>
                <div><label htmlFor="un">Se vende por</label>
                  <select id="un" name="unidad" defaultValue="kg">{Object.entries(UNIDADES).map(([k, v]) => <option key={k} value={k}>{bonito(v)}</option>)}</select></div>
                <div><label htmlFor="ng">Negocio</label>
                  <select id="ng" name="negocio" defaultValue="pescado"><option value="pescado">Pescado</option><option value="hielo">Hielo</option></select></div>
              </div>
              <p><button className="boton" type="submit">Guardar producto</button></p>
            </form>
          </details>
        </>
      )}
    </Pagina>
  );
}
