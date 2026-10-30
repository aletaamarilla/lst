# Home LST — retirar superficie salmón, 24/10/2026

Candidata local sobre HEAD 58f338661fc4705364fea08727c836e79b3f2048, sin commit ni publicación. Árbol previamente modificado preservado. Base exacta en before/; hashes en candidate.sha256.json.

El usuario rechaza el tono #FBDDC7 por parecer un aviso. Se sustituye por blanco neutro #fff en niveles y FAQ; la página y las cards de niveles mantienen el crema original. Niveles recibe borde fino tinta22% y conserva sus esquinas. FAQ conserva marco tinta1px y pierde el trazo superior naranja3px para reducir la asociación con una alerta. Los colores originales naranja/crema/tinta no cambian. Se conserva panel naranja del equipo, botones, hero, orden, títulos, tipografías y fotos.

Producto: solo dist/home.css. dist/index.html es idéntico a before/. La prueba de navegador cambia únicamente el texto descriptivo de warm a neutral; sus verificaciones de fondos efectivos y foco se mantienen.

Validación: npm run check19 páginas; suite browser161 checks en320/390/768/1024/1440, texto200%, teclado/touch/hover y sinJS. Capturas completas browser/home-1440.png y home-390.png. Revisión independiente: revision-independiente.md. La separación blanco/crema es sutil y se apoya también en bordes, geometría y sombra; no se presenta como un contraste cromático fuerte.

Límite: Chromium local, sin dispositivoSafari/iOS físico ni evaluación con usuarios. Las fragmentaciones de nombres al200% documentadas en la iteración anterior siguen presentes sin recorte de texto; no se modifica esa disposición en este ajuste. No se mide ni afirma conversión.
