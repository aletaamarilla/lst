# Validación de acciones de niveles en la home

Ejecutada sobre el candidato registrado en [candidate.sha256.json](candidate.sha256.json). Resultado: **48/48 comprobaciones aprobadas**, sin errores de ejecución del navegador. Evidencia detallada: [results.json](results.json).

- Chromium local mediante servidor efímero independiente; no se ha utilizado ni reiniciado la vista del usuario en localhost:4175.
- Geometría en 320, 390, 768 y 1440 px, con tamaño de texto normal y al 200 %: cuatro tarjetas semánticas, dos enlaces hermanos por tarjeta, destino y nombre accesible por nivel, objetivos de al menos 44 px, sin solapamientos, recortes de acciones ni desbordamiento horizontal de página. Las ocho capturas `levels-*.png` documentan esos estados.
- Navegación real de los cuatro «Ver viajes» y cuatro «Saber más» a 390 px con JavaScript activado y desactivado. Se conservan los filtros numéricos del catálogo; cada sección de la guía recibe el foco nativo y su encabezado queda visible por debajo de la cabecera fija. La guía añade su contexto `?nivel=slug` cuando JavaScript está activo.
- Teclado: Tab pasa del primer «Ver viajes» al «Saber más» de la misma tarjeta con foco visible; Enter abre Rookies y entrega el foco a la sección correcta.
- Los hashes del build se compararon antes y después de la ejecución y no variaron. No se han modificado archivos de producto ni scripts existentes.

El alcance es la interacción y la geometría de las acciones de niveles. Las transiciones visuales, la pestaña «Más viajes», otros navegadores y la medición de ventas no forman parte de esta prueba. El aumento de texto se simula duplicando los tamaños calculados de fuente; no se presenta como zoom nativo del navegador.

Comando reproducible desde la raíz del repositorio:

```sh
LST_PLAYWRIGHT_MODULE=/home/amfernandez/.cache/ms-playwright-go/1.50.1/package \
LST_CHROMIUM_PATH=/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
LD_LIBRARY_PATH=/tmp/lst-browser-libs/root/usr/lib/x86_64-linux-gnu \
node scripts/check-home-level-actions.mjs
```
