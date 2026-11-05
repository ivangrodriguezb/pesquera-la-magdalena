import { iniciarSesion } from "@/app/actions";
import { Aviso, type SP } from "@/components/Pagina";

export const metadata = { title: "Entrar" };

export default function Login({ searchParams }: { searchParams: SP }) {
  return (
    <main className="login">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpg" alt="Pesquera La Magdalena" />
      <h1>Entrar</h1>
      <Aviso sp={searchParams} />
      <form action={iniciarSesion}>
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" autoComplete="username" inputMode="email" required maxLength={120} />
        <label htmlFor="clave">Clave</label>
        <input id="clave" name="clave" type="password" autoComplete="current-password" required minLength={6} maxLength={72} />
        <p><button className="boton" style={{ width: "100%" }} type="submit">Entrar</button></p>
      </form>
    </main>
  );
}
