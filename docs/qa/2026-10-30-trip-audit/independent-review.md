# Revisión independiente · 30/10/2026

## Alcance

Revisión separada de implementación, sin modificar archivos de producto. Comparación contra las copias exactas de `before/`, sobre la base Git `58f338661fc4705364fea08727c836e79b3f2048` con cambios anteriores sin commit. Revisados los generadores de viaje e inscripción, el nuevo módulo de presentación, JavaScript y CSS afectados, consumidores de estados/precios/depósitos y contratos de Brevo.

El usuario pidió expresamente conservar todos los datos obligatorios en la solicitud inicial. Se verificó la conservación de los cinco pasos y de los campos, categorías y validaciones existentes. No se revisa ni autoriza un despliegue o una escritura en el CMS.

## Evidencia ejecutada por el revisor

- `node --test --test-reporter=dot scripts/*.test.mjs`: **160 pruebas, exit 0**. Ejecutado con acceso a localhost y temporales fuera de las restricciones que provocaban EACCES/EPERM. Esta ejecución precede a los últimos ajustes exclusivamente de CSS y al enlace trivial indicado abajo; no se ha vuelto a ejecutar la suite por esos deltas.
- Comparación independiente de **15 rutas de formulario canónicas e históricas**: se importó el generador de `before/` con las mismas dependencias de datos y se contrastaron los manifiestos HTML `input/select/option/form` con la candidata. Resultado: **idénticos** nombres, tipos, valores de radios/categorías, obligatoriedad, selección inicial, patrones, autocomplete, maxlength, atributos de formato, endpoint y POST nativo. Los últimos deltas no modifican el generador de inscripción ni su JavaScript.
- Revisión de código de precios/promociones, depósitos por fecha y herencia explícita, estados completos y pendientes, PDF/consultas por salida, términos de pago y fallback nativo. No se observó un bloqueo confirmado de compatibilidad.
- Revisión del delta final: el resumen de exclusiones está junto al primer precio; los controles de programa y condiciones tienen indicadores +/− y los párrafos afectados usan 16 px. Sin bloqueo nuevo en fuente.

## Hallazgos y resolución

Mejora opcional detectada: Senegal tiene cuatro exclusiones y el resumen mostraba «Ver todos los gastos aparte» como texto plano. Se ha corregido a `<a href="#incluye">Ver todos los gastos aparte</a>`.

El revisor generó de nuevo la ficha de Senegal y comprobó mediante una aserción que dicho enlace existe dentro de su resumen inicial. **Resuelta**. No hay hallazgos bloqueantes confirmados pendientes dentro del alcance revisado.

## Versión final revisada en fuente (SHA-256)

| Archivo | Hash |
| --- | --- |
| `scripts/render-trips.mjs` | `b7c80f32b8463f4a3e485d84270ae75917d5c67612e6f7ce92fdcc6b76c50f07` |
| `scripts/render-registration.mjs` | `87873ef43f1b0b236df6502930a82c17f81c13cc400950076661552e7bcefd90` |
| `scripts/trip-decision.mjs` | `afd403db827232fbdbc48d4dacb7071d19bcc56d88096a2b2128077fcbe6d18e` |
| `dist/registration.js` | `a7567b6179c26938ff7ef53a6f013db3e7bde26470c3276a743bba983bbe24fa` |
| `dist/registration.css` | `bd12d6732ef7c7cd9b1f97861f1f188711f5b265ce551203f9c98be02aa9799d` |
| `dist/trip-conversion.css` | `e2cc192cf4b9da3da9d0d4bd197ac8006a14cfec6938e3a5c270019e66aadd24` |

## Límites

No se ha efectuado una revisión visual o de interacciones de navegador independiente. La comprobación visual, responsive y de foco final corresponde al implementador y debe consultarse en su evidencia. No se enviaron solicitudes reales a Brevo ni mensajes a WhatsApp. No se han validado métricas de conversión, comportamiento de usuarios ni condiciones comerciales nuevas. Las conclusiones se limitan al código, contratos, pruebas y deltas descritos.
