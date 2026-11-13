# Zoho · receptor preparado para revisión

Estado: receptor publicado únicamente en Supabase de pruebas, proyecto qzmhrjofalmzxkltctlf. Migración aplicada a esa base de pruebas. Zoho no se ha modificado y no se han enviado correos. La recepción permanece desactivada.

## Comportamiento

POST /api/webhooks/zoho/[token] recibe avisos de Zoho Mail. Requiere un token privado generado con al menos 32 bytes aleatorios y valida la firma HMAC SHA-256 del cuerpo original, según la documentación oficial. Permanece desactivado si ZOHO_WEBHOOK_ENABLED no es true.

Solo procesa avisos dirigidos al buzón configurado. Descarta mensajes del propio buzón y remitentes desconocidos no crean candidatos. Una respuesta de un candidato que ya recibió el contacto inicial detiene la secuencia. Una solicitud explícita BAJA o equivalente bloquea ambos permisos de contacto existentes; el plan actual solo envía email.

La palabra BAJA citada dentro de la carta original no se interpreta por sí sola como una baja. Las solicitudes ambiguas detienen la secuencia como respuesta y pueden revisarse manualmente. La firma autentica el aviso de Zoho, no demuestra por sí sola la identidad del remitente del correo.

Los avisos duplicados no repiten actividades. Recálculos, puntuación, etapa e históricos de evaluación no se modifican. No se guardan el asunto, el cuerpo del correo ni sus adjuntos: solo un identificador hash, el candidato si coincide, la fecha y el resultado de procesamiento.

Los identificadores numéricos largos de Zoho se conservan sin redondeo. Se rechazan cuerpos de más de 256 KiB, firmas inválidas, eventos malformados y fechas futuras anómalas. Si falla la base, se devuelve un error temporal para permitir reintento; nunca se responde como aplicado sin confirmar el registro.

## Alta inicial segura

Zoho entrega x-hook-secret en el primer aviso y x-hook-signature en los avisos. No se acepta un secreto nuevo durante el procesamiento normal.

Existen dos opciones: configurar un secreto conocido en el entorno, o abrir explícitamente una ventana de alta de hasta diez minutos. La segunda requiere un token privado y una clave de cifrado AES-256-GCM guardada fuera de la base. El primer secreto queda cifrado en una tabla protegida y el primer aviso solo completa el alta: no afecta candidatos. Después no se permite sustituir el secreto desde las cabeceras.

Se debe cerrar la ventana de alta después de registrar la conexión. La pérdida de la clave de cifrado requiere un procedimiento explícito de reconfiguración; el sistema falla cerrado en vez de aceptar otra clave automáticamente. No publicar tokens, claves, URLs privadas ni datos del alta en capturas o registros.

## Plan concreto para una prueba posterior autorizada

1. Se utilizó una Edge Function del Supabase de pruebas existente, sin crear otro proyecto ni contratar un plan de pago. El plan Hobby de Vercel no se cambió.
2. Aplicar 20261110_zoho_inbound.sql únicamente al proyecto Supabase de pruebas, después de las migraciones PEI y de email exclusivo. La migración ya se probó con PostgreSQL local embebido y se aplicó al proyecto Supabase de pruebas.
3. Configurar los secretos del receptor en el entorno de pruebas. Mantener PEI_OUTBOUND_ENABLED=false y AUTO_INVITATIONS_ENABLED=false; dejar vacía la clave de envío de Resend.
4. Con autorización para cambiar Zoho, crear un aviso saliente limitado inicialmente a un remitente propio de prueba y a un asunto de prueba. No copiar correos de clientes reales al entorno de pruebas. Para interpretar BAJA se necesita el texto nuevo del mensaje; la opción de datos limitados de Zoho no incluye ese texto. Una función personalizada puede limitar el contenido a los campos necesarios.
5. Comprobar alta, respuesta, BAJA, reintento duplicado, firma incorrecta y fallo temporal. Revisar que se cancelan los tres emails y no existe ningún envío.
6. Solo después decidir, con aprobación explícita, la activación de recordatorios y el paso a producción. La tarea que despacha los emails sigue pendiente de implementación y activación; esta entrega prepara únicamente su cancelación por correo entrante.

## Validación realizada

Trece pruebas automatizadas y siete comprobaciones HTTP del receptor compilado, más una comprobación final de que queda desactivado: reglas PEI, recordatorios solo por email, migraciones repetibles, firmas, cifrado, alta de una sola vez, límites, fechas, números largos, BAJA citada, deduplicación, cancelación transaccional y protección de las tablas.

Fuente del protocolo: https://www.zoho.com/mail/help/dev-platform/webhook.html#outgoing-webhooks

## Publicación en Supabase de pruebas

Función: zoho-pei-receptor. Dirección pública de estado: https://qzmhrjofalmzxkltctlf.supabase.co/functions/v1/zoho-pei-receptor

GET verificado: 200, entorno test, receiverEnabled=false, sendsEnabled=false. POST de comprobación verificado: 503 con resultado disabled. Esta respuesta de bloqueo es intencional; no es un fallo de despliegue. La URL de estado no es todavía la URL privada de conexión de Zoho: esta última incluirá un token privado que se provisionará al autorizar la conexión.

