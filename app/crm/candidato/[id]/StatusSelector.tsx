"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { allowedStatuses as statuses } from "../../../../lib/crm";

export default function StatusSelector({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus || "Nuevo");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveStatus() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/candidates/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "No fue posible guardar el estado.");
        return;
      }

      setMessage("Estado actualizado correctamente.");
      router.refresh();
    } catch {
      setMessage("No fue posible guardar el estado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        padding: "18px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fff",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Estado CRM
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            minWidth: "240px",
            padding: "11px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
            color: "#0A2A52",
            fontWeight: 600,
          }}
        >
          {Array.from(new Set([currentStatus || "Nuevo", ...statuses])).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={saveStatus}
          disabled={saving}
          style={{
            padding: "11px 18px",
            border: "0",
            borderRadius: "8px",
            background: "#D9A514",
            color: "#0A2A52",
            fontWeight: 800,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.65 : 1,
          }}
        >
          {saving ? "GUARDANDO..." : "GUARDAR ESTADO"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#475569",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
