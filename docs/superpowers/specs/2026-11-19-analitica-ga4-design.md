# Analítica GA4 compartida con el panel de Travelhood

Fecha: 19/11/2026 · Tamaño: cambio pequeño.

## Por qué

LST comparte el panel `travelhood-admin` con Travelhood y Aleta Amarilla. El panel **lee GA4**; no recibe eventos. LST está registrado como instalación `lets-surf-together` con perfil `web`: muestra tráfico nativo de GA4 en cuanto se conecte su propiedad. Hoy la web no mide nada ni tiene aviso de cookies.

Las métricas comerciales de clientes distintos de Travelhood dependen de un adaptador aún pendiente en el panel. El estándar común (`travelhood-admin/docs/analytics-standard.md`) pide que las webs nuevas usen el vocabulario de eventos de Travelhood para que ese adaptador sea común.

## Objetivos

- GA4 en todas las páginas públicas, solo tras consentimiento expreso.
- Eventos comerciales con los nombres de Travelhood, `measurement_version=1` y valores controlados.
- Política de cookies actualizada y forma de cambiar la elección.

No objetivos: el adaptador comercial del panel (otro repo), Tag Manager, publicidad o remarketing.

Anti-objetivos: medir sin consentimiento; enviar nombres, correos, teléfonos o campos del formulario; renombrar eventos de Travelhood o emitir alias duplicados; rastrear despliegues de prueba.

## Enfoques considerados

1. **GA4 directo (gtag) con eventos de vocabulario Travelhood — elegido.** Es lo que lee el panel y lo que ya usan las otras dos webs.
2. Vercel Analytics: el panel no lo lee.
3. Google Tag Manager: añade una capa de configuración fuera del repo que el panel no necesita y dificulta probar los eventos.

## Diseño

- **Configuración:** `GA4_MEASUREMENT_ID` (`G-…`) en las variables de entorno de Vercel, solo en Production. Sin variable, el build no inyecta ni GA4 ni aviso: los previews no miden.
- **Inyección:** el build añade a cada página un bloque idempotente con el ID, el contexto de la página (`page_type`, `destination_slug` del viaje propietario) y `/analytics.js`.
- **Consentimiento:** aviso propio con «Aceptar» y «Rechazar» del mismo peso. La elección se guarda en `localStorage` (`lst-consent`). gtag **no se carga** hasta aceptar (Consent Mode v2 con `analytics_storage` y `ad_*` denegados por defecto; anuncios siempre denegados). Botón «Cambiar preferencias de cookies» en la página de cookies; al retirar el consentimiento se borran las cookies `_ga*`.
- **Eventos.** Todos, y también las vistas de página, llevan `measurement_version="1"` (texto, como Travelhood), `page_type` y `traffic_type` (`external` en el dominio público, `internal` con la cookie `lst_analytics_internal=1`, `developer` en el resto, estos dos con `debug_mode`):

| Acción | Evento | Contexto |
| --- | --- | --- |
| Vista de ficha de viaje | `destination_view` | `destination_slug` (viaje, no salida) |
| Abrir fechas y precios | `destination_dates_price_interaction` | `destination_slug`, `cta_location` |
| Abrir PDF del programa | `destination_pdf_download` | `destination_slug`, `cta_location` (solo clic) |
| WhatsApp en ficha o inscripción | `destination_whatsapp_click` | `destination_slug`, `cta_location` |
| Ir a inscripción | `destination_booking_click` | `destination_slug`, `cta_location`, `booking_provider=own_form` |
| Inscripción aceptada por Brevo | `registration_form_accepted` | `destination_slug` |
| Inscripción enviada que falla | `registration_form_error` | `destination_slug`, `error_category` (lista cerrada de Travelhood) |
| WhatsApp al final de las FAQ | `faq_contact_click` | `cta_location=faq_contact` |
| WhatsApp fuera de un viaje | `whatsapp_click` | `cta_location`, `whatsapp_topic` |

`cta_location` sale de una tabla fija en `analytics.js`; lo que no esté en la tabla se envía como `unclassified`, y un test impide publicar botones sin clasificar. `destination_view` se envía una vez por página.

**Actualización 21/11/2026**, tras contrastar con el contrato de Travelhood (`src/lib/analytics.ts`): se añaden los parámetros comunes, `booking_provider`, `faq_contact_click`, `registration_form_error` y las ubicaciones que salían sin clasificar (`*_enquiry` en viajes completos o sin fechas, `team_whatsapp`, `closing_whatsapp`, `how_to_book_whatsapp`, `catalog_help_whatsapp`, `filter_empty_whatsapp`).

