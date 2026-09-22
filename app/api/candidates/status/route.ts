import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const allowedStatuses = [
  "Nuevo",
  "Por revisar",
  "Contactar",
  "Contactado",
  "Diagnóstico programado",
  "En evaluación",
  "Candidato potencial",
  "En seguimiento",
];

export async function POST(req: Request) {
  try {
    const { candidateId, status } = await req.json();

    if (!candidateId || !status) {
      return NextResponse.json(
        { error: "Faltan candidateId o status" },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from("candidates")
      .update({
        manual_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidateId)
      .select("id, manual_status")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      candidate: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible actualizar el estado" },
      { status: 500 }
    );
  }
}
