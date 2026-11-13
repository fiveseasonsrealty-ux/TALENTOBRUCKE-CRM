# Preparación de producción PEI · 12 noviembre 2026

Implementación local en la rama test/pei-v1. No desplegada en producción. Etapas y textos conservados.

## Estado observado

Vercel mantiene la producción en main, revisión 8dc89b0, dominio talentobruecke.com. La configuración de SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY aparece compartida entre Production y Preview. No se revelaron valores ni se modificó la configuración. No publicar una vista previa hasta separar sus variables; se agregó además un bloqueo en supabaseAdmin para rechazar la base real desde VERCEL_ENV=preview.

Supabase de producción contiene 429 candidatos, 963 actividades y 290 registros de invitación. Existen las funciones de invitaciones anteriores. No existen todavía candidate_evaluations ni candidate_reminders y no están instaladas pg_cron ni pg_net. No ejecutar schema.sql ni repetir sin revisión la migración de invitaciones que ya está instalada.

El panel del plan Free informa que no incluye respaldos automáticos. Se creó una copia privada de las tres tablas públicas del CRM con estructura, índices, funciones y disparadores. Su restauración local y las migraciones PEI se verificaron sin alterar puntuaciones, clasificaciones, etapas ni fechas de contacto anteriores; se crearon 429 instantáneas de evaluación. Esta copia no sustituye un dump completo de PostgreSQL: excluye Auth, Storage, Vault, roles globales y restauración completa de permisos. Renovarla inmediatamente antes de una migración autorizada. No se incluye en el paquete de entrega ni en Git.

## Componentes preparados

- lib/productionEdge.ts: entrada independiente para producción, URL exacta del proyecto real, recepción desactivada por defecto y verificación de firma de Zoho. Sin filtro de Gmail ni asunto de pruebas cuando se habilite expresamente.
- lib/productionReminders.ts: Resend para un recordatorio por ejecución; autenticación Bearer distinta del token de recepción; dos interruptores de activación, desactivados por defecto.
- supabase/migrations/20261112_production_reminders.sql: reserva atómica entre candidatos aptos con consentimiento y carta inicial confirmada; exclusión de respuestas/bajas y resultados inciertos; conserva los envíos aceptados. No crea tarea programada ni envía mensajes.
- supabase/scheduler-production-prepared.sql: plantilla para instalar el cron inactivo después de configurar un secreto en Vault. No ejecutada en ningún proyecto.
- Variables nuevas documentadas en .env.example. No se generaron ni guardaron credenciales nuevas de producción.

No ampliar el adaptador de pruebas: zoho-pei-receptor continúa restringido al proyecto y Gmail propios. La nueva función pei-production está solamente en archivos locales.

## Activación futura

1. Cerrar la prueba real del punto 2 en Gmail después de la renovación de cuota y confirmar cancelación por respuesta.
2. Separar las variables de las vistas previas de Vercel y comprobar la rama remota más reciente. La rama main remota también se verificó en GitHub: 8dc89b0d7f743e0f9b2c607af373949a4cfa25f4, coincidente con la revisión desplegada y la base de esta rama. Volver a comprobar antes de publicar.
3. Renovar y validar el respaldo; definir recuperación de permisos y servicios fuera de las tres tablas del CRM.
4. Revisar y aprobar el despliegue concreto con todos los interruptores de envío en false. Aplicar solo migraciones pendientes. No recalcular masivamente los candidatos antiguos.
5. Aprovisionar por separado los secretos del receptor y programador de producción. El registro sin firma no está habilitado en producción; la configuración de Zoho y su prueba requieren revisión antes de habilitar recepción para candidatos reales.
6. Verificar los nuevos formularios y el histórico; probar el recorrido de producción controlado, y solo después habilitar las comunicaciones reales autorizadas. Coordinar cuota con los 77 correos históricos pendientes.

## Validación

29 pruebas automatizadas aprobadas; comprobación TypeScript sin errores. Se agregaron pruebas de autenticación, configuración desactivada, proyecto incorrecto, envío a otro destinatario ficticio, respuesta firmada, cancelación, cuota/resultado incierto sin reenvío, permisos SQL y bloqueo de vistas previas. Las migraciones también se probaron sobre una reconstrucción local de columnas y restricciones observadas y sobre la copia privada real del CRM. Ninguna prueba produjo envíos reales.

Los scripts antiguos de prueba de Zoho no se deben usar como emisor definitivo. Resend es el emisor preparado; Zoho se conserva para recepción y respuesta del equipo.
