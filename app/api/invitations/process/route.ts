import { NextResponse } from "next/server";
import { processInvitations } from "../../../../lib/invitations";
export const maxDuration = 60;
export async function POST() {
  try { return NextResponse.json(await processInvitations()); }
  catch { return NextResponse.json({error: "No se pudo procesar la cola. Revisar configuración."}, {status: 500}); }
}
