import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { candidateId, to, subject, message, responsible } =
      await req.json();

    if (!candidateId || !to || !subject || !message) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para enviar el email." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY no está configurada." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { data: emailData, error: emailError } =
      await resend.emails.send({
        from: "TalentoBrücke <info@talentobruecke.com>",
        to: [to],
        subject,
        text: message,
        replyTo: "info@talentobruecke.com",
      });

    if (emailError) {
      return NextResponse.json(
        { error: emailError.message },
        { status: 500 }
      );
    }

    const db = supabaseAdmin();

    const { data: activity, error: activityError } = await db
      .from("activities")
      .insert({
        candidate_id: candidateId,
        activity_type: "EMAIL",
        description: `Email enviado: ${subject}`,
        result: "Email enviado correctamente.",
        next_action: null,
        follow_up_at: null,
        follow_up_status: null,
        responsible: responsible || null,
        channel: "EMAIL",
      })
      .select("*")
      .single();

    if (activityError) {
      return NextResponse.json(
        {
          error:
            "El email fue enviado, pero no fue posible registrar la actividad.",
          emailId: emailData?.id || null,
          details: activityError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      emailId: emailData?.id || null,
      activity,
    });
  } catch {
    return NextResponse.json(
      { error: "No fue posible enviar el email." },
      { status: 500 }
    );
  }
}
