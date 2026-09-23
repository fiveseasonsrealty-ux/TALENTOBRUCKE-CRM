"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivityForm({
  candidateId,
}: {
  candidateId: string;
}) {
  const router = useRouter();

  const [activityType, setActivityType] = useState("EMAIL");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [responsible, setResponsible] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveActivity() {
    if (!description.trim()) {
      setMessage("Describe brevemente la actividad realizada.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          activityType,
          description,
          result,
          nextAction,
          followUpAt: followUpAt || null,
         responsible: responsible || null,
channel: activityType,
      }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No fue posible registrar la actividad.");
        return;
      }

      setDescription("");
      setResult("");
      setNextAction("");
      setFollowUpAt("");
      setResponsible("");
      setMessage("Actividad registrada correctamente.");

      router.refresh();
    } catch {
      setMessage("No fue posible registrar la actividad.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    color: "#0A2A52",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase" as const,
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fff",
        marginTop: "18px",
      }}
    >
      <h3
        style={{
          color: "#0A2A52",
          marginTop: 0,
          marginBottom: "18px",
        }}
      >
        Registrar actividad
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div>
          <label style={labelStyle}>Tipo de actividad</label>

          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            style={inputStyle}
          >
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="CALL">Llamada</option>
            <option value="MEETING">Reunión</option>
            <option value="NOTE">Nota</option>
            <option value="FOLLOW_UP">Seguimiento</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Próximo seguimiento</label>

          <input
            type="datetime-local"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
  <label style={labelStyle}>Responsable</label>

  <select
    value={responsible}
    onChange={(e) => setResponsible(e.target.value)}
    style={inputStyle}
  >
    <option value="">Seleccionar responsable</option>
    <option value="José Manuel">José Manuel</option>
    <option value="Emiliano">Emiliano</option>
  </select>
</div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <label style={labelStyle}>Actividad / información compartida</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej.: Se contactó al candidato y se explicó el proceso inicial de evaluación."
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ marginTop: "14px" }}>
        <label style={labelStyle}>Resultado / acuerdos</label>

        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="Ej.: El candidato confirma interés y acepta realizar una llamada de diagnóstico."
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ marginTop: "14px" }}>
        <label style={labelStyle}>Próxima acción de TalentoBrücke</label>

        <textarea
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="Ej.: Contactar para programar diagnóstico."
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ marginTop: "16px" }}>
        <button
          type="button"
          onClick={saveActivity}
          disabled={saving}
          style={{
            padding: "12px 20px",
            border: 0,
            borderRadius: "8px",
            background: "#D9A514",
            color: "#0A2A52",
            fontWeight: 800,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.65 : 1,
          }}
        >
          {saving ? "GUARDANDO..." : "REGISTRAR ACTIVIDAD"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "12px",
            color: "#475569",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
