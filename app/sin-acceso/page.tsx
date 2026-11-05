import { contexto } from "@/lib/auth";
import Pagina from "@/components/Pagina";

export const metadata = { title: "Sin acceso" };

export default async function SinAcceso() {
  const { perfil } = await contexto();
  return (
    <Pagina titulo="Falta aprobar su usuario" atras={false}>
      <div className="tarjeta">
        <p>Su cuenta ({perfil?.email}) ya existe, pero todavía no tiene permisos.</p>
        <p>Pídale a <strong>Luis Enrique</strong> (coordinador) que la active y le asigne un rol. Luego vuelva a entrar.</p>
      </div>
    </Pagina>
  );
}
