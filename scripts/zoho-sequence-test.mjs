import {readFileSync, writeFileSync, openSync, closeSync, unlinkSync} from "node:fs";
import {setTimeout as pause} from "node:timers/promises";
import {createClient} from "@supabase/supabase-js";
import {canRemind} from "../lib/contact.ts";
import {sendZohoTestMessage, testRecipient} from "../lib/zohoOutboundTest.ts";

const args=process.argv.slice(2);
const execute=args.length===1 && args[0]==="--run";
if(args.length && !execute) throw Error("Usa --run para ejecutar la prueba autorizada.");
const offsets=[1,3,5];
if(!execute) {
 console.log(JSON.stringify({mode:"preview",recipient:testRecipient,initialEmails:1,reminderMinutes:offsets,stopOnReplyOrOptOut:true,maxEmails:4},null,2));
 process.exit(0);
}
if(process.env.PEI_ZOHO_SEQUENCE_TEST!=="true") throw Error("Falta habilitar expresamente la secuencia de prueba.");
const privateFile=new URL("../.env.zoho-outbound.local",import.meta.url);
const journalFile=new URL("../.env.zoho-sequence-journal.local",import.meta.url);
const lockFile=new URL("../.env.zoho-sequence-lock.local",import.meta.url);
const lock=openSync(lockFile,"wx");
const dbEnv=Object.fromEntries(readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/).filter(x=>x.includes("=")).map(x=>{const i=x.indexOf("=");return[x.slice(0,i),x.slice(i+1)];}));
const expectedUrl="https://qzmhrjofalmzxkltctlf.supabase.co";
let config,db,candidateId;
async function checked(query) {
 const result=await query;
 if(result.error) throw Error("No se pudo verificar el estado del candidato de prueba.");
 return result.data;
}
function log(event,details={}) {
 writeFileSync(journalFile,JSON.stringify({event,at:new Date().toISOString(),candidateId,...details}),{encoding:"utf8"});
 console.log(event);
}
async function currentCandidate() {
 return (await checked(db.from("candidates").select("*").eq("id",candidateId).eq("email",testRecipient).single()));
}
try {
 // A new journal is required for each explicitly reviewed run. An uncertain send must never be retried automatically.
 const journal=openSync(journalFile,"wx");closeSync(journal);
 if(dbEnv.SUPABASE_URL!==expectedUrl) throw Error("La prueba requiere el proyecto Supabase de pruebas.");
 config=JSON.parse(readFileSync(privateFile,"utf8"));
 db=createClient(expectedUrl,dbEnv.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const existing=await checked(db.from("candidates").select("id").eq("email",testRecipient));
 if(existing.length) throw Error("El correo ya tiene un perfil. Revisa su estado antes de iniciar otra prueba.");
 const candidate=(await checked(db.from("candidates").insert({
 email:testRecipient,first_name:"Perfil de prueba",last_name:"Secuencia PEI",
 score:82,classification:"A",studies_completed:true,education:"technical",profile:"technician",specialty:"mechanical",
 pei_version:"PEI-1.0",pei_eligible:true,consent:true,email_consent:true,manual_status:"Videoconferencia",
 notes:"PRUEBA autorizada con correo propio. Recordatorios acelerados a 1, 3 y 5 minutos en ejecución local.",
 }).select("id")))[0];
 candidateId=candidate.id;
 log("initial_sending");
 const initial=await sendZohoTestMessage(config,0);
 const confirmedAt=new Date().toISOString();
 await checked(db.from("candidates").update({invitation_sent_at:confirmedAt}).eq("id",candidateId));
 log("initial_confirmed",{messageId:initial.messageId,confirmedAt});
 for(let i=0;i<offsets.length;i++) {
  const due=Date.parse(confirmedAt)+offsets[i]*60000;
  while(Date.now()<due) {
   if(!canRemind(await currentCandidate(),"email")) {log("sequence_cancelled");process.exitCode=0;break;}
   await pause(Math.min(5000,Math.max(0,due-Date.now())));
  }
  const candidate=await currentCandidate();
  if(!canRemind(candidate,"email")) {log("sequence_cancelled");break;}
  log("reminder_sending",{step:i+1});
  const result=await sendZohoTestMessage(config,i+1);
  log("reminder_confirmed",{step:i+1,messageId:result.messageId});
 }
 log("test_finished");
} catch(error) {
 log("review_required");
 console.error(error instanceof Error?error.message:"La prueba necesita revisión.");
 process.exitCode=1;
} finally {
 if(config?.refreshToken) {
  try {
   const result=await fetch("https://accounts.zoho.com/oauth/v2/token/revoke",{method:"POST",redirect:"error",
    signal:AbortSignal.timeout(15000),body:new URLSearchParams({token:config.refreshToken})});
   console.log(result.ok?"Acceso de prueba revocado.":"Revisar revocación del acceso.");
  } catch { console.log("Revisar revocación del acceso."); }
 }
 closeSync(lock);unlinkSync(lockFile);
}
