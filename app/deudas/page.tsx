import { exigirRol } from "@/lib/auth";
import Pagina from "@/components/Pagina";
import { cop, enlaceWhatsApp, fechaHora } from "@/lib/format";

export const metadata = { title: "Quién me debe" };

export default async function Deudas() {
  const { supabase } = await exigirRol(["coordinador", "dueno", "contadora"]);
  const { data } = await supabase
    .from("saldo_clientes")
    .select("cliente_id, nombre, telefono, fiado_total, abonado_total, saldo, ultima_venta")
    .gt("saldo", 0)
    .order("saldo", { ascending: false })
    .limit(500);
  const total = (data ?? []).reduce((s, r) => s + Number(r.saldo), 0);

  return (
    <Pagina titulo="Quién me debe">
      <div className="tarjeta"><div className="suave">Total en la calle</div><div className="grande">{cop(total)}</div></div>
      <div className="tabla-wrap">
        <table>
          <thead><tr><th>Cliente</th><th className="num">Fiado</th><th className="num">Abonado</th><th className="num">Debe</th><th>Última compra</th><th /></tr></thead>
          <tbody>
            {(data ?? []).map((r) => {
              const wa = enlaceWhatsApp(r.telefono, `Hola ${r.nombre}, le recordamos de Pesquera La Magdalena que su saldo pendiente es de ${cop(r.saldo)}. Quedamos atentos, gracias.`);
              return (
                <tr key={r.cliente_id}>
                  <td>{r.nombre}</td><td className="num">{cop(r.fiado_total)}</td><td className="num">{cop(r.abonado_total)}</td>
                  <td className="num"><strong>{cop(r.saldo)}</strong></td>
                  <td>{r.ultima_venta ? fechaHora(r.ultima_venta) : "—"}</td>
                  <td>{wa && <a className="boton wa chico" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}</td>
                </tr>
              );
            })}
            {!data?.length && <tr><td colSpan={6} className="suave">Nadie debe nada por ahora.</td></tr>}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