## Contraste con el panel (21/11/2026)

Revisado `travelhood-admin` en `9b4cd35`: `docs/analytics-standard.md`, `src/server/ga4/report-model.ts` y `src/config/installations.ts`.

- **Hoy LST es perfil `web`:** el panel lee sesiones, usuarios activos, páginas vistas, sesiones con interacción, tendencia y canales nativos de GA4. No usa ningún evento ni parámetro propio; funciona en cuanto se conecte la propiedad, que debe estar en zona `Europe/Madrid`.
- **El informe comercial solo existe para Travelhood.** Su adaptador filtra `measurement_version` igual al texto `"1"`, cuenta como sesiones medidas las que tienen algún evento con esa versión y lee `destination_slug`, `cta_location` y los cinco eventos `destination_*`. LST ya emite todo eso con los mismos nombres. No filtra por `traffic_type` ni lee `trip_id`, `booking_provider` o `page_type`.
- **Nombres propios de LST** (`whatsapp_click`, `whatsapp_topic`, `registration_form_accepted`, `registration_form_error`): el estándar los admite. Solo prohíbe renombrar eventos publicados o emitir un alias duplicado, y trata los formularios como ampliación («envíos aceptados», separados de la tasa común). Se conservan.
- **`trip_id`:** el panel no lo consulta y el estándar lo pide solo «si se necesita» salida/fecha. No se envía; si algún día hace falta, el formato lo fija el adaptador de LST.

### Mapeo para el adaptador de LST (ficha de alta)

| Indicador del estándar | En LST |
| --- | --- |
| Sesiones medidas | Sesiones con cualquier evento con `measurement_version="1"`, vistas de página incluidas |
| Vistas de ficha | `destination_view`; `destination_slug` es el viaje, nunca la salida fechada |
| Fechas/precios | `destination_dates_price_interaction`, al abrir la ventana de fechas |
| Programa/PDF | `destination_pdf_download`; mide el clic, no la descarga |
| WhatsApp comercial | `destination_whatsapp_click` con una ubicación comercial de la lista de abajo |
| Otros WhatsApp | `destination_whatsapp_click` en el resto de ubicaciones, `whatsapp_click` y `faq_contact_click` |
| Salida al portal | `destination_booking_click`: paso al formulario de inscripción propio (`booking_provider=own_form`); no es una reserva |
| Formularios | `registration_form_accepted` (Brevo acepta el envío) y `registration_form_error`; un envío aceptado no es una plaza confirmada |
| Privados, comunidad, lista de espera | No aplica |

Para leer esto hace falta ampliar el panel, que hoy fija en código las nueve ubicaciones comerciales de Travelhood, exige la dimensión `cta` de viajes privados e impide usar el informe comercial fuera de Travelhood.

**Propuesta de clasificación comercial para el futuro adaptador** (a confirmar con LST): comerciales `reserve_whatsapp`, `booking_card_whatsapp`, `mobile_dock_whatsapp`, `departure_whatsapp`, `trip_summary_whatsapp`, `registration_whatsapp` y los cuatro `*_enquiry`; resto (`header_whatsapp`, `level_whatsapp`, `level_guide_whatsapp`, `group_fit_whatsapp`, `team_whatsapp`, `footer_whatsapp`, `closing_whatsapp`, `how_to_book_whatsapp`, `catalog_help_whatsapp`, `filter_empty_whatsapp`, `mobile_bar_whatsapp`, `unclassified`) en otros.

## Pendiente fuera del código

- ID `G-…` y ID numérico de la propiedad de LST.
- Registrar en GA4 las dimensiones personalizadas de evento `measurement_version`, `traffic_type`, `page_type`, `destination_slug`, `cta_location`, `booking_provider`, `error_category` y `whatsapp_topic`.
- Desactivar la medición mejorada del flujo web, como en Travelhood: activada, el clic saliente automático envía la URL de WhatsApp con el teléfono y el texto del mensaje.
- Activar en GA4 los filtros de tráfico interno y de desarrollador sobre `traffic_type`.
- Crear la propiedad GA4 con zona horaria `Europe/Madrid`: el panel rechaza cualquier otra.
- Configurar el panel (`ADMIN_CLIENT=lets-surf-together`, OIDC y `GA4_PROPERTY_ID`) según su guía de alta.
- Confirmar con LST la lista de ubicaciones comerciales antes de adaptar el panel.
