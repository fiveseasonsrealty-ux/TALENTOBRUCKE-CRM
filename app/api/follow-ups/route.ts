import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function PATCH(req: Request) {
  try {
    const { activityId, status } = await req.json();

    if (!activityId || !status) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    const allowedStatuses = ["PENDING", "COMPLETED"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado de seguimiento no válido." },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from("activities")
      .update({
        follow_up_status: status,
      })
      .eq("id", activityId)
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
      { error: "No fue posible actualizar el seguimiento." },
      { status: 500 }
    );
  }
}
