import Link from "next/link";
import { exigirRol, ETIQUETA_ROL, type Rol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import { cop, inicioHoyBogota } from "@/lib/format";

type Item = { href: string; icono: string; texto: string; color?: string; roles: Rol[] };
const TODOS: Rol[] = ["coordinador", "dueno", "contadora", "vendedor"];
const GESTION: Rol[] = ["coordinador", "dueno", "contadora"];

const PRINCIPALES: Item[] = [
  { href: "/vender", icono: "🐟", texto: "Vender", roles: ["coordinador", "contadora", "vendedor"] },
  { href: "/abonos", icono: "💵", texto: "Recibir abono", color: "naranja", roles: ["coordinador", "contadora", "vendedor"] },
  { href: "/deudas", icono: "📒", texto: "Quién me debe", color: "azul", roles: GESTION },
  { href: "/caja", icono: "🧾", texto: "Caja", color: "azul", roles: GESTION },
];
const SECUNDARIOS: Item[] = [
  { href: "/ventas", icono: "", texto: "Ventas hechas", roles: TODOS },
  { href: "/clientes", icono: "", texto: "Clientes", roles: TODOS },
  { href: "/productos", icono: "", texto: "Productos y precios", roles: TODOS },
  { href: "/reportes", icono: "", texto: "Reportes en Word", roles: GESTION },
  { href: "/auditoria", icono: "", texto: "Historial de movimientos", roles: ["coordinador", "dueno"] },
  { href: "/usuarios", icono: "", texto: "Usuarios", roles: ["coordinador"] },
];

export default async function Inicio({ searchParams }: { searchParams: SP }) {
  const { supabase, perfil } = await exigirRol(TODOS);
  const verResumen = GESTION.includes(perfil.rol);

  let debenTotal = 0;
  let vendidoHoy = 0;
  if (verResumen) {
    const [{ data: saldos }, { data: ventas }] = await Promise.all([
      supabase.from("saldo_clientes").select("saldo"),
      supabase.from("ventas").select("total").eq("estado", "activa").gte("created_at", inicioHoyBogota()),
    ]);
    debenTotal = (saldos ?? []).reduce((s, r) => s + Math.max(Number(r.saldo), 0), 0);
    vendidoHoy = (ventas ?? []).reduce((s, r) => s + Number(r.total), 0);
  }

  return (
    <Pagina titulo={`Hola, ${perfil.nombre || "bienvenido"}`} atras={false}>
      <p className="suave">{ETIQUETA_ROL[perfil.rol]}</p>
      <Aviso sp={searchParams} />
      {verResumen && (
        <div className="rejilla">
          <div className="tarjeta"><div className="suave">Total que le deben</div><div className="grande">{cop(debenTotal)}</div></div>
          <div className="tarjeta"><div className="suave">Vendido hoy</div><div className="grande">{cop(vendidoHoy)}</div></div>
        </div>
      )}
      <div className="rejilla">
        {PRINCIPALES.filter((i) => i.roles.includes(perfil.rol)).map((i) => (
          <Link key={i.href} href={i.href} className={`boton-grande ${i.color ?? ""}`}><span aria-hidden>{i.icono}</span>{i.texto}</Link>
        ))}
      </div>
      <h2>Más opciones</h2>
      <div className="rejilla">
        {SECUNDARIOS.filter((i) => i.roles.includes(perfil.rol)).map((i) => (
          <Link key={i.href} href={i.href} className="boton-grande gris">{i.texto}</Link>
        ))}
      </div>
    </Pagina>
  );
}
