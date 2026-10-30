# Foto móvil y campos de inscripción · 25/10/2026

Cambio visual local, sin commit ni publicación, sobre `58f338661fc4705364fea08727c836e79b3f2048` y el checkout previo conservado. Único archivo de producto modificado: `dist/registration.css`. [Base y hashes](base.json), [estado inicial](initial-status.txt), [diff explícito](task.patch), [versión final](version.json).

La fotografía del viaje vuelve a mostrarse en móvil dentro de una cabecera horizontal de 220–300 px, con degradado, destino y sello de LST. En escritorio se conserva el formato de 490 px. Los campos pasan de subrayados a superficies claras, borde completo, esquinas de 13 px y altura mínima de 54 px. El foco usa contorno naranja y los errores conservan su estado diferenciado. El prefijo y teléfono comparten un campo visual con separación interior. Las alturas se adaptan al texto ampliado.

Validación: [368 comprobaciones de navegador PASS](browser/results.json) de siete destinos y cinco pasos a 320/390/768/1440 px, texto 200%, teclado/foco, errores de pasos anteriores, payload, envío doble y fallback sin JavaScript. Todas las solicitudes se interceptan. Comprobador estático: [40 páginas PASS](check.txt).

Inspección adicional con imagen CDN real y fuentes locales: fotografía visible, cargada y con alturas 220/220/300/490 en esos cuatro anchos. [Móvil 320](real-320.png), [móvil 390](real-390.png), [tablet](real-768.png), [escritorio](real-1440.png), [campo con foco y texto](focus-390.png). Se revisó explícitamente el diff CSS; por el alcance exclusivamente visual no se requirió revisión funcional independiente.

Los hashes de JavaScript, plantilla y snapshot comercial no cambian. No se modifican pasos, validaciones, categorías, campos ni envío a Brevo. Las capturas del comprobador usan una foto local para aislar geometría; las capturas real-* usan la fotografía original del viaje. Sin comprobación en Safari/iOS físico.
