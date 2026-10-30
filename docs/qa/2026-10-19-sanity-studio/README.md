# Sanity Studio de Let's Surf Together · 19/10/2026

## Resultado y alcance

Studio publicado en https://lets-surf-together.sanity.studio/ y registrado en LTS (`q5bj2rn2`), dataset `production`, organización `oCsOalTXP`. Aplicación `jcegzkyow71llyc9jting9xd`, Sanity 6.19.0. La [evidencia de despliegue](deployment.json) procede de consultas autenticadas de solo lectura a la API; no incluye credenciales.

Código en `studio/` con esquema inicial de viajes, configuración, CLI, TypeScript estricto y lockfile. Los scripts raíz permiten desarrollar, comprobar, compilar y desplegar. El segundo despliegue devolvió `action: update` usando el appId persistido; sigue habiendo una sola aplicación registrada.

No se importaron documentos comerciales: la consulta posterior al despliegue devuelve cero. La web sigue usando `data/trips.json`; conectar los generadores y migrar el catálogo requiere una integración posterior con mapeo explícito de imágenes, salidas y preguntas.

## Versión revisada

Repositorio `/home/amfernandez/personalProjects/letsurftogethersystem`, base `main` en `73dc52dca750482853b1fc5973953ea1675b1fc2`, candidata sin commit.

- Modificados: `.gitignore`, `README.md`, `package.json`.
- Nuevos: `studio/package.json`, `studio/package-lock.json`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/tsconfig.json`, `studio/schemaTypes/index.ts`, `studio/schemaTypes/trip.ts` y este informe con `deployment.json`.
- Sin cambios en `data/` ni `dist/`; el repositorio Travelhood no se modificó por esta tarea.
- SHA256 del esquema revisado: `e71f0d8d691094eaeeca1c9200b36bcba524c7d0bf1557e54e5057b2fefe8724`.

## Evidencia de aceptación

| Criterio | Comprobación y resultado |
| --- | --- |
| Proyecto, organización y dataset correctos | API de proyecto y manifiesto activo: `q5bj2rn2`, `oCsOalTXP`, `production`. |
| Studio registrado y reutilizable | Primer deploy crea la aplicación; segundo deploy con appId actualiza la misma. Ambos publican 1/1 esquemas con `--schema-required`. |
| Studio compila | `npm run studio:check`, `npm run studio:build` y extracción del esquema correctos. El despliegue final vuelve a compilar sin avisos de dependencias/appId. |
| Esquema válido | Extracción correcta. Precio ausente válido; cero/negativos y más de dos decimales rechazados; 0.01 y 1499 válidos, comprobado en memoria por el revisor. |
| Acceso publicado | URL responde y redirige al acceso de Sanity de la organización/aplicación esperadas. |
| Web existente conservada | Build, 25 pruebas y check de 11 páginas pasan antes y después; `git diff -- dist data` vacío. |
| Diff consistente | `git diff --check` correcto; revisión independiente inicial y final sin bloqueos pendientes. |

## Revisión y límites

El revisor independiente contrastó configuración, scripts, consumidores web y validaciones. Detectó que `positive()` de Sanity admitía cero; se sustituyó por `greaterThan(0)` y se verificaron los límites. La revisión final cubrió appId, reenvío de opciones y configuración de despliegue, manteniendo el hash del esquema.

No se ha probado el editor después de iniciar sesión. El intento de navegador local no pudo arrancar Chromium por ausencia de `libnspr4.so`; se confirmó respuesta HTTP local 200 y acceso remoto, sin presentarlos como prueba visual. No se publicaron viajes, se hizo push ni se conectó la web al CMS.
