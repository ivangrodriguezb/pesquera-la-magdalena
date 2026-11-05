import { notFound } from "next/navigation";
import { exigirRol } from "@/lib/auth";
import Pagina from "@/components/Pagina";
import BotonImprimir from "@/components/BotonImprimir";
import { bonito, cantidad, cop, fechaHora, UNIDADES } from "@/lib/format";
import { z } from "zod";

export const metadata = { title: "Comprobante" };

export default async function Comprobante({ params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params;
  if (!z.string().uuid().safeParse(id).success || !["venta", "abono"].includes(tipo)) notFound();
  const { supabase } = await exigirRol(["coordinador", "dueno", "contadora", "vendedor"]);

  if (tipo === "venta") {
    const { data: v } = await supabase
      .from("ventas")
      .select("consecutivo, created_at, total, forma_pago, medio_pago, nota, estado, cliente:clientes(nombre, telefono), vendedor:profiles!ventas_vendedor_id_fkey(nombre), items:venta_items(peso, precio_lista, precio_pactado, subtotal, producto:productos(nombre, unidad))")
      .eq("id", id).maybeSingle();
    if (!v) notFound();
    const cliente = v.cliente as unknown as { nombre: string } | null;
    const vendedor = v.vendedor as unknown as { nombre: string } | null;
    const items = v.items as unknown as { peso: number; precio_pactado: number; subtotal: number; producto: { nombre: string; unidad: string } }[];
    return (
      <Pagina titulo={`Comprobante de venta N.º ${v.consecutivo}`}>
        <div className="recibo">
          <p><strong>Pesquera La Magdalena</strong><br />{fechaHora(v.created_at)}</p>
          {v.estado === "anulada" && <p className="aviso error">ANULADA</p>}
          <p>Cliente: <strong>{cliente?.nombre ?? "Mostrador"}</strong><br />Atendió: {vendedor?.nombre}<br />
            Pago: {v.forma_pago === "fiado" ? "FIADO (queda pendiente)" : bonito(v.medio_pago ?? "efectivo")}</p>
          <table>
            <thead><tr><th>Producto</th><th className="num">Cantidad</th><th className="num">Precio</th><th className="num">Subtotal</th></tr></thead>
            <tbody>{items.map((i, n) => (
              <tr key={n}><td>{i.producto.nombre}</td><td className="num">{cantidad(i.peso)} {UNIDADES[i.producto.unidad]}</td><td className="num">{cop(i.precio_pactado)}</td><td className="num">{cop(i.subtotal)}</td></tr>
            ))}</tbody>
          </table>
          <div className="total-venta">Total: {cop(v.total)}</div>
          {v.nota && <p className="suave">Nota: {v.nota}</p>}
        </div>
        <p><BotonImprimir /></p>
      </Pagina>
    );
  }

  const { data: a } = await supabase
    .from("abonos")
    .select("consecutivo, created_at, monto, medio, referencia, nota, estado, cliente:clientes(nombre), quien:profiles!abonos_registrado_por_fkey(nombre)")
    .eq("id", id).maybeSingle();
  if (!a) notFound();
  const cliente = a.cliente as unknown as { nombre: string } | null;
  const quien = a.quien as unknown as { nombre: string } | null;
  return (
    <Pagina titulo={`Recibo de abono N.º ${a.consecutivo}`}>
      <div className="recibo">
        <p><strong>Pesquera La Magdalena</strong><br />{fechaHora(a.created_at)}</p>
        {a.estado === "anulada" && <p className="aviso error">ANULADO</p>}
        <p>Recibimos de: <strong>{cliente?.nombre}</strong></p>
        <div className="total-venta">{cop(a.monto)}</div>
        <p>Medio: {bonito(a.medio)}{a.referencia ? ` · Comprobante ${a.referencia}` : ""}<br />Recibió: {quien?.nombre}</p>
        {a.nota && <p className="suave">Nota: {a.nota}</p>}
      </div>
      <p><BotonImprimir /></p>
    </Pagina>
  );
}
