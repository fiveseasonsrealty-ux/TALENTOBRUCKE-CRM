"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ProcessButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <><button className="btn" disabled={busy} onClick={async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/invitations/process", {method: "POST"});
      const result = await response.json();
      setMessage(!response.ok ? result.error : result.disabled ? "La automatización aún no está activada." : `Invitaciones enviadas: ${result.sent}. Revisa la tabla para ver incidencias.`);
      router.refresh();
    } catch {setMessage("No se pudo comprobar el resultado. Revisa la tabla antes de continuar.");}
    finally {setBusy(false);}
  }}>{busy ? "PROCESANDO…" : "ENVIAR HASTA 10 PENDIENTES"}</button><p role="status">{message}</p></>;
}
