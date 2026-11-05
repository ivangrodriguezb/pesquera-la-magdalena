import Link from "next/link";
import { cerrarSesion } from "@/app/actions";
import { MENSAJES } from "@/lib/flash";

export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function Aviso({ sp }: { sp: SP }) {
  const p = await sp;
  const ok = typeof p.ok === "string" ? p.ok : null;
  const error = typeof p.error === "string" ? p.error : null;
  if (error) return <div className="aviso error" role="alert">{MENSAJES[error] ?? MENSAJES.guardar}</div>;
  if (ok) return <div className="aviso ok" role="status">{MENSAJES[ok] ?? MENSAJES.creado}</div>;
  return null;
}

export default function Pagina({ titulo, atras = true, children }: { titulo: string; atras?: boolean; children: React.ReactNode }) {
  return (
    <>
      <header className="barra">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="Logo Pesquera La Magdalena" />
        <strong>Pesquera La Magdalena</strong>
        <form action={cerrarSesion}><button className="boton secundario chico" type="submit">Salir</button></form>
      </header>
      <main className="contenedor">
        {atras && <Link className="volver" href="/">← Inicio</Link>}
        <h1>{titulo}</h1>
        {children}
      </main>
    </>
  );
}
