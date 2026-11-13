# PEI v1.0 · entrega para revisión

Estado: implementación local en la rama test/pei-v1. Base: 8dc89b0. Sin push a GitHub, sin despliegue, sin acceso a Supabase de producción y sin mensajes reales.

## Reglas aprobadas

- Alemán /35: ninguno 0, A1 5, A2 10, B1 20, B2 30, C1 o superior 35.
- Formación /25: técnica formal, tecnólogo, ingeniería/licenciatura o maestría técnica concluida: 25 por igual. Incompleta o no relacionada: 0 y sin contacto.
- Experiencia /20: ninguna 0; menos de 2 años 7; 2–4 años 12; 5–7 años 17; 8 o más 20.
- Especialidad /10: mecánica, industrial, eléctrica, mecatrónica, automatización y electrónica industrial 10; mantenimiento 9; IT 8; otra técnica 5; no técnica 0 y sin contacto.
- Motivación /10: interés serio, preparación en 12 meses o cuanto antes 4; aprender alemán: sí 3; movilidad: sí 3. Exploración, tal vez o no: 0 en el componente correspondiente.
- A: 75–100; B: 50–74; C: 0–49. Sin alemán o nivel desconocido: máximo B.
- La categoría y la aptitud son independientes. Un total alto nunca autoriza contactar a un no apto.
- Contacto: apto, mínimo 50, autorización de tratamiento de datos, consentimiento explícito para el canal y sin baja. El email debe coincidir con el expediente.

## Cambios preparados

El formulario mantiene la aceptación del tratamiento de datos y una casilla opcional de contacto por email, desmarcada. El teléfono es opcional; no se solicita autorización de WhatsApp en el nuevo formulario. Rechaza respuestas de puntuación desconocidas y estudios contradictorios.

La migración conserva una instantánea del resultado anterior y crea un histórico por cada formulario y recálculo futuro. Los resultados ya sobrescritos antes de esta entrega no pueden recuperarse sin respaldos externos. La ficha muestra versión, desglose, evaluaciones conservadas y vista previa del correo personalizado. Conserva las etapas y actividades anteriores.

El botón de recálculo no envía ni encola mensajes. La API administrativa permite recalcular entre 1 y 100 identificadores explícitos por petición y devuelve el resultado por candidato. Evita sobrescribir una evaluación que cambió durante el cálculo. Los consentimientos antiguos no se convierten automáticamente en autorizaciones de email o WhatsApp.

## Recordatorios: preparación, sin activación

Una secuencia se prepara solo después de la aceptación del primer email por el proveedor: email a las 24 h, email a las 48 h y email a las 72 h. Los tres pasos requieren consentimiento para email. La aceptación del proveedor no garantiza entrega o lectura.

El mensaje de las 24 h recuerda que se envió la evaluación al email proporcionado e indica revisar también spam o correo no deseado.

Registrar respuesta detiene todos los pasos pendientes. Registrar baja detiene la secuencia y bloquea ambos canales; estas acciones quedan en el historial y son idempotentes. El formulario no reactiva una baja o respuesta previa. Retirar el permiso de un canal cancela sus pendientes.

La tabla de recordatorios queda en estado preparado: no hay tarea que despache recordatorios. La recepción automática de respuestas requiere conectar y verificar el buzón Zoho. La integración WhatsApp queda fuera de esta estrategia. Hasta entonces, el equipo registra respuestas y bajas desde la ficha. No basta con configurar el remitente de email para detectar respuestas.

Un permiso histórico de WhatsApp no autoriza ninguno de los tres recordatorios. Los permisos y comunicaciones anteriores se conservan como historial.

## Revisión en entorno separado

1. Mantener PEI_OUTBOUND_ENABLED=false y AUTO_INVITATIONS_ENABLED=false. No usar credenciales de producción.
2. En una base vacía de prueba: aplicar supabase/schema.sql, luego 202610_crm_invitations.sql y luego 20261109_pei_v1.sql y finalmente 20261110_email_only_reminders.sql. En una copia existente, verificar el esquema e historial de migraciones y aplicar solo las pendientes. No reemplazar tablas.
3. Usar candidatos ficticios para comprobar formulario, lista de no aptos, ficha, recálculo, correo en vista previa, registro de respuesta y baja.
4. Contrastar el esquema real de Supabase con la migración antes de cualquier cambio externo autorizado. Esta entrega no ha consultado el esquema vivo.
5. GitHub no se ha actualizado: publicar una rama puede disparar una vista previa automática de Vercel y requiere revisar primero esa configuración.

No ejecutar los pasos de producción de ACTIVACION_CRM.md: pertenecen a la entrega anterior. Esta entrega exige aprobación explícita para desplegar, migrar producción o habilitar envíos.

## Verificación

- Once pruebas automatizadas aprobadas con las versiones de package-lock.json: pesos aprobados, cortes A/B/C, formación equivalente, exclusiones, consentimiento por canal, horario de recordatorios, aviso de spam, migración repetible, históricos, recálculo sin contacto, corte de 50, reclamo único, respuesta y baja.
- Comprobación TypeScript y compilación de Next.js aprobadas.
- Pruebas HTTP locales: formulario público, protección de API administrativa, rechazo de formulario inválido y bloqueo de email antes de acceder a base o proveedor.
- No se realizaron pruebas de entrega reales ni pruebas contra Supabase de producción.

## Aislamiento de campañas

PEI_TEST_MODE=true desactiva el píxel Meta en el entorno de prueba, para no registrar PageView ni Lead de candidatos ficticios. Esta variable se configura solo para pruebas; el comportamiento habitual se mantiene cuando no está activada.

## Validación conectada y actualización de seguridad

Se conectó exclusivamente el proyecto Supabase talentobrucke-pei-pruebas (qzmhrjofalmzxkltctlf). Las pruebas de integración verificaron registro, reenvío, igualdad de formación, cortes, exclusiones, preservación de etapas e históricos, recálculo, baja y bloqueo de ambos caminos de envío. Se usaron solo datos ficticios y se bloquearon los envíos.

Next.js se actualizó de 16.4.0 a 16.4.5 tras detectar vulnerabilidades en la versión instalada. La revisión posterior de dependencias de producción no encontró vulnerabilidades conocidas. El archivo de conexión local está excluido de Git y de los paquetes de entrega.

## Cambio de estrategia · solo correo

Los tres recordatorios usan email, a las 24, 48 y 72 horas del envío inicial confirmado. No se necesita contratar un proveedor WhatsApp para esta secuencia. La migración adicional convierte solo recordatorios preparados que aún tienen autorización de email y cancela los demás; no reactiva secuencias canceladas ni altera comunicaciones ya enviadas. Antes de activar, conectar la recepción de Zoho y probar con cuentas propias.

Cambio aplicado también al proyecto Supabase de pruebas qzmhrjofalmzxkltctlf. Verificación: cero recordatorios WhatsApp preparados y cero invitaciones enviadas. Producción permanece sin modificar.

## Recepción de Zoho · preparación local

Se añadió un receptor desactivado con firma HMAC, alta inicial cifrada de una sola vez, deduplicación y cancelación transaccional de recordatorios. Ver ZOHO_INBOUND_REVIEW.md. No se ha publicado, conectado a Zoho ni aplicado su migración a Supabase remoto. La programación de envíos sigue desactivada y pendiente de completar.

El receptor de Zoho ya se publicó solo en Supabase de pruebas (zoho-pei-receptor), sin usar Vercel ni cambiar de plan. GET de estado verificado y procesamiento desactivado. Sus dos tablas se crearon en la base de pruebas. Zoho y el CRM de clientes reales siguen sin modificaciones.
