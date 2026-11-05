import { exigirRol } from "@/lib/auth";
import Pagina from "@/components/Pagina";

export const metadata = { title: "Reportes" };

export default async function Reportes() {
  await exigirRol(["coordinador", "dueno", "contadora"]);
  return (
    <Pagina titulo="Reportes en Word">
      <div className="rejilla">
        <a className="boton-grande azul" href="/reportes/cartera"><span aria-hidden>📄</span>Cartera: quién debe y cuánto</a>
      </div>
      <p className="suave">Se descarga un documento de Word listo para imprimir o enviar. Más reportes se agregan en la siguiente fase.</p>
    </Pagina>
  );
}
