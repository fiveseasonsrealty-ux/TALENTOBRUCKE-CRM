import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { calculateScore } from "../../../../lib/scoring";
export async function POST(req: Request) {
  try {
    const { candidateIds } = await req.json();
    if (!Array.isArray(candidateIds) || !candidateIds.length || candidateIds.length>100 || candidateIds.some(id=>typeof id!=="string" || !/^[0-9a-f-]{36}$/i.test(id))) return NextResponse.json({error:"Indica entre 1 y 100 candidatos"},{status:400});
    const db=supabaseAdmin();
    const outcomes=[];
    for (const id of [...new Set<string>(candidateIds)]) {
      const {data:c,error}=await db.from("candidates").select("*").eq("id",id).single();
      if (error || !c) {outcomes.push({id,ok:false,error:"No encontrado"});continue;}
      const result=calculateScore(c);
      const {error:saveError}=await db.rpc("recalculate_candidate_pei",{target_id:id,expected_token:c.evaluation_token,result});
      outcomes.push({id,ok:!saveError,error:saveError?.message,score:result.score,classification:result.classification});
    }
    return NextResponse.json({outcomes});
  } catch {return NextResponse.json({error:"No fue posible recalcular"},{status:500});}
}
