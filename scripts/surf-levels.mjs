// Single source for LST's surf levels (Niveles de surf LST): names used across
// the site, the full /niveles/ guide and its quick test.
// Trip levels in Sanity stay the integers 1–4; they map 1:1 to these levels.

export const SURF_LEVELS = Object.freeze([
  {n: 1, name: 'Iniciación', tag: 'De la espuma a la primera ola verde', short: 'Espumas, ponerte de pie y tus primeras olas verdes.', waveShort: 'Espuma a 0,8 m', wave: 'De la espuma a olas verdes de hasta 0,8 m', board: 'Siempre blanda (soft), de 6\'6" a 9\''},
  {n: 2, name: 'Base', tag: 'Leer la ola y moverse por la pared', short: 'Lees la ola, recorres la pared y aprendes el pato.', waveShort: '0,5 a 1,2 m', wave: 'De 0,5 a 1,2 m', board: 'De fibra o soft grande, hasta una que ya se hunda (de 5\'10" a 9\')'},
  {n: 3, name: 'Intermedio', tag: 'Independencia, línea y primeras maniobras', short: 'Independencia en el agua, velocidad y primeras maniobras.', waveShort: '1 a 1,8 m', wave: 'De 1 a 1,8 m', board: 'Cualquier tabla que se hunda (de 5\'6" a 7\'6")'},
  {n: 4, name: 'Avanzado', tag: 'Maniobras consistentes y surf crítico', short: 'Maniobras consistentes, tubos y olas con fuerza.', waveShort: 'Desde 1,5 m', wave: 'Desde 1,5 m, en cualquier condición', board: 'Varias según el día: corta, step-up, twin…'},
]);

export const levelName = n => SURF_LEVELS[n - 1]?.name;
// «y» becomes «e» before a word starting with an /i/ sound (Iniciación, Intermedio).
const and = next => (/^[iI]/.test(next) ? 'e' : 'y');
/** Trip levels in words: «Iniciación y Base», «Base e Intermedio», «Base a Avanzado». */
export function levelNames(levels) {
  const sorted = [...new Set(levels)].sort((a, b) => a - b);
  if (!sorted.length || sorted.length === 4) return 'Todos los niveles';
  const names = sorted.map(levelName);
  const consecutive = sorted.every((level, i) => !i || level === sorted[i - 1] + 1);
  if (names.length === 1) return names[0];
  if (consecutive && names.length > 2) return `${names[0]} a ${names.at(-1)}`;
  return `${names.slice(0, -1).join(', ')} ${and(names.at(-1))} ${names.at(-1)}`;
}
/** «Nivel 2 · Base» */
export const levelTitle = n => `Nivel ${n} · ${levelName(n)}`;
/** Registration choices: «2 · Base — Leer la ola y moverse por la pared» */
export const surfLevelOptions = SURF_LEVELS.map(l => `${l.n} · ${l.name} — ${l.tag}`);

