import { exigirRol, ETIQUETA_ROL, type Rol } from "@/lib/auth";
import Pagina, { Aviso, type SP } from "@/components/Pagina";
import { actualizarUsuario } from "./actions";

export const metadata = { title: "Usuarios" };

export default async function Usuarios({ searchParams }: { searchParams: SP }) {
  const { supabase } = await exigirRol(["coordinador"]);
  const { data } = await supabase.from("profiles").select("id, nombre, email, rol, activo").order("created_at");

  return (
    <Pagina titulo="Usuarios">
      <Aviso sp={searchParams} />
      <div className="tarjeta">
        <strong>¿Cómo se agrega una persona nueva?</strong>
        <ol>
          <li>En Supabase: <em>Authentication → Users → Add user</em> (correo y clave, marcando «Auto Confirm User»).</li>
          <li>Esa persona aparece aquí como «Pendiente de aprobar».</li>
          <li>Escoja su rol, marque «Activo» y guarde.</li>
        </ol>
      </div>
      {(data ?? []).map((u) => (
        <form key={u.id} action={actualizarUsuario} className="tarjeta">
          <input type="hidden" name="id" value={u.id} />
          <div className="suave">{u.email}</div>
          <div className="fila-form">
            <div><label htmlFor={`n-${u.id}`}>Nombre</label><input id={`n-${u.id}`} name="nombre" defaultValue={u.nombre} required minLength={2} maxLength={80} /></div>
            <div><label htmlFor={`r-${u.id}`}>Rol</label>
              <select id={`r-${u.id}`} name="rol" defaultValue={u.rol}>
                {(Object.keys(ETIQUETA_ROL) as Rol[]).map((r) => <option key={r} value={r}>{ETIQUETA_ROL[r]}</option>)}
              </select></div>
            <div><label htmlFor={`a-${u.id}`}>Activo</label><input id={`a-${u.id}`} type="checkbox" name="activo" defaultChecked={u.activo} /></div>
          </div>
          <p><button className="boton" type="submit">Guardar</button></p>
        </form>
      ))}
    </Pagina>
  );
}
