import { redirect } from "next/navigation";

// Solo se pasan códigos cortos por la URL (nunca texto libre), para que nadie pueda inyectar mensajes.
export const MENSAJES: Record<string, string> = {
  creado: "Guardado correctamente.",
  anulado: "Registro anulado. Quedó guardado en el historial.",
  actualizado: "Cambios guardados.",
  datos: "Revise los datos: falta algo o hay un valor incorrecto.",
  guardar: "No se pudo guardar. Intente de nuevo o avise al coordinador.",
  permiso: "No tiene permiso para hacer eso.",
  credenciales: "Correo o clave incorrectos.",
  propio: "No puede cambiar su propio rol ni desactivarse.",
};

export function ir(ruta: string, tipo: "ok" | "error", codigo: string, extra = ""): never {
  redirect(`${ruta}?${tipo}=${codigo}${extra}`);
}