// Sublevels: c code, t title, w waves, lst Método LST, d description,
// b board [name, note], can «Ya hace», cant «Todavía no», work, err.
export const SUBLEVELS = Object.freeze([
  {c: '1.1', t: 'Iniciación pura', w: 'Espuma · hasta 0,5 m', d: 'Coge espumas. Todavía no controla bien la puesta en pie.', b: ['Soft 7\'–9\'', 'Tabla blanda con mucho volumen: estable, flota mucho y no hace daño. Cuanto más volumen, más fácil.'], can: ['Coge espumas con empujón o remando cerca de la orilla', 'Se tumba y rema en la tabla sin caerse', 'Se pone de pie alguna vez (2–3 de cada 10 espumas)'], cant: ['Levantarse de forma constante', 'Ponerse de pie en un solo movimiento, sin apoyar las rodillas', 'Dirigir la tabla una vez de pie'], work: 'Posición en la tabla, remar a tiempo, puesta en pie y seguridad en el agua.', err: 'Levantarse con las rodillas · mirar a los pies · remar tarde'},
  {c: '1.2', t: 'Espumas con soltura', w: 'Espuma · hasta 0,8 m', d: 'Se levanta mejor y con más soltura. Coge espumas de lado a lado con mejor postura.', b: ['Soft 7\'–9\'', 'Sigue en soft. Según tu peso y tu facilidad, puede ser más corta o más larga.'], can: ['Coge espumas solo, remando', 'Se levanta en 8 de cada 10 espumas', 'Va de lado a lado en la espuma con buena postura', 'Pasa la espuma remando hacia dentro en días pequeños'], cant: ['Coger olas verdes (sin romper) sin ayuda', 'Saber dónde colocarse para coger una ola verde', 'Dar las remadas fuertes en el momento justo'], work: 'Dirigir la tabla con mirada y hombros, pasar la espuma y normas básicas (prioridad, corrientes).', err: 'Piernas rígidas · mirar la tabla · soltar la tabla'},
  {c: '1.3', t: 'Primeras olas verdes', w: 'Verde · 0,5–0,8 m', d: 'Coge olas verdes, pero solo recto. Aún no lee la ola.', b: ['Soft 6\'6"–8\'6"', 'Soft con volumen para coger verdes con facilidad y sin miedo a golpes.'], can: ['Coge olas verdes pequeñas por su cuenta', 'Se levanta en la ola verde en 7 de cada 10 intentos', 'Baja recto hasta la orilla con equilibrio'], cant: ['Saber si la ola va a izquierda o a derecha antes de cogerla', 'Salir en diagonal y recorrer la pared', 'Surfear de espaldas a la ola (backside)'], work: 'Elegir ola, take-off en diagonal y colocarse en el pico.', err: 'Esperar en la espuma · levantarse tarde · no mirar atrás'},
  {c: '2.1', t: 'Lectura de pared', w: '0,5–1 m', d: 'Lee la pared y coge olas de lado a lado, de cara y de espaldas, con tabla grande.', b: ['Fibra o soft grande 7\'–9\'', 'Primera tabla de fibra, aunque sea grande: más velocidad y respuesta. También vale una soft grande.'], can: ['Lee hacia dónde rompe la ola antes de remar', 'Sale en diagonal en 7 de cada 10 olas', 'Recorre la pared de cara y de espaldas con tabla grande', 'Se mantiene por delante de la espuma'], cant: ['Controlar una tabla de fibra más pequeña', 'Generar velocidad por sí mismo', 'Pasar la rompiente con olas de 1 m sin que le arrastre'], work: 'Recorrer la pared, elegir ola y lado, postura de espaldas.', err: 'Bajar al fondo de la ola · no girar hombros de espaldas · peso atrás'},
  {c: '2.2', t: 'Cambio de tabla', w: '0,5–1,2 m', lst: true, d: 'Pasa a tabla evolutiva o al menos de fibra. Controla mejor las paredes.', b: ['Fibra 6\'6"–8\'', 'Más pequeña y manejable, pero todavía con demasiado volumen para hundirla y hacer el pato.'], can: ['Coge olas con la tabla más pequeña igual de fácil que con la grande', 'Recorre paredes de hasta 1,2 m con pequeños bombeos', 'Sube y baja por la pared de forma controlada'], cant: ['Hacer el pato', 'Pasar la rompiente solo en días de 1 m', 'Colocarse en el pico respetando la prioridad'], work: 'Adaptarse a la tabla nueva y mantener la velocidad en la pared.', err: 'Bajar de tabla demasiado pronto · remar poco · postura rígida'},
  {c: '2.3', t: 'El pato', w: 'Hasta 1,2 m', lst: true, d: 'Hace el pato y se mueve mejor sobre la pared de la ola.', b: ['Tabla que se hunda 5\'10"–7\'6"', 'Cualquier tabla con la que puedas hacer el pato y que siga remando bien: evolutiva, fish, híbrida, corta de volumen…'], can: ['Hace el pato en 8 de cada 10 olas de hasta 1 m', 'Pasa la rompiente solo, eligiendo el momento entre series', 'Se coloca en el pico y respeta la prioridad', 'Elige sus olas sin ayuda'], cant: ['Surfear con soltura sesiones de 1,5 m', 'Usar la zona alta y la baja de la ola a voluntad', 'Leer marea, viento y banco antes de entrar'], work: 'Pato, lectura de series y posición en el pico.', err: 'Pato tarde · no hundir el morro · quedarse en la zona de impacto'},
  {c: '3.1', t: 'Independencia', w: 'Hasta 1,5 m', lst: true, d: 'Tiene libertad e independencia en el agua. Hace patos sin problema, aguanta con metro y medio cogiendo paredes y sabe estar en la zona alta o baja de la ola.', b: ['Tabla que se hunda 5\'8"–7\'6"', 'Desde una tabla corta con volumen hasta una más grande: lo importante es que se pueda hundir y te deje coger paredes.'], can: ['Surfea sesiones completas de 1,5 m sin ayuda', 'Hace patos sin problema', 'Elige pico según marea, viento y banco', 'Se coloca en la zona alta o baja de la ola cuando quiere'], cant: ['Generar velocidad en olas lentas', 'Frenar para esperar a la sección', 'Anticipar la sección que viene'], work: 'Tomar buenas decisiones en el agua antes que técnica.', err: 'Surfear siempre en la zona media · olas de más o de menos · no leer las condiciones'},
  {c: '3.2', t: 'Línea y velocidad', w: '1–1,5 m', lst: true, d: 'Entiende la línea de la ola y la velocidad. Va más rápido o más lento según lo que quiera.', b: ['5\'8"–7\'', 'Tabla corta con volumen, fish, híbrida o evolutiva: que reme bien y responda al bombeo.'], can: ['Bombea y genera velocidad por sí mismo', 'Acelera y frena según la sección', 'Lee la ola por delante: ni se queda atrás ni se adelanta'], cant: ['Hacer bottom turn y top turn con intención', 'Hacer un cutback que vuelva al foco', 'Usar la velocidad para maniobrar'], work: 'Velocidad útil para llegar a la sección en el momento justo.', err: 'Bombear con los brazos · ir rápido sin rumbo · llegar sin velocidad'},
  {c: '3.3', t: 'Primeras maniobras', w: '1–1,8 m', lst: true, d: 'Completa maniobras, aunque a veces salgan mal.', b: ['5\'6"–6\'8"', 'Una tabla más reactiva para girar; las tablas más grandes siguen valiendo en olas lentas.'], can: ['Hace bottom turn y top turn', 'Hace cutback', 'Hace floater en secciones pequeñas', 'Completa al menos 5 de cada 10 maniobras que intenta'], cant: ['Que las maniobras salgan bien de forma constante (8 de 10)', 'Encadenar 3 maniobras en una ola', 'Snap / re-entry en el labio'], work: 'Maniobras en la sección correcta, con compresión y rotación.', err: 'Bottom turn plano · girar con los brazos · maniobra fuera de la sección'},
  {c: '4.1', t: 'Perfeccionamiento', w: '1,5–2 m', lst: true, d: 'Las maniobras salen bien. Toca pulir detalles.', b: ['Tabla corta 5\'4"–6\'4" y otras', 'Empieza a usar distintas tablas según el día: corta, fish, twin, midlength…'], can: ['Le salen las maniobras en 8 de cada 10 intentos', 'Encadena 3 maniobras en una ola con fluidez', 'Hace snap / re-entry', 'Se corrige viendo su propio vídeo'], cant: ['Entrar y salir de tubos', 'Maniobrar en la sección más crítica', 'Surfear con confianza olas potentes de 2 m+ en reef o point'], work: 'Pulir detalles, fluidez y estilo.', err: 'Maniobras sueltas · brazos descolgados · maniobrar en zonas planas'},
  {c: '4.2', t: 'Surf crítico', w: '2 m+ · reef y point', d: 'Busca tubos y maniobras más críticas.', b: ['Tabla corta + step-up', 'Para olas grandes y potentes, una tabla algo más larga y estrecha.'], can: ['Entra y sale de tubos', 'Hace maniobras verticales en el labio', 'Surfea olas potentes de 2 m+ en reef y point', 'Hace take-offs tardíos con confianza'], cant: ['Adaptarse a cualquier ola, tabla y condición', 'Maniobras progresivas (aéreos, rotaciones) con control', 'Un estilo propio reconocible'], work: 'Compromiso en la sección crítica y tablas adaptadas a cada ola.', err: 'Dudar en el take-off · maniobras lejos del labio · no tener quiver'},
  {c: '4.3', t: 'Libertad total', w: 'Cualquier condición', d: 'Tiene total libertad de movimiento y todas las posibilidades que quiera en el agua.', b: ['Cualquier tabla', 'Usa la que quiera y la adapta a cada ola: corta, twin, midlength, longboard o gun.'], can: ['Surfea cualquier ola y condición', 'Cambia de tabla y adapta su surf', 'Tiene un repertorio completo, incluidas maniobras progresivas', 'Tiene estilo propio'], cant: ['Es la cima técnica. Siguiente paso: progresión libre o la ruta de competición'], work: 'Variedad, creatividad y preparación física.', err: 'Estancarse en el mismo spot y la misma tabla · descuidar el físico'},
]);

