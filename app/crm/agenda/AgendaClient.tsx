"use client";

import { useState } from "react";

type Activity = {
  id: string;
  candidate_id: string;
  activity_type: string | null;
  next_action: string | null;
  follow_up_at: string;
  follow_up_status: string | null;
  responsible: string | null;
  channel: string | null;
  candidates: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export default function AgendaClient({
  activities,
}: {
  activities: Activity[];
}) {
  const [view, setView] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");
const [items, setItems] = useState(activities);
const [updatingId, setUpdatingId] = useState<string | null>(null);
  const getCancunDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Cancun",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const today = getCancunDate(new Date());

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getCancunDate(tomorrowDate);

  const activityDate = (value: string) =>
    getCancunDate(new Date(value));

const filteredActivities = items.filter((activity) => {
  if (activity.follow_up_status !== "PENDING") {
    return false;
  }
    const date = activityDate(activity.follow_up_at);

    if (view === "today") {
      return date === today;
    }

    if (view === "tomorrow") {
      return date === tomorrow;
    }

    if (view === "week") {
      const now = new Date();

      const end = new Date();
      end.setDate(now.getDate() + 7);

      const activityTime = new Date(activity.follow_up_at);

      return activityTime >= now && activityTime <= end;
    }

    if (view === "date") {
      return selectedDate ? date === selectedDate : false;
    }

    return true;
  });

  const buttonStyle = (active: boolean) => ({
    padding: "10px 16px",
    borderRadius: "8px",
    border: active ? "1px solid #D9A514" : "1px solid #cbd5e1",
    background: active ? "#D9A514" : "#fff",
    color: "#0A2A52",
    fontWeight: 800,
    cursor: "pointer",
  });
async function completeFollowUp(activityId: string) {
  setUpdatingId(activityId);

  try {
    const response = await fetch("/api/follow-ups", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activityId,
        status: "COMPLETED",
      }),
    });

    if (!response.ok) {
      alert("No fue posible completar el seguimiento.");
      return;
    }

    setItems((current) =>
      current.map((activity) =>
        activity.id === activityId
          ? { ...activity, follow_up_status: "COMPLETED" }
          : activity
      )
    );
  } catch {
    alert("No fue posible completar el seguimiento.");
  } finally {
    setUpdatingId(null);
  }
}
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <button
          type="button"
          style={buttonStyle(view === "today")}
          onClick={() => setView("today")}
        >
          HOY
        </button>

        <button
          type="button"
          style={buttonStyle(view === "tomorrow")}
          onClick={() => setView("tomorrow")}
        >
          MAÑANA
        </button>

        <button
          type="button"
          style={buttonStyle(view === "week")}
          onClick={() => setView("week")}
        >
          ESTA SEMANA
        </button>

        <button
          type="button"
          style={buttonStyle(view === "date")}
          onClick={() => setView("date")}
        >
          FECHA ESPECÍFICA
        </button>

        {view === "date" &&         />
        )}
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {filteredActivities.map((activity) => {
          const candidate = activity.candidates;

          return (
           <div
  key={activity.id}
  style={{
    padding: "18px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fff",
    color: "#0A2A52",
  }}
>
  <div
    style={{
      fontWeight: 800,
      fontSize: "17px",
      marginBottom: "8px",
    }}
  >
    {candidate
      ? `${candidate.first_name || ""} ${
          candidate.last_name || ""
        }`.trim()
      : "Candidato"}
  </div>

  <div style={{ marginBottom: "6px" }}>
    <strong>Fecha:</strong>{" "}
    {new Date(activity.follow_up_at).toLocaleString("es-MX", {
      timeZone: "America/Cancun",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </div>

  <div style={{ marginBottom: "6px" }}>
    <strong>Próxima acción:</strong>{" "}
    {activity.next_action || "Sin acción especificada"}
  </div>

  <div style={{ marginBottom: "6px" }}>
    <strong>Responsable:</strong>{" "}
    {activity.responsible || "Sin asignar"}
  </div>

  <div style={{ marginBottom: "16px" }}>
    <strong>Canal:</strong>{" "}
    {activity.channel || activity.activity_type || "—"}
  </div>

  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    }}
  >
    <a
      href={`/crm/candidato/${activity.candidate_id}`}
      style={{
        display: "inline-block",
        padding: "10px 14px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        textDecoration: "none",
        color: "#0A2A52",
        fontWeight: 800,
        fontSize: "12px",
      }}
    >
      ABRIR CANDIDATO
    </a>

    <button
      type="button"
      disabled={updatingId === activity.id}
      onClick={() => completeFollowUp(activity.id)}
      style={{
        padding: "10px 14px",
        border: "1px solid #D9A514",
        borderRadius: "8px",
        background: "#D9A514",
        color: "#0A2A52",
        fontWeight: 800,
        fontSize: "12px",
        cursor:
          updatingId === activity.id ? "default" : "pointer",
        opacity: updatingId === activity.id ? 0.6 : 1,
      }}
    >
      {updatingId === activity.id
        ? "ACTUALIZANDO..."
        : "MARCAR COMO COMPLETADO"}
    </button>
  </div>
</div>
          );
        })} 
        {!filteredActivities.length && (
          <div
            style={{
              padding: "30px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              background: "#fff",
              color: "#64748b",
              textAlign: "center",
            }}
          >
            No hay seguimientos programados para este período.
          </div>
        )}
      </div>
    </>
  );
}
