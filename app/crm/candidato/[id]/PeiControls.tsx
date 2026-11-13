"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export default function PeiControls({candidateId}:{candidateId:string}) {
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const router=useRouter();
 async function action(kind:string) {
  setBusy(true);setMessage("");
  try {
   const res=await fetch(kind==="recalculate"?"/api/candidates/recalculate":"/api/candidates/contact-event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(kind==="recalculate"?{candidateIds:[candidateId]}:{candidateId,event:kind})});
   const data=await res.json();
   if(!res.ok || data.outcomes?.some((x:any)=>!x.ok)) throw new Error(data.error || data.outcomes?.[0]?.error || "No fue posible guardar");
   setMessage(kind==="recalculate"?"PEI recalculado; histórico conservado. No se enviaron mensajes.":"Secuencia detenida.");router.refresh();
  } catch(e){setMessage(e instanceof Error?e.message:"No fue posible guardar");} finally{setBusy(false);}
 }
 return <div><button className="btn secondary" disabled={busy} onClick={()=>action("recalculate")}>Recalcular PEI sin contactar</button>{" "}<button className="btn secondary" disabled={busy} onClick={()=>action("REPLIED")}>Registrar respuesta</button>{" "}<button className="btn secondary" disabled={busy} onClick={()=>action("OPTED_OUT")}>Registrar baja</button><p role="status">{message}</p></div>;
}
