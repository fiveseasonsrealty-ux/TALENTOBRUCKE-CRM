import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
// Authenticated staff action, not a public provider webhook.
export async function POST(req: Request) {
  try {
    const {candidateId,event}=await req.json();
    if (typeof candidateId!=="string" || !/^[0-9a-f-]{36}$/i.test(candidateId) || !["REPLIED","OPTED_OUT"].includes(event)) return NextResponse.json({error:"Evento no válido"},{status:400});
    const {error}=await supabaseAdmin().rpc("record_candidate_contact_event",{target_id:candidateId,event_name:event});
    if(error) throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"No fue posible detener los contactos"},{status:500});}
}
