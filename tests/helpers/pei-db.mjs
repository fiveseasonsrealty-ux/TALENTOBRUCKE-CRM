import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
export async function fixture(recipient='fiveseasonsrealty@gmail.com'){
 const pg=new PGlite();
 await pg.exec('create role anon;create role authenticated;create role service_role;');
 await pg.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
 for(const file of ['202610_crm_invitations.sql','20261109_pei_v1.sql','20261110_email_only_reminders.sql','20261110_zoho_inbound.sql','20261111_reminder_dispatch.sql','20261111_resend_dispatch.sql','20261112_production_reminders.sql'])await pg.exec(readFileSync('supabase/migrations/'+file,'utf8'));
 const rpc=async(name,args)=>{
  const values=Object.values(args),slots=values.map((_,i)=>'$'+(i+1));
  try{const {rows}=await pg.query('select * from '+name+'('+slots.join(',')+')',values);
   return {data:['claim_candidate_invitation','claim_pei_reminder','claim_pei_production_reminder'].includes(name)?rows:rows[0]?.[name],error:null};
  }catch(error){return {data:null,error};}
 };
 const db={rpc,from(table){let updates=null,filters=[];const chain={select(){return chain;},update(value){updates=value;return chain;},eq(k,v){filters.push([k,v]);return chain;},async single(){return {data:(await pg.query('select * from '+table+' where '+filters[0][0]+'=$1',[filters[0][1]])).rows[0],error:null};},async then(resolve,reject){try{const vals=Object.values(updates),set=Object.keys(updates).map((k,i)=>k+'=$'+(i+1));const where=filters.map(([k,v])=>{vals.push(v);return k+'=$'+vals.length;});await pg.query('update '+table+' set '+set.join(',')+' where '+where.join(' and '),vals);return resolve({error:null});}catch(e){return reject(e);}}};return chain;}};
 const {rows:[{id}]}=await pg.query("insert into candidates(email,first_name,score,classification,studies_completed,education,profile,specialty,pei_version,pei_eligible,pei_breakdown,evaluation_reason,consent,email_consent,manual_status) values($1,'Ana',82,'A',true,'technical','technician','mechanical','PEI-1.0',true,$2,'FORM_SUBMITTED',true,true,'Nuevo') returning id",[recipient,JSON.stringify({german:20,education:25,experience:17,specialty:10,motivation:10})]);
 return {pg,db,id};
}
