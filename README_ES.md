# TalentoBrücke Candidate CRM — MVP

Esta primera versión ya contiene la conexión fundamental:

**Anuncio Meta → /evaluacion → formulario → /api/leads → Supabase → /crm**

## ¿Qué hace?

- Landing de evaluación profesional.
- Formulario en 4 pasos.
- Guarda candidatos automáticamente.
- Calcula score 0–100.
- Clasifica:
  - 75–100: Candidato potencial prioritario
  - 60–74: Lead cualificado
  - 40–59: Lead en desarrollo
  - 0–39: No prioritario
- Guarda UTMs de Meta Ads.
- Evita duplicados simples por email.
- Guarda First Touch y Last Touch.
- CRM protegido por usuario y contraseña.
- Dashboard básico con candidatos y KPIs.

## URLs cuando esté publicado

- Landing: `https://tu-dominio.com/evaluacion`
- CRM: `https://tu-dominio.com/crm`

El anuncio de Meta debe apuntar a la landing, por ejemplo:

`https://tu-dominio.com/evaluacion?utm_source=meta&utm_medium=paid_social&utm_campaign=campana01&utm_content=A1`

Cuando el candidato pulse el CTA, complete y envíe el formulario:
1. La landing envía los datos internamente al sistema.
2. Se calcula el score.
3. Se guarda el candidato.
4. El candidato aparece en `/crm`.

No necesitas copiar nada manualmente.

---

# Para ponerlo en funcionamiento

Necesitaremos solamente tres acciones externas:

## 1. Crear una base de datos en Supabase
Supabase será el lugar seguro donde se guardan los candidatos.

- Crear un proyecto en Supabase.
- Abrir el editor SQL.
- Copiar y ejecutar el archivo `supabase/schema.sql`.

## 2. Publicar la aplicación
La opción sencilla recomendada es Vercel.

Hay que cargar este proyecto y configurar cuatro datos secretos:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRM_USER`
- `CRM_PASSWORD`

Nunca publicar la `SUPABASE_SERVICE_ROLE_KEY` en una página o documento público.

## 3. Usar la URL en Meta Ads

Ejemplo:

`https://tu-dominio.com/evaluacion?utm_source=meta&utm_medium=paid_social&utm_campaign=Captacion_MX_CO&utm_content=A1`

Para A2 solo cambiamos:

`utm_content=A2`

Así el CRM sabrá qué anuncio originó cada candidato.

---

# Qué falta para una versión 2

La primera versión se concentra en captar y clasificar. Después podemos añadir:

- Ficha individual editable.
- Notas e historial visual.
- Filtros avanzados.
- Exportación CSV.
- Email automático interno.
- Email automático al candidato.
- Meta Conversions API.
- Inversión por campaña y CPQL.
- Login con usuarios y roles.
- Política de privacidad enlazada.
- Dashboard más completo.

## Seguridad

El CRM está protegido inicialmente mediante usuario/contraseña configurados en el servidor.

Para producción avanzada recomendamos migrar el acceso a Supabase Auth con cuentas individuales y mantener las políticas de seguridad de base de datos.

---

TalentoBrücke — Career Migration Partner
