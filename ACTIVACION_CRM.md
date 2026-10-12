# Actualización del CRM TalentoBrücke

Base: repositorio público fiveseasonsrealty-ux/TALENTOBRUCKE-CRM, revisión 01df85c.
Esta copia está preparada para revisión y despliegue. No se ha modificado producción ni enviado correos reales.

## Cambios

- Embudo: Nuevo, Contactado, Videoconferencia, Trámites visado, Trámite título, Contacto Alemania.
- Los estudios incompletos se muestran como No apto; se conserva el expediente y su etapa histórica. Se consultan mediante VER NO APTOS en Candidatos. Los estudios sin información permanecen visibles, pero no reciben invitación.
- Invitación: estudios terminados, score total estrictamente mayor de 50, consentimiento y estado Nuevo. El score 50 no cumple. Los estados Contactado, posteriores y antiguos quedan excluidos de los envíos.
- Se conserva la etapa al reenviar el formulario público. El reenvío del formulario no borra el historial de invitaciones.
- Se utiliza el texto de Carta_Candidatos_Mejorada.docx, personalizando [Nombre]. Se sustituye la llamada final a continuar la evaluación por responder al correo y se añade la instrucción de enviar disponibilidad y zona horaria. No se han verificado ni actualizado las cifras de mercado de la carta del usuario.
- Remitente y respuestas: info@talentobruecke.com. El destinatario recibe texto plano, no un adjunto Word.
- El proveedor debe aceptar el envío antes de registrar la fecha y cambiar Nuevo a Contactado. Esto no garantiza entrega ni lectura. No se retrocede una etapa si se cambió durante el envío.
- Cola con un solo registro por candidato, reclamación atómica e identificador de idempotencia. Un resultado incierto queda en revisión, sin reenvío automático. Los candidatos que compartan el mismo expediente/email no reciben una segunda invitación de esta campaña.
- Autenticación también en las API administrativas de correos, actividades, seguimientos, estados e invitaciones; el formulario de evaluación sigue siendo público.

## Activación, en este orden

1. Hacer respaldo de Supabase y comprobar que el repositorio no ha cambiado respecto de la revisión base. Aplicar únicamente los cambios de esta entrega, sin reemplazar modificaciones posteriores.
2. En Supabase SQL Editor, ejecutar `supabase/migrations/202610_crm_invitations.sql`. Es transaccional y se puede repetir. No elimina candidatos ni envía correos. Añade a la cola los candidatos actuales aptos en estado Nuevo. No ejecutar `schema.sql` para actualizar una base existente.
3. Publicar la copia revisada en el repositorio conectado a Vercel. En la primera publicación mantener `AUTO_INVITATIONS_ENABLED=false`.
4. Mantener las variables existentes SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, CRM_USER, CRM_PASSWORD. Añadir CRON_SECRET con un valor aleatorio fuerte en Vercel (no ponerlo en GitHub ni compartirlo por chat). La tarea programada usa el encabezado Bearer que proporciona Vercel. Las credenciales no se incluyen en esta entrega.
5. Revisar /crm/candidatos, /crm/embudo y /crm/invitaciones. Los candidatos con estados anteriores se conservan; el embudo avisa de ellos. Revisar individualmente antes de asignarles alguna de las seis etapas. Cambiarlos a Nuevo puede hacerlos elegibles para invitación, por lo que no debe hacerse si ya fueron contactados.
6. Comprobar que info@talentobruecke.com recibe respuestas. La configuración del remitente no establece por sí sola un buzón de recepción. Revisar especialmente si cambió Google Workspace por Zoho.
7. Probar con una cuenta de correo propia en un entorno separado y un candidato ficticio con consentimiento y score >50. Verificar correo, respuesta, fecha y Contactado; reenviar su formulario y comprobar que no se repite la carta. Mantener automatización desactivada en otras previews.
8. Activar AUTO_INVITATIONS_ENABLED=true en producción y volver a desplegar. Los nuevos formularios se procesan al terminar de guardarse. La cola antigua y los pendientes se procesan además diariamente a las 14:00 UTC, hasta diez por ejecución. El botón del panel permite procesar otro lote de diez sin esperar al día siguiente. No hace falta contratar otro plan para una frecuencia mayor; esta entrega no configura esa frecuencia.

## Seguimiento de incidencias

- Consultar /crm/invitaciones. «En proceso» persistente o «Requiere revisión» requiere cotejar el resultado con Resend antes de actuar.
- Si Resend confirma aceptación, un administrador puede completar el registro usando `complete_candidate_invitation` con el UUID y el ID real del mensaje; si la fila está en review debe devolverla a sending en la misma transacción antes de completar. Nunca inventar un ID.
- Solo si se confirma que no se envió, un administrador puede devolver la fila a pending. El próximo proceso volverá a comprobar estudios, score, consentimiento y etapa. No reiniciar filas sent ni reintentar resultados desconocidos: la protección de idempotencia del proveedor tiene una duración limitada.
- Si falta la configuración de email no se reclaman trabajos. Si falla el proceso de fondo, la cola permanece disponible para la tarea diaria o el botón.
- Para detener envíos, poner AUTO_INVITATIONS_ENABLED=false y volver a desplegar. Esto no retira mensajes ya aceptados por el proveedor ni borra historial.

## Verificación local realizada

- Compilación de producción y comprobación TypeScript.
- Pruebas con PostgreSQL embebido (PGlite): migración repetible, corte 50/51, estudios incompletos/desconocidos, consentimiento, exclusión de contactados y etapas avanzadas, un único reclamo, finalización repetida sin actividad duplicada, conservación de etapas y prohibición de ejecutar funciones desde anon.
- No se han utilizado credenciales reales ni realizado pruebas de entrega con Resend/Supabase de producción.

Límites heredados: las listas muestran hasta 500 expedientes. La agenda mantiene seguimientos anteriores para no descartarlos. La clasificación profesional existente se conserva; la regla score >50 se aplica a la invitación.