export const COMPETITION = Object.freeze({
  n: 5, name: 'Competición', tag: 'Una ruta, no solo un nivel', access: 'Desde nivel 3.3 – 4.1', format: 'Mangas · prioridad · 2 mejores olas',
  intro: 'Competir es un camino paralelo: se puede empezar en circuitos locales desde el nivel 3 y seguir progresando a la vez en los niveles técnicos.',
  subs: [
    {c: '5.1', t: 'Primeras competiciones', w: 'Desde nivel 3.3', d: 'Pruebas locales y de club. Aprende el formato: mangas, prioridad y que puntúan las dos mejores olas.'},
    {c: '5.2', t: 'Circuito autonómico y nacional', w: 'Desde nivel 4.1', d: 'Estrategia de manga, elegir olas bajo presión, preparación física y mental.'},
    {c: '5.3', t: 'Élite', w: 'Nivel 4.2–4.3', d: 'Pruebas internacionales. Surf completo en cualquier condición con un plan de manga claro.'},
  ],
  judges: 'Los jueces valoran compromiso y dificultad, maniobras innovadoras y progresivas, combinación de maniobras principales, variedad, y velocidad, potencia y fluidez.',
  err: ['Coger muchas olas de poco valor', 'No gestionar el tiempo ni la prioridad', 'Surfear en manga distinto que en libre'],
  focus: 'coger las olas que puntúan dentro del tiempo de la manga.',
});