El adaptador rechaza otros proyectos Supabase. La comprobación JWT de la pasarela se sustituyó por el token privado y la firma HMAC del receptor, para admitir avisos de Zoho sin dar acceso anónimo a los datos. La recepción sigue apagada, no hay secretos Zoho provisionados ni ventana de registro abierta.

La migración añadió zoho_webhook_config y candidate_mail_events con protección por filas y permisos restringidos. No cambió datos de candidatos. No se copiaron credenciales de clientes reales ni se creó un envío.

Se usó el plan Free existente. No se aceptó ningún pago, prueba de pago, cambio de plan o suscripción. La cuota publicada de Supabase es de 500.000 invocaciones para Free; cualquier cambio de plan o costo nuevo requiere consultar al usuario.

Para una futura actualización, el código fuente está en supabase/functions/zoho-pei-receptor/index.ts y reutiliza lib/zohoEdge.ts y lib/zohoWebhook.ts. El editor web recibió un archivo combinado generado a partir de esos módulos.

## Verificación inicial de Zoho, 10 noviembre 2026
Se comprobó que la solicitud de registro incluye x-hook-secret y omite x-hook-signature. Se preparó una opción explícita ZOHO_ALLOW_UNSIGNED_REGISTRATION (desactivada por defecto). Solo permite registrar la clave una vez, por la ruta privada, durante una ventana máxima de diez minutos y sin procesar candidatos. Las solicitudes posteriores siguen exigiendo firma válida. Activación pendiente de confirmación del usuario. No se han enviado correos ni activado recordatorios.

## Registro completado
El usuario autorizó expresamente la verificación inicial sin firma. Zoho guardó PEI_PRUEBA_SOLO_GMAIL habilitado; Supabase confirmó la clave registrada y cifrada. Se desactivó ZOHO_ALLOW_UNSIGNED_REGISTRATION y se cerró ZOHO_WEBHOOK_ENROLL_UNTIL (1970-01-01). La comprobación posterior sin firma devuelve 401. Salud del receptor: entorno test, recepción activa, envíos desactivados. Filtro exclusivo: fiveseasonsrealty@gmail.com y asunto PEI-PRUEBA. Pendiente prueba manual de recepción; no se han enviado correos ni contratado planes.

## Programación en Supabase de pruebas
Se instaló pei-test-email-reminders con frecuencia de un minuto. El endpoint autenticado ejecuta simulación por defecto. Las fechas de vencimiento siguen siendo 24, 48 y 72 horas después de invitation_sent_at.
Los envíos confirmados conservan su estado sent. Los resultados inciertos quedan en review y bloquean reintentos automáticos. Las reservas impiden duplicados concurrentes. El emisor publicado solo permite el Gmail propio aprobado.
Se corrigieron los dos recordatorios enviados en la prueba local del 11 de noviembre, que previamente figuraban cancelados. No se inventaron horas exactas de envío.
El envío desde la nube requiere credenciales nuevas de Zoho y activación explícita de PEI_TEST_REMINDERS_ENABLED. La cuenta de producción y sus envíos requieren autorización independiente.

## Envío desde Supabase verificado
El usuario autorizó almacenar el permiso de Zoho en los secretos del proyecto de pruebas y probar hasta cuatro correos a su Gmail.
La carta inicial se aceptó a las 15:17:21 UTC del 11 de noviembre. El primer recordatorio se adelantó únicamente para esta prueba. Supabase Cron lo ejecutó a las 15:19 UTC y Zoho confirmó su aceptación. Los otros vencimientos se conservaron a las 48 y 72 horas. La respuesta llegó a las 15:22:25 UTC y se procesó a las 15:22:28 UTC. Resultado en base de datos: primer recordatorio sent con identificador de Zoho, segundo y tercero cancelled.
El historial de la prueba local anterior quedó archivado en activities antes de reutilizar el perfil ficticio. Al finalizar, PEI_TEST_REMINDERS_ENABLED quedó en false. El reloj sigue comprobando vencimientos en simulación. Los secretos de envío siguen protegidos en Supabase de pruebas y la copia temporal local fue retirada.
La prueba verifica la ejecución del recordatorio en la nube y la cancelación real por respuesta. La carta inicial de esta prueba se disparó desde el equipo local. La activación en producción, ampliación del destinatario permitido y conexión del envío inicial normal del CRM con Zoho siguen pendientes de autorización y puesta en marcha.

## Restricción del canal de envío detectada antes del lote real
La política oficial de Zoho Mail consultada el 11 de noviembre de 2026 excluye correos masivos, automatizados y transaccionales del uso del buzón normal: https://www.zoho.com/mail/help/usage-policy.html . Las pruebas anteriores demostraron funcionamiento técnico, pero no validaron esta condición del servicio. El adaptador de Zoho Mail no debe activarse para producción. El interruptor PEI_TEST_REMINDERS_ENABLED permanece en false.
Debe conectarse un proveedor adecuado para envío transaccional. El CRM original ya incluye Resend. Su cuenta, cuota disponible, dominio y supresiones deben revisarse antes de reutilizar ese canal. La recepción y respuesta por Zoho se puede conservar.
El lote histórico de 277 borradores está congelado por destinatario y contenido en un archivo local de trabajo. No se han enviado correos del lote. El cambio de proveedor para los recordatorios y la prueba final de entrega quedan pendientes de acceso a la cuenta y autorizaciones aplicables.
