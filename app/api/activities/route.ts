import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const allowedTypes = [
  "EMAIL",
  "WHATSAPP",
  "CALL",
  "MEETING",
  "NOTE",
  "FOLLOW_UP",
];

export async function POST(req: Request) {
  try {
    const {
      candidateId,
      activityType,
      description,
      result,
      nextAction,
      followUpAt,
      channel,
    } = await req.json();

    if (!candidateId || !activityType || !description) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(activityType)) {
      return NextResponse.json(
        { error: "Tipo de actividad no válido." },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from("activities")
      .insert({
        candidate_id: candidateId,
        activity_type: activityType,
        description,
        result: result || null,
        next_action: nextAction || null,
        follow_up_at: followUpAt || null,
        channel: channel || null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      activity: data,
    });
  } catch {
    return NextResponse.json(
      { error: "No fue posible registrar la actividad." },
      { status: 500 }
    );
  }
}
