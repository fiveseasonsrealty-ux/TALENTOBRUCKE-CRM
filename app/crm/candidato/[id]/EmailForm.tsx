"use client";

import { useState } from "react";

export default function EmailForm({
  candidateId,
  candidateEmail,
}: {
  candidateId: string;
  candidateEmail: string;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [responsible, setResponsible] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function sendEmail() {
    if (!candidateEmail) {
      setStatusMessage("El candidato no tiene un email registrado.");
      return;
    }

    if (!subject.trim()) {
      setStatusMessage("Indica el asunto del email.");
      return;
    }

    if (!message.trim()) {
      setStatusMessage("Escribe el mensaje antes de enviarlo.");
      return;
    }

    if (!responsible) {
      setStatusMessage("Selecciona un responsable.");
      return;
    }

    setSending(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          to: candidateEmail,
          subject,
          message,
          responsible,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(
          data.error || "No fue posible enviar el email."
        );
        return;
      }

      setSubject("");
      setMessage("");
      setStatusMessage("Email enviado correctamente.");

      window.location.reload();
    } catch {
      setStatusMessage("No fue posible enviar el email.");
    } finally {
      setSending(false);
    }
  }

  const success = statusMessage === "Email enviado correctamente.";

  return (
    <div
      style={{
        padding: "18px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fff",
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <strong style={{ color: "#0A2A52" }}>Enviar email</strong>

        <div
          style={{
            marginTop: "4px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          Para: {candidateEmail || "Sin email registrado"}
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <select
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          style={{ padding: "10px" }}
        >
          <option value="">Seleccionar responsable</option>
          <option value="José Manuel">José Manuel</option>
          <option value="Emiliano">Emiliano</option>
        </select>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto"
          style={{ padding: "10px" }}
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe el mensaje para el candidato..."
          rows={8}
          style={{
            padding: "10px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />

        <button
          type="button"
          className="btn"
          onClick={sendEmail}
          disabled={sending}
          style={{
            width: "fit-content",
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? "ENVIANDO..." : "ENVIAR EMAIL"}
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            marginTop: "14px",
            padding: "12px 14px",
            color: success ? "#166534" : "#B91C1C",
            background: success ? "#F0FDF4" : "#FEF2F2",
            border: success
              ? "1px solid #BBF7D0"
              : "1px solid #FECACA",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          {statusMessage}

        </div>
      )}
    </div>
  );
}
