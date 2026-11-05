// Anular = marcar el registro como anulado con motivo. Nada se borra.
export default function AnularForm({ action, id }: { action: (f: FormData) => Promise<void>; id: string }) {
  return (
    <details>
      <summary>Anular</summary>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`m-${id}`}>Motivo (obligatorio)</label>
        <input id={`m-${id}`} name="motivo" required minLength={3} maxLength={300} />
        <p><button className="boton peligro chico" type="submit">Confirmar anulación</button></p>
      </form>
    </details>
  );
}
