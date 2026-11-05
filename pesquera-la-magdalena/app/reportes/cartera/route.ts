import { readFile } from "node:fs/promises";
import path from "node:path";
import { AlignmentType, Document, ImageRun, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { exigirRol } from "@/lib/auth";
import { cop, fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const celda = (texto: string, opciones: { negrilla?: boolean; derecha?: boolean; fondo?: string } = {}) =>
  new TableCell({
    shading: opciones.fondo ? { type: ShadingType.CLEAR, fill: opciones.fondo, color: "auto" } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ alignment: opciones.derecha ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: texto, bold: opciones.negrilla, size: 22 })] })],
  });

export async function GET() {
  const { supabase, perfil } = await exigirRol(["coordinador", "dueno", "contadora"]);
  const { data } = await supabase
    .from("saldo_clientes")
    .select("nombre, telefono, fiado_total, abonado_total, saldo, ultima_venta")
    .gt("saldo", 0)
    .order("saldo", { ascending: false });
  const filas = data ?? [];
  const total = filas.reduce((s, r) => s + Number(r.saldo), 0);

  let logo: Buffer | null = null;
  try { logo = await readFile(path.join(process.cwd(), "public", "logo.jpg")); } catch { /* el reporte sale sin logo */ }

  const encabezado = ["Cliente", "Celular", "Fiado", "Abonado", "Debe"].map((t, i) => celda(t, { negrilla: true, fondo: "E8F0F8", derecha: i >= 2 }));
  const documento = new Document({
    creator: "Pesquera La Magdalena",
    title: "Cartera de clientes",
    sections: [{
      children: [
        ...(logo ? [new Paragraph({ children: [new ImageRun({ type: "jpg", data: logo, transformation: { width: 110, height: 117 } })] })] : []),
        new Paragraph({ children: [new TextRun({ text: "Pesquera La Magdalena", bold: true, size: 36, color: "123A6E" })] }),
        new Paragraph({ children: [new TextRun({ text: "Cartera: quién debe y cuánto", bold: true, size: 28 })] }),
        new Paragraph({ children: [new TextRun({ text: `Generado el ${fechaHora(new Date().toISOString())} por ${perfil.nombre}`, size: 20, color: "5A6B82" })], spacing: { after: 240 } }),
        new Paragraph({ children: [new TextRun({ text: `Total en la calle: ${cop(total)}`, bold: true, size: 30, color: "1B6B3A" })], spacing: { after: 240 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ tableHeader: true, children: encabezado }),
            ...filas.map((r) => new TableRow({ children: [
              celda(r.nombre), celda(r.telefono ?? "—"), celda(cop(r.fiado_total), { derecha: true }),
              celda(cop(r.abonado_total), { derecha: true }), celda(cop(r.saldo), { derecha: true, negrilla: true }),
            ] })),
          ],
        }),
        ...(filas.length ? [] : [new Paragraph({ children: [new TextRun({ text: "Nadie debe nada por ahora.", italics: true })] })]),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(documento);
  const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="cartera-${dia}.docx"`,
      "Cache-Control": "no-store",
    },
  });
}
