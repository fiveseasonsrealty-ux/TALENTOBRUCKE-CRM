import { NextResponse } from "next/server";
import { processInvitations } from "../../../../lib/invitations";
export const maxDuration = 60;
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({error: "No autorizado"}, {status: 401});
  try { return NextResponse.json(await processInvitations()); }
  catch { return NextResponse.json({error: "Revisar cola y configuración de invitaciones"}, {status: 500}); }
}