// One yes/no question per sublevel, in order. The first «Todavía no» places
// the visitor in the previous sublevel.
export const LEVEL_TEST = Object.freeze([
  ['1.1', '¿Coges espumas y consigues ponerte de pie alguna vez?'],
  ['1.2', '¿Te pones de pie casi siempre y diriges la tabla en la espuma?'],
  ['1.3', '¿Coges olas verdes (sin romper) por tu cuenta, aunque sea en recto?'],
  ['2.1', '¿Recorres la pared de lado a lado, de cara y de espaldas?'],
  ['2.2', '¿Controlas la pared con una tabla de fibra más pequeña que la de empezar?'],
  ['2.3', '¿Pasas la rompiente haciendo el pato y eliges tus olas?'],
  ['3.1', '¿Surfeas sin ayuda con olas de metro y medio?'],
  ['3.2', '¿Aceleras y frenas a voluntad para estar en la parte buena de la ola?'],
  ['3.3', '¿Haces bottom turn, top turn, cutback o floater, aunque a veces fallen?'],
  ['4.1', '¿Te salen las maniobras de forma constante y las encadenas?'],
  ['4.2', '¿Buscas tubos y maniobras en la sección crítica de olas potentes?'],
  ['4.3', '¿Te adaptas a cualquier ola, tabla y condición?'],
]);

/** Pure test scoring: answers is the list of booleans given so far. */
export function testResult(answers) {
  const firstNo = answers.indexOf(false);
  if (firstNo === -1) return answers.length === LEVEL_TEST.length ? {code: '4.3', top: true} : null;
  return {code: firstNo === 0 ? '1.1' : LEVEL_TEST[firstNo - 1][0], top: false, start: firstNo === 0};
}

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const subId = code => 'subnivel-' + code.replace('.', '-');

