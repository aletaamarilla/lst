# Revisión independiente acotada: tarjetas de próximos viajes

Candidata local sin commit sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048. Revisión de solo lectura del producto; comparada con la captura exacta guardada en before/ de esta tarea.

## Versión revisada

- dist/index.html: 6a115ac634973efb8a13d9a0f0a0c7bce2b131a923b586bbd18aef8d4ed32a2f
- dist/home.css: 41e9ae9ef07f0a632f52b82fe9cedda57051d9ff8bbe5947d06e86e9db16bb10
- scripts/check-home-browser.mjs: 8b4c1585538e671991e186dfbc56e40ce80ef918dc64fcb75f1e2bbb3c7302ae

Los tres hashes se calcularon y contrastaron con candidate.sha256.json. HTML idéntico a before/index.html.

## Alcance y resultado

Sin hallazgos bloqueantes dentro del alcance revisado. El diff de producto comprende cinco reglas CSS: variable de superficie, margen inferior de fechas, franja de precio/acción, hover del botón y subtexto del precio. --lst-card solo se consume en .home-trip dentro de los CSS de dist. Hero, niveles, FAQ y estructura no cambian.

Inspeccionadas cards-1440.png, card-390.png y la home completa de escritorio. Las fotografías conservan el protagonismo; el marco crema elimina el blanco y la franja tinta diferencia la zona de decisión. El botón naranja mantiene su tamaño fino. No se observa corte de precio, fecha ni CTA en estas capturas.

El hover deja de ser tinta sobre tinta: pasa a crema con texto tinta. La regla de foco naranja de 3 px y offset 5 px permanece; los 10 px de padding del contenedor sin overflow oculto admiten ese contorno. Contrastes calculados con los colores fuente: precio crema/tinta 16,47:1; subtexto crema al 75 % sobre tinta 9,68:1; texto tinta/naranja 4,90:1; foco naranja/crema 3,36:1. No hay hallazgo de contraste en las superficies afectadas.

## Evidencia y límites

Contrastados check.txt (19 páginas PASS), browser/results.json (166 comprobaciones, errors vacío) y el cambio de la aserción de superficie. Estas pruebas las ejecutó el implementador; el revisor no duplicó la suite. Esta revisión independiente comprende diff, hashes, capturas y cálculo de contraste; no añade una ejecución propia de interacción ni pruebas de dispositivo físico/Safari. El tratamiento añade peso visual al pie de cada tarjeta de forma contenida. No demuestra un aumento de reservas. Cambios locales, sin publicar.
