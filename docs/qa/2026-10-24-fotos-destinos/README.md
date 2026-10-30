# Fotos por destinos en Sanity · selección final

Operación terminada el 25/10/2026 en LTS `q5bj2rn2/production`. Quedan **47 fotos nuevas** identificadas por destino en título, nombre y descripción: 6 en Asturias, Cantabria, El Palmar–Cádiz, Euskadi, Francia, Marruecos y Senegal; 5 en Marruecos nivel 3. Disponibles desde el selector de imágenes de [Studio](https://lets-surf-together.sanity.studio/).

El usuario corrigió el alcance durante la carga inicial: la subida de 281 imágenes ya había terminado. Se revisaron hojas de contacto para conservar una selección variada y se retiraron exclusivamente los 234 assets sobrantes de esta operación. Los originales de Downloads no se modificaron ni eliminaron. Los 150 archivos AppleDouble de macOS se identificaron por cabecera y no se subieron.

[Selección con archivos e IDs](curated-selection.json). [Verificación final](curated-verification.json): 47 assets propios, 53 imágenes totales; las 6 imágenes anteriores y las 54 revisiones de documentos previos permanecen intactas. Hash, tamaño y dimensiones de las seleccionadas coinciden con los originales validados. No se modificaron portadas, galerías, viajes ni publicaciones, ni se desplegó la web.

[Plan de retirada](cleanup-plan.json) y [transacción real](cleanup-transaction.json): `2D42OFpIbrkQoZrdHYMh2U`, 234 IDs propios sin referencias, con precondiciones de revisión en transacción atómica. Se comprobó la ausencia del exceso después de aplicar. El importador histórico incorpora un bloqueo para no repetir la carga completa cuando existe la selección.

Revisión independiente de solo lectura sobre `curate.mjs` SHA256 `1344c2463537b9dfb800bdf7daa0ba0c41f6a7b695aab0bfd3ba38dd0fe33acf`: alcance, selección, protección de documentos previos, consultas por lotes y simulaciones de revisión concurrente, referencias y repetición sin nuevas escrituras. Sin bloqueos detectados antes de aplicar.

Versión de repositorio `58f338661fc4705364fea08727c836e79b3f2048`, sin commit de esta tarea. Se conserva el amplio diff previo. Esta operación añade este directorio de evidencia y utilidades locales ignoradas en `artifacts/fotos-destinos/`; no cambia código de la aplicación. No se ejecutó build de la web porque no hay cambios de producto ni contenido publicado. [Resumen de operación y hashes de utilidades](operation-summary.json). WSL dejó de conectar con Sanity; el ajuste y la verificación se ejecutaron desde Windows con la sesión local existente, sin copiar credenciales a evidencias.

`source-manifest.json`, `preflight.json`, `upload-results.json` y `full-upload-verification.json` documentan la carga inicial y su estado previo al ajuste; la situación vigente es `curated-verification.json`.

La revisión independiente posterior contrastó el plan, la transacción y la lectura final: 234 retiradas y 47 conservadas, con las 54 revisiones previas intactas, sin hallazgos bloqueantes. La API devolvió operaciones sin IDs; la correspondencia exacta se contrastó con el registro local y la lectura posterior del script revisado. Las comprobaciones de sintaxis de ambas utilidades Node también pasaron.