// What each level looks and feels like, for the guide's chapters.
// waveM: top of the usual wave in metres; boardFt: a typical board; nose 1 = round, 0 = pointed.
const CHAPTERS = {
  1: {hook: 'La primera de pie no se olvida.', photo: '/assets/home/cantabria-sesion.webp', w: 900, h: 600, pos: '50% 60%', alt: 'Un grupo practica la puesta en pie sobre tablas blandas en la arena',
    waveTitle: 'Olas por la cintura, como mucho', waveNote: 'Empiezas en la espuma y acabas cogiendo olas verdes de hasta 0,8 m.',
    boardTitle: 'Una tabla blanda, más alta que tú', boardNote: 'Soft de 6\'6" a 9\'. Cuanto más volumen, más fácil.', waveM: 0.8, boardFt: 8.5, boardW: 0.6, nose: 1},
  2: {hook: 'Empieza a dibujar tu línea.', photo: '/assets/surf-session.webp', w: 1600, h: 1066, pos: '60% 60%', alt: 'Una surfista recorre la pared de una ola junto a la costa',
    waveTitle: 'De la rodilla al pecho', waveNote: 'Olas de 0,5 a 1,2 m en las que ya recorres la pared.',
    boardTitle: 'De fibra, cada vez más corta', boardNote: 'Empiezas con una grande y bajas hasta una que puedas hundir (de 9\' a 5\'10").', waveM: 1.2, boardFt: 7.3, boardW: 0.54, nose: 0.75},
  3: {hook: 'Cada giro tiene intención.', photo: '/assets/el-salvador.webp', w: 1000, h: 600, pos: '62% 45%', alt: 'Un surfista hace un giro sobre una ola en El Salvador',
    waveTitle: 'Del pecho a la cabeza', waveNote: 'Olas de 1 a 1,8 m, sin ayuda y eligiendo tú el pico.',
    boardTitle: 'Una que puedas hundir', boardNote: 'Más o menos de tu altura: de 5\'6" a 7\'6".', waveM: 1.8, boardFt: 6.4, boardW: 0.5, nose: 0.45},
  4: {hook: 'El detalle cambia la ola.', photo: 'https://cdn.sanity.io/images/q5bj2rn2/production/38e9a54e13339cbff15a5cc4ada439843a55c289-2048x1366.jpg?w=1800&fit=max&auto=format', w: 2048, h: 1366, pos: '50% 48%', alt: 'Un surfista gira sobre una ola en una fotografía del archivo de Senegal',
    waveTitle: 'De la cabeza para arriba', waveNote: 'Desde 1,5 m y en cualquier condición, también en reef y point.',
    boardTitle: 'Corta, y otras según el día', boardNote: 'De 5\'4" a 6\'4", con step-up, twin o midlength cuando toca.', waveM: 2.3, boardFt: 5.9, boardW: 0.46, nose: 0.15},
};

// A person (1,70 m), their usual board and their usual wave, to scale.
function figure(n) {
  const c = CHAPTERS[n], G = 236, px = 80; // 80 px per metre
  const h = c.waveM * px, L = c.boardFt * 0.3048 * px, r = c.boardW * px / 2, k = c.nose, bx = 58, top = G - L;
  const wave = `M0 ${G} L0 ${G - h * .3} C 40 ${G - h * .34}, 96 ${G - h * .72}, 150 ${G - h * .96} C 186 ${G - h * 1.1}, 222 ${G - h * .92}, 220 ${G - h * .7} C 218 ${G - h * .56}, 204 ${G - h * .56}, 206 ${G - h * .68} C 226 ${G - h * .48}, 236 ${G - h * .24}, 240 ${G - h * .2} L240 ${G} Z`;
  const board = `M${bx} ${top} C ${bx + r * k} ${top} ${bx + r} ${top + L * .16} ${bx + r} ${top + L * .42} L ${bx + r} ${G - L * .1} C ${bx + r} ${G - 3} ${bx + r * .45} ${G} ${bx} ${G} C ${bx - r * .45} ${G} ${bx - r} ${G - 3} ${bx - r} ${G - L * .1} L ${bx - r} ${top + L * .42} C ${bx - r} ${top + L * .16} ${bx - r * k} ${top} ${bx} ${top} Z`;
  const p = 160, s = G - 136; // person: centre x, top of head
  const person = `<circle cx="${p}" cy="${s + 11}" r="11"/><path d="M${p - 13} ${s + 27} h26 a7 7 0 0 1 7 7 v38 a4 4 0 0 1 -8 0 v-30 h-2 v94 h-9 v-56 h-2 v56 h-9 v-94 h-2 v30 a4 4 0 0 1 -8 0 v-38 a7 7 0 0 1 7 -7z"/>`;
  return `<svg class="lv-figure" viewBox="0 0 240 244" role="img" aria-label="Una persona de 1,70 m junto a su tabla y a una ola de ${String(c.waveM).replace('.', ',')} m"><path class="lv-figure-wave" d="${wave}"/><path class="lv-figure-board" d="${board}"/><line class="lv-figure-stringer" x1="${bx}" y1="${top + 6}" x2="${bx}" y2="${G - 6}"/><g class="lv-figure-person">${person}</g><line class="lv-figure-ground" x1="0" y1="${G + 1}" x2="240" y2="${G + 1}"/></svg>`;
}

