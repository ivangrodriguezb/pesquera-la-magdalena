"use client";
export default function BotonImprimir() {
  return <button className="boton no-imprimir" type="button" onClick={() => window.print()}>Imprimir o guardar PDF</button>;
}
