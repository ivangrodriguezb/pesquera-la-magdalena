"use client";
import { useState } from "react";
import { cop, MEDIOS, UNIDADES, bonito } from "@/lib/format";

type Cliente = { id: string; nombre: string; categoria: string };
type Producto = { id: string; nombre: string; unidad: string };
type Precio = { producto_id: string; categoria: string; precio: number };
type Fila = { producto_id: string; cantidad: string; precio: string; tocado: boolean };

const vacia = (): Fila => ({ producto_id: "", cantidad: "", precio: "", tocado: false });
const aNumero = (s: string) => Number(s.replace(",", "."));
const soloDigitos = (s: string) => s.replace(/\D/g, "");

export default function FormVenta({ clientes, productos, precios, action }: {
  clientes: Cliente[]; productos: Producto[]; precios: Precio[]; action: (f: FormData) => Promise<void>;
}) {
  const [clienteId, setClienteId] = useState("");
  const [forma, setForma] = useState("contado");
  const [filas, setFilas] = useState<Fila[]>([vacia()]);

  const categoriaDe = (cid: string) => clientes.find((c) => c.id === cid)?.categoria ?? "publico";
  const lista = (pid: string, cid = clienteId) =>
    Number(precios.find((p) => p.producto_id === pid && p.categoria === categoriaDe(cid))?.precio ?? 0);

  const cambiarCliente = (cid: string) => {
    setClienteId(cid);
    setFilas((fs) => fs.map((f) => (f.tocado || !f.producto_id ? f : { ...f, precio: String(lista(f.producto_id, cid) || "") })));
  };
  const cambiarFila = (i: number, parche: Partial<Fila>) => setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, ...parche } : f)));

  const validas = filas.filter((f) => f.producto_id && aNumero(f.cantidad) > 0 && f.precio !== "");
  const total = validas.reduce((s, f) => s + Math.round(aNumero(f.cantidad) * Number(f.precio)), 0);
  const items = JSON.stringify(validas.map((f) => ({ producto_id: f.producto_id, peso: aNumero(f.cantidad), precio: Number(f.precio) })));
  const puedeGuardar = validas.length > 0 && (forma === "contado" || clienteId !== "");

  return (
    <form action={action}>
      <div className="tarjeta">
        <label htmlFor="cliente">Cliente {forma === "fiado" ? "(obligatorio para fiado)" : "(opcional)"}</label>
        <select id="cliente" name="cliente_id" value={clienteId} onChange={(e) => cambiarCliente(e.target.value)}>
          <option value="">Cliente de mostrador</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {bonito(c.categoria)}</option>)}
        </select>
      </div>

      {filas.map((f, i) => {
        const prod = productos.find((p) => p.id === f.producto_id);
        const pl = f.producto_id ? lista(f.producto_id) : 0;
        return (
          <div className="tarjeta" key={i}>
            <label htmlFor={`p${i}`}>Producto</label>
            <select id={`p${i}`} value={f.producto_id} onChange={(e) => cambiarFila(i, { producto_id: e.target.value, precio: String(lista(e.target.value) || ""), tocado: false })}>
              <option value="">Escoja…</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <div className="fila-form">
              <div>
                <label htmlFor={`c${i}`}>Cantidad ({prod ? UNIDADES[prod.unidad] : "peso"})</label>
                <input id={`c${i}`} inputMode="decimal" placeholder="Ej: 1,5" value={f.cantidad} onChange={(e) => cambiarFila(i, { cantidad: e.target.value.replace(/[^\d.,]/g, "") })} />
              </div>
              <div>
                <label htmlFor={`r${i}`}>Precio por {prod ? UNIDADES[prod.unidad].replace(/s$/, "") : "unidad"} ($)</label>
                <input id={`r${i}`} inputMode="numeric" value={f.precio} onChange={(e) => cambiarFila(i, { precio: soloDigitos(e.target.value), tocado: true })} />
              </div>
            </div>
            {pl > 0 && f.precio !== "" && Number(f.precio) !== pl && (
              <p className="aviso error">Precio de lista: {cop(pl)}. Usted puso {cop(Number(f.precio))}.</p>
            )}
            {pl === 0 && f.producto_id && <p className="suave">Este producto no tiene precio de lista para este tipo de cliente.</p>}
            {filas.length > 1 && <button type="button" className="boton secundario chico" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))}>Quitar</button>}
          </div>
        );
      })}
      {filas.length < 20 && <p><button type="button" className="boton secundario" onClick={() => setFilas((fs) => [...fs, vacia()])}>➕ Otro producto</button></p>}

      <div className="tarjeta">
        <div className="fila-form">
          <div>
            <label htmlFor="forma">¿Cómo pagan?</label>
            <select id="forma" name="forma_pago" value={forma} onChange={(e) => setForma(e.target.value)}>
              <option value="contado">Pagan ahora</option>
              <option value="fiado">Se lo fían</option>
            </select>
          </div>
          <div>
            <label htmlFor="medio">Medio de pago</label>
            <select id="medio" name="medio" defaultValue="efectivo" disabled={forma === "fiado"}>
              {MEDIOS.map((m) => <option key={m} value={m}>{bonito(m)}</option>)}
            </select>
            {forma === "fiado" && <input type="hidden" name="medio" value="efectivo" />}
          </div>
        </div>
        <label htmlFor="nota">Nota (opcional)</label>
        <input id="nota" name="nota" maxLength={300} />
      </div>

      <input type="hidden" name="items" value={items} />
      <div className="total-venta">Total: {cop(total)}</div>
      <button className="boton" style={{ width: "100%", minHeight: 64, fontSize: "1.3rem" }} type="submit" disabled={!puedeGuardar}>Guardar venta</button>
    </form>
  );
}