/** Trip pages reuse the guide's to-scale drawing and its wave in surfer words («Del pecho a la cabeza»). */
export const levelFigure = n => (CHAPTERS[n] ? figure(n) : '');
export const levelWave = n => CHAPTERS[n]?.waveTitle ?? '';

const list = items => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
// Each step is one line (number and name); what it means opens underneath.
function step(s, i) {
  return `<li class="lv-step"><details class="lv-sub" id="${subId(s.c)}" data-sub="${s.c}">
<summary><span class="lv-sub-n" aria-hidden="true">${i + 1}</span><span class="lv-sub-title">${esc(s.t)}</span><span class="lv-sub-toggle" aria-hidden="true"></span></summary>
<div class="lv-sub-body">
<p class="lv-sub-desc">${esc(s.d)}</p>
<div class="lv-can"><h4>Ya lo haces si…</h4>${list(s.can)}</div>
<div class="lv-cant"><h4>${s.cant.length > 1 ? 'Te falta' : 'Y después'}</h4>${list(s.cant)}</div>
<p class="lv-board"><strong>Tabla:</strong> ${esc(s.b[0])}. ${esc(s.b[1])}</p>
<p class="lv-foot"><strong>En clase:</strong> ${esc(s.work)} <strong>Ojo con:</strong> ${esc(s.err.replaceAll(' · ', ', ').replace(/^./, c => c.toLowerCase()))}.</p>
<button class="lv-choose" type="button" data-choose="${s.c}" hidden>Este es mi nivel</button>
</div>
</details></li>`;
}

function chapter(level, rows = '') {
  const c = CHAPTERS[level.n], subs = SUBLEVELS.filter(s => s.c.startsWith(level.n + '.'));
  const next = SURF_LEVELS[level.n];
  const goal = next ? `<div class="lv-fact lv-fact--goal"><h4>Para pasar a ${esc(next.name)}</h4>${list(subs.at(-1).cant)}</div>`
    : `<div class="lv-fact lv-fact--goal"><h4>Y después</h4><p>Es la cima técnica: progresar a tu aire o probar la competición.</p></div>`;
  return `<section class="lv-chapter lv-chapter--${level.n}" id="nivel-${level.n}" aria-labelledby="nivel-${level.n}-title" tabindex="-1">
<header class="lv-cover"><img src="${esc(c.photo)}" width="${c.w}" height="${c.h}" alt="${esc(c.alt)}" ${level.n === 1 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="object-position:${c.pos}">
<div class="lv-cover-text section-width"><p class="lv-cover-level">Nivel ${level.n}</p><h3 id="nivel-${level.n}-title">${esc(level.name)}</h3><p class="lv-cover-hook">${esc(c.hook)}</p></div></header>
<div class="lv-chapter-body section-width">
<div class="lv-facts">${figure(level.n)}
<div class="lv-fact"><h4>Tu ola</h4><p class="lv-fact-big">${esc(c.waveTitle)}</p><p>${esc(c.waveNote)}</p></div>
<div class="lv-fact"><h4>Tu tabla</h4><p class="lv-fact-big">${esc(c.boardTitle)}</p><p>${esc(c.boardNote)}</p></div>
${goal}</div>
<div class="lv-steps-head"><h4>Los tres pasos de ${esc(level.name)}</h4></div>
<ol class="lv-steps">${subs.map(step).join('\n')}</ol>
<div class="lv-chapter-trips" data-level-trips="${level.n}"><div class="lv-chapter-trips-head"><h4>Viajes para ${esc(level.name)}</h4><a href="/viajes/?nivel=${level.n}">Ver en el catálogo</a></div>
${rows ? `<ul class="lv-trip-list">${rows}</ul>` : `<p class="lv-trips-none">Ahora mismo no hay salidas para este nivel. Escríbenos y te avisamos de las próximas.</p>`}</div>
</div>
</section>`;
}

