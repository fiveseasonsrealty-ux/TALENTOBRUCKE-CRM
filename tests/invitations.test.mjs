import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { isEligible, stages, displayStatus } from '../lib/crm.ts';
import { invitationLetter } from '../lib/invitationLetter.ts';

test('strict score threshold, completed studies, six stages and reply invitation', () => {
  for (const score of [0,49,50,null,undefined]) assert.equal(isEligible({score,studies_completed:true}),false);
  assert.equal(isEligible({score:51,studies_completed:true}),true);
  assert.equal(isEligible({score:100,studies_completed:false}),false);
  assert.equal(isEligible({score:100,studies_completed:null}),false);
  assert.equal(displayStatus({studies_completed:false,manual_status:'Contactado'}),'No apto');
  assert.equal(stages.length,6);
  const letter=invitationLetter('Ana');
  assert.match(letter.subject,/Ana/);
  assert.match(letter.text,/Hola, Ana/);
  assert.match(letter.text,/responde a este correo indicando tu disponibilidad/);
  assert.ok(!letter.text.includes('[Nombre]'));
});

test('migration, eligibility, atomic claims, idempotent completion and preservation', async () => {
  const db=new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    await db.exec(readFileSync('supabase/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
    const insert=async (email,score,studies,status='Nuevo',consent=true) =>
      (await db.query('insert into candidates(email,score,studies_completed,manual_status,consent) values($1,$2,$3,$4,$5) returning id',[email,score,studies,status,consent])).rows[0].id;
    const eligible=await insert('eligible@example.test',51,true);
    await insert('threshold@example.test',50,true);
    await insert('incomplete@example.test',90,false);
    await insert('unknown@example.test',90,null);
    await insert('manual@example.test',90,true,'Contactado');
    await insert('advanced@example.test',90,true,'Videoconferencia');
    await insert('no-consent@example.test',90,true,'Nuevo',false);
    const migration=readFileSync('supabase/migrations/202610_crm_invitations.sql','utf8');
    await db.exec(migration); await db.exec(migration);
    assert.equal((await db.query('select * from candidate_invitations')).rows.length,1);
    const claim=async id=>(await db.query('select * from claim_candidate_invitation($1)',[id])).rows;
    assert.equal((await claim(eligible)).length,1);
    assert.equal((await claim(eligible)).length,0);
    assert.equal((await db.query('select manual_status from candidates where id=$1',[eligible])).rows[0].manual_status,'Nuevo');
    await db.query('select complete_candidate_invitation($1,$2)',[eligible,'test-provider-id']);
    await db.query('select complete_candidate_invitation($1,$2)',[eligible,'test-provider-id']);
    assert.equal((await db.query('select manual_status from candidates where id=$1',[eligible])).rows[0].manual_status,'Contactado');
    assert.equal((await db.query('select * from activities')).rows.length,1);
    await db.query("update candidates set manual_status='Nuevo' where id=$1",[eligible]);
    assert.equal((await claim(eligible)).length,0);
    const changed=await insert('changed@example.test',70,true);
    await db.query("update candidates set manual_status='Contactado' where id=$1",[changed]);
    assert.equal((await claim(changed)).length,0);
    const completed=await insert('progress@example.test',70,true);
    await claim(completed);
    await db.query("update candidates set manual_status='Contacto Alemania' where id=$1",[completed]);
    await db.query('select complete_candidate_invitation($1,$2)',[completed,'other-id']);
    assert.equal((await db.query('select manual_status from candidates where id=$1',[completed])).rows[0].manual_status,'Contacto Alemania');
    const waiting=await insert('later@example.test',45,true);
    await db.query('update candidates set score=51 where id=$1',[waiting]);
    assert.equal((await claim(waiting)).length,1);
    await db.query("update candidate_invitations set state='review' where candidate_id=$1",[waiting]);
    assert.equal((await claim(waiting)).length,0);
    assert.equal((await db.query("select has_function_privilege('anon','claim_candidate_invitation(uuid)','execute') as allowed")).rows[0].allowed,false);
  } finally {await db.close();}
});
