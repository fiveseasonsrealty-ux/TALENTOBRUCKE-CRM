import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual, createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
const MAX_BYTES = 256 * 1024;
export type ZohoFilters = {allowedSenders?:readonly string[]; subjectPrefix?:string};
export type ZohoSettings = ZohoFilters & {enabled:boolean; token:string; mailbox:string; secret?:string; encryptionKey?:string; enrollUntil?:string; allowUnsignedRegistration?:boolean};
export type VerifiedMailEvent = {eventKey:string; sender:string; event:"REPLIED"|"OPTED_OUT"; receivedAt:string};
export type ZohoDependencies = {
 loadEncryptedSecret:()=>Promise<string|null>;
 saveEncryptedSecret:(value:string)=>Promise<boolean>;
 recordEvent:(event:VerifiedMailEvent)=>Promise<void>;
};
export function equalSecret(a:string,b:string) {
 const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length && timingSafeEqual(x,y);
}
export function verifyZohoSignature(raw:Uint8Array,signature:string,secret:string) {
 if(!secret || !/^[A-Za-z0-9+/]{43}=$/.test(signature))return false;
 return equalSecret(createHmac("sha256",secret).update(raw).digest("base64"),signature);
}
function encryptionKey(value:string) {
 if(!/^[a-f0-9]{64}$/i.test(value))throw Error("Invalid encryption configuration");return Buffer.from(value,"hex");
}
export function encryptZohoSecret(secret:string,key:string) {
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",encryptionKey(key),iv);
 const data=Buffer.concat([cipher.update(secret,"utf8"),cipher.final()]);
 return ["v1",iv.toString("base64"),cipher.getAuthTag().toString("base64"),data.toString("base64")].join(".");
}
export function decryptZohoSecret(value:string,key:string) {
 const [version,iv,tag,data,...extra]=value.split(".");if(version!=="v1"||extra.length||!iv||!tag||!data)throw Error("Invalid encrypted secret");
 const decipher=createDecipheriv("aes-256-gcm",encryptionKey(key),Buffer.from(iv,"base64"));
 decipher.setAuthTag(Buffer.from(tag,"base64"));return Buffer.concat([decipher.update(Buffer.from(data,"base64")),decipher.final()]).toString("utf8");
}
function addresses(value:unknown) {
 if(typeof value!=="string")return [];
 return (value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}/gi)||[]).map(s=>s.toLowerCase());
}
function firstReplyLine(value:unknown) {
 if(typeof value!=="string")return "";
 return value.replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi,"")
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,"").replace(/<br\s*\/?\s*>|<\/(?:p|div)>/gi,"\n")
  .replace(/<[^>]+>/g,"").replace(/&nbsp;/gi," ").split(/\r?\n/).map(s=>s.trim()).find(s=>s&&!s.startsWith(">"))||"";
}
const isOptOut=(s:string)=>/^(?:baja|unsubscribe|cancelar|no (?:quiero|deseo) recibir m[aá]s (?:correos|mensajes))[.!]?$/i.test(s.trim());
export function parseZohoMail(raw:string,mailbox:string,now=Date.now(),filters:ZohoFilters={}):VerifiedMailEvent|null {
 // Zoho's sample IDs exceed JS safe integers. Preserve the unquoted decimal before parsing.
 const normalized=raw.replace(/("messageId"\s*:\s*)([0-9]+)(?=\s*[,}])/g,(_,prefix,digits)=>prefix+'"'+digits+'"');
 const p=JSON.parse(normalized);
 if(!p || typeof p!=="object" || Array.isArray(p))throw Error("Invalid event");
 const from=addresses(p.fromAddress),to=addresses(p.toAddress);
 if(from.length!==1 || !to.includes(mailbox.toLowerCase()) || from[0]===mailbox.toLowerCase())return null;
 const subject=typeof p.subject==="string"?p.subject.replace(/^(?:(?:re|fw|fwd):\s*)+/i,"").trim():"";
 if(filters.allowedSenders && !filters.allowedSenders.map(v=>v.toLowerCase()).includes(from[0]))return null;
 if(filters.subjectPrefix && !subject.toLowerCase().startsWith(filters.subjectPrefix.toLowerCase()))return null;
 const id=p.messageId;
 if(typeof id!=="string" || !/^[A-Za-z0-9._:-]{1,200}$/.test(id))throw Error("Invalid message identifier");
 const time=Number(p.receivedTime ?? p.sentDateInGMT);
 if(!Number.isFinite(time)||time<0||time>now+300000)throw Error("Invalid received time");
 if(time<now-30*86400000)return null;
 const text=firstReplyLine(p.summary || p.html);
 return {eventKey:createHash("sha256").update(mailbox.toLowerCase()+"\0"+id).digest("hex"),sender:from[0],
  event:isOptOut(text)||isOptOut(subject)?"OPTED_OUT":"REPLIED",receivedAt:new Date(time).toISOString()};
}
async function readLimitedBody(req:Request) {
 if(Number(req.headers.get("content-length"))>MAX_BYTES)throw Error("Body too large");
 const reader=req.body?.getReader();if(!reader)return new Uint8Array();
 const parts:Uint8Array[]=[];let length=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>MAX_BYTES){await reader.cancel();throw Error("Body too large");}parts.push(value);}}finally{reader.releaseLock();}
 return Buffer.concat(parts);
}
const reply=(status:number,result:string)=>Response.json({result},{status,headers:{"Cache-Control":"no-store"}});
export async function receiveZoho(req:Request,routeToken:string,s:ZohoSettings,d:ZohoDependencies,now=Date.now()) {
 if(!s.enabled)return reply(503,"disabled");
 if(s.token.length<32 || !equalSecret(s.token,routeToken))return reply(401,"unauthorized");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.mailbox))return reply(503,"not_configured");
 let raw:Uint8Array;try{raw=await readLimitedBody(req);}catch{return reply(413,"body_too_large");}
 try{
  let secret=s.secret;
  if(!secret){
   if(!s.encryptionKey)return reply(503,"not_configured");
   const stored=await d.loadEncryptedSecret();
   if(stored)secret=decryptZohoSecret(stored,s.encryptionKey);
   else {
    // One-time, explicit registration window; never learn a new key during normal processing.
    const deadline=Date.parse(s.enrollUntil||"");
    if(!(deadline>now && deadline<=now+10*60000))return reply(503,"registration_required");
    const initial=req.headers.get("x-hook-secret")||"";
    const signature=req.headers.get("x-hook-signature")||"";
    // Zoho currently omits the signature on its initial verification POST.
    // This opt-in applies only to enrollment: private route, short window, no existing key, no candidate changes.
    if(initial.length<16||initial.length>2048 || (signature ? !verifyZohoSignature(raw,signature,initial) : !s.allowUnsignedRegistration))return reply(401,"unauthorized");
    if(!await d.saveEncryptedSecret(encryptZohoSecret(initial,s.encryptionKey)))return reply(409,"already_registered");
    return reply(200,"registered"); // Registration never changes a candidate.
   }
  }
  if(!verifyZohoSignature(raw,req.headers.get("x-hook-signature")||"",secret))return reply(401,"unauthorized");
  let event:VerifiedMailEvent|null;
  try{event=parseZohoMail(Buffer.from(raw).toString("utf8"),s.mailbox,now,s);}catch{return reply(400,"invalid_event");}
  if(!event)return reply(200,"ignored");
  await d.recordEvent(event);return reply(200,"accepted");
 }catch{return reply(503,"temporarily_unavailable");}
}