const NAMES_BY_CODE = Object.fromEntries(SUBLEVELS.map(s => [s.c, `«${s.t}»`]));
function competitionSection() {
  const C = COMPETITION;
  return `<section class="lv-comp section-width" id="nivel-5" aria-labelledby="nivel-5-title" tabindex="-1">
<div class="lv-comp-intro"><h3 id="nivel-5-title">¿Y competir?</h3><p>${esc(C.intro)}</p></div>
<ol class="lv-comp-steps">${C.subs.map(s => `<li id="${subId(s.c)}"><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p><p class="lv-comp-from">${esc(s.w.replace(/^Desde nivel (\d\.\d)$/, (m, c) => `Desde ${NAMES_BY_CODE[c]}`).replace(/^Nivel 4\.2–4\.3$/, `Desde ${NAMES_BY_CODE['4.2']}`))}</p></li>`).join('')}</ol>
<p class="lv-comp-judges">${esc(C.judges)} Táctica: ${esc(C.focus)}</p>
</section>`;
}

export function levelGuideHtml(tripRows = {}) {
  const index = SURF_LEVELS.map(l => `<a class="lv-index-item" href="#nivel-${l.n}" data-level-tab="${l.n}">${figure(l.n)}<span class="lv-index-name">${esc(l.name)}</span><span class="lv-index-wave">${esc(CHAPTERS[l.n].waveTitle)}</span></a>`).join('');
  return `<section class="lv-intro section-width" id="guia-niveles" aria-labelledby="lv-guide-title" tabindex="-1">
<h2 id="lv-guide-title" class="visually-hidden">Los cuatro niveles</h2>
<nav class="lv-index" aria-label="Niveles de surf">${index}</nav>
<div class="lv-hero-foot"><a class="button" href="#test">Haz el test</a><p class="lv-howto">Medidas para una persona de 1,70 m. ¿Quieres competir? Mira <a href="#nivel-5">la ruta de competición</a>.</p></div>
<p class="lv-pickbar" data-pickbar hidden>Abre el paso que mejor te describe y pulsa «Este es mi nivel».</p>
</section>
<div class="lv-chapters">
${SURF_LEVELS.map(level => chapter(level, tripRows[level.n])).join('\n')}
</div>
${competitionSection()}
<section class="lv-test" id="test" aria-labelledby="lv-test-title" tabindex="-1">
<div class="lv-test-inner section-width">
<div class="lv-test-intro"><h2 id="lv-test-title">¿Cuál es tu nivel?</h2><p>Doce preguntas de sí o no. Si dudas, responde «Todavía no»: así el resultado te ayuda más.</p></div>
<div class="lv-test-card" data-level-test><noscript><p>El test necesita JavaScript. Puedes encontrar tu nivel en la guía de arriba o escribirnos por WhatsApp.</p></noscript></div>
</div>
</section>
<script type="application/json" id="level-test-data">${JSON.stringify({
    test: LEVEL_TEST,
    names: Object.fromEntries([...SUBLEVELS, ...COMPETITION.subs].map(s => [s.c, s.t])),
    descriptions: Object.fromEntries(SUBLEVELS.map(s => [s.c, s.d])),
    levels: Object.fromEntries(SURF_LEVELS.map(l => [l.n, l.name])),
  }).replace(/</g, '\\u003c')}</script>`;
}

export function renderLevelGuide(current, tripRows = {}) {
  const markers = /<!-- level-guide:start -->[\s\S]*?<!-- level-guide:end -->/;
  if (!markers.test(current)) throw Error('Missing level guide generation markers');
  return current.replace(markers, `<!-- level-guide:start -->\n${levelGuideHtml(tripRows)}\n<!-- level-guide:end -->`);
}
