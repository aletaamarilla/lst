// Optional browser acceptance checks for the home. Uses the same external runtime as other LST checks.
import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile, stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
const {chromium} = createRequire(import.meta.url)(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.LST_QA_OUTPUT || '/tmp/lst-home-browser';
await mkdir(output, {recursive:true});
const root = path.resolve('dist');
const trips = JSON.parse(await readFile(path.join(root,'catalog-snapshot.json'),'utf8')).trips;
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{
 let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(file!==root&&!file.startsWith(root+path.sep))throw Error('path');
 if((await stat(file)).isDirectory())file=path.join(file,'index.html');
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
 res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});
const report={checks:0,issues:[],errors:[],views:[]};
const check=(name,pass,detail)=>{report.checks++;if(!pass)report.issues.push({name,detail});};
const PAPER='rgb(255, 250, 231)',INK='rgb(27, 27, 27)';
const SECTIONS=['hp-hero','viajes','reservar','niveles','nosotros','experiencia','dudas','hp-close'];
const watch=(page,tag)=>{page.on('pageerror',e=>report.errors.push({tag,message:e.message}));page.on('console',m=>{if(m.type()==='error')report.errors.push({tag,console:m.text()});});};
const eager=page=>page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
const double=page=>page.evaluate(()=>{const es=[...document.querySelectorAll('body,body *')],sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
const overflow=page=>page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,wide:[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&!e.closest('.hp-rail,.hp-strip,.hp-chips')&&e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,cls:String(e.className),text:e.textContent.trim().slice(0,50)}))}));
const until=(page,fn,arg)=>page.waitForFunction(fn,arg,{timeout:3000}).then(()=>true,()=>false);
const visibleTickets=page=>page.locator('.hp-ticket').evaluateAll(es=>es.filter(e=>!e.hidden&&e.getClientRects().length).map(e=>e.querySelector('h3').textContent.trim()));

try{
 for(const width of [320,375,768,1024,1440]){
  const tag=String(width);
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width<700});
  const page=await context.newPage();watch(page,tag);
  check(tag+' HTTP 200',(await page.goto(base+'/')).status()===200);
  await page.evaluate(()=>document.fonts.ready);await eager(page);

  // Fonts, palette and order of the page.
  const fonts=await page.evaluate(()=>{const loaded=f=>[...document.fonts].some(x=>x.family.replace(/["']/g,'')===f&&x.status==='loaded');return {display:getComputedStyle(document.querySelector('.hp-h1-a')).fontFamily,heading:getComputedStyle(document.querySelector('.hp-h2')).fontFamily,body:getComputedStyle(document.body).fontFamily,aura:loaded('Aura'),workSans:loaded('Work Sans'),auraFile:performance.getEntriesByType('resource').some(e=>new URL(e.name).pathname==='/assets/fonts/aura.woff2')};});
  check(tag+' Aura and Work Sans load and are used',fonts.display.startsWith('Aura')&&fonts.heading.startsWith('Aura')&&fonts.body.includes('Work Sans')&&fonts.aura&&fonts.workSans&&fonts.auraFile,fonts);
  const surfaces=await page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,trips:getComputedStyle(document.querySelector('#viajes')).backgroundColor,close:getComputedStyle(document.querySelector('.hp-close')).backgroundColor}));
  check(tag+' cream page, trips right after the hero and dark close',surfaces.body===PAPER&&surfaces.close===INK,surfaces);
  const order=await page.locator('main > section').evaluateAll(es=>es.map(e=>e.id||e.classList[0]));
  check(tag+' sections in order, trips right after the hero',JSON.stringify(order)===JSON.stringify(SECTIONS),order);

  // Hero: one photo anchored right and faded into ink, headline, next departure.
  const hero=await page.evaluate(()=>{const h=document.querySelector('.hp-hero.hp-hero-home'),bg=h.querySelector('.hp-hero-bg'),img=bg.querySelector('img'),copy=h.querySelector('.hp-hero-copy'),r=e=>e.getBoundingClientRect();
   return {hero:r(h).toJSON(),bg:r(bg).toJSON(),copy:r(copy).toJSON(),src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0,cover:getComputedStyle(img).objectFit==='cover',alt:img.alt,
    h1:document.querySelectorAll('h1').length,sr:h.querySelector('h1 .hp-sr').textContent.trim(),lead:h.querySelector('.hp-h1-a').textContent.trim(),word:h.querySelector('.hp-rot').textContent.trim()};});
  check(tag+' hero photo is the group photo, loaded and cropped with cover',hero.src==='/assets/group.webp'&&hero.loaded&&hero.cover&&hero.alt.length>10,hero);
  // On desktop the group starts a quarter into the photo: the copy must end before it (no face under text).
  check(tag+' hero layout',width>=1000?(hero.copy.right<=hero.bg.left+hero.bg.width*.25+1&&Math.abs(hero.bg.height-hero.hero.height)<2&&hero.bg.right>=width-1):(Math.abs(hero.bg.width-width)<1&&hero.bg.top<=hero.hero.top+1),hero);
  check(tag+' headline',hero.h1===1&&hero.sr==='¿Te vienes a surfear?'&&hero.lead==='¿Te vienes a'&&hero.word==='surfear?',hero);
  const next=await page.locator('.hp-hero .hp-next').evaluate(e=>({href:e.getAttribute('href'),text:e.textContent.replace(/\s+/g,' ').trim(),height:e.getBoundingClientRect().height,first:document.querySelector('.hp-ticket .hp-ticket-name a').getAttribute('href'),bar:document.querySelector('.hp-bar-info').getAttribute('href')}));
  check(tag+' next departure card links to the first ticket',next.text.startsWith('Próxima salida')&&/€/.test(next.text)&&next.href===next.first&&next.href===next.bar&&next.height>=44,next);

  // Keyboard focus stays visible on the interactive parts (checked before any pointer use, after a Tab).
  await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>{document.querySelectorAll('#dudas details').forEach(d=>d.open=false);return [...document.querySelectorAll('.hp-hero .hp-btn,.hp-next,.hp-chip,.hp-rail,.hp-ticket-name a,.hp-acts .hp-btn,.hp-opts button,.hp-strip-btn:not(:disabled),.hp-strip,#dudas summary,.hp-close .hp-btn,.lst-footer-links a')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>{e.focus();const s=getComputedStyle(e);return {cls:String(e.className),text:e.textContent.trim().slice(0,30),active:e===document.activeElement,visible:e.matches(':focus-visible'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth)};});});
  const unfocused=focus.filter(f=>!f.active||!f.visible||f.outline==='none'||f.width<2);
  check(tag+' keyboard focus is visible',focus.length>20&&unfocused.length===0,{checked:focus.length,unfocused});

  // Ticket rail and level chips.
  const tickets=await page.locator('.hp-ticket').evaluateAll(es=>es.map(e=>({href:e.querySelector('.hp-ticket-name a').getAttribute('href'),price:e.querySelector('.hp-price').textContent,alt:e.querySelector('img').alt,loaded:e.querySelector('img').complete&&e.querySelector('img').naturalWidth>0,date:e.querySelector('.hp-tag-date')?.textContent.trim()})));
  const pending=await page.locator('.hp-pending a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
  const slugs=trips.map(t=>`/viajes/${t.slug}/`);
  check(tag+' every published trip is a ticket or announced as coming soon',tickets.length+pending.length===trips.length&&[...tickets.map(t=>t.href),...pending].every(h=>slugs.includes(h)),{tickets:tickets.map(t=>t.href),pending});
  check(tag+' tickets show photo, date and price',tickets.length>0&&tickets.every(t=>t.loaded&&t.alt.length>5&&t.date&&/\d.*€/.test(t.price)),tickets);
  const chips=page.locator('.hp-chip');
  check(tag+' four level chips, "Todas" pressed',await chips.count()===4&&JSON.stringify(await chips.evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed'))))==='["true","false","false","false"]');
  for(let i=0;i<4;i++){
   const chip=chips.nth(i);await chip.click();
   const state=await chips.evaluateAll(es=>es.map(e=>e.getAttribute('aria-pressed')));
   const expected=Number((await chip.locator('.hp-chip-count').textContent()).trim());
   const shown=await visibleTickets(page);
   check(`${tag} chip ${i} filters the rail`,state.filter(s=>s==='true').length===1&&state[i]==='true'&&shown.length===expected&&expected>0,{state,expected,shown});
  }
  await chips.first().click();check(tag+' "Todas" restores every ticket',(await visibleTickets(page)).length===tickets.length);

  // Booking steps, levels and quiz.
  check(tag+' booking steps',await page.locator('#reservar .hp-steps > li').count()===3&&(await page.locator('#booking-title').textContent()).trim()==='Así se reserva');
  check(tag+' four levels',await page.locator('#niveles .hp-lvl').count()===4);
  const quiz=page.locator('#niveles .hp-quiz');
  check(tag+' quiz is shown with JavaScript',await quiz.isVisible()&&await quiz.locator('.hp-q').count()===3);
  await quiz.locator('.hp-q.is-on .hp-opts button[data-v="1"]').click();
  check(tag+' quiz moves focus to the next question',await quiz.locator('.hp-q').nth(1).evaluate(q=>q.classList.contains('is-on')&&q.contains(document.activeElement)));
  await quiz.locator('.hp-q.is-on .hp-opts button[data-v="1"]').click();
  await quiz.locator('.hp-q.is-on .hp-opts button[data-v="0"]').click();
  const result=await page.evaluate(()=>({shown:!document.querySelector('.hp-result').hidden,level:document.querySelector('.hp-result-level').textContent,on:[...document.querySelectorAll('.hp-lvl.is-on')].map(e=>e.dataset.lvl)}));
  check(tag+' quiz result highlights a level',result.shown&&result.level==='Nivel 2 · Base'&&JSON.stringify(result.on)==='["2"]',result);
  await quiz.locator('[data-quiz-go]').click();
  check(tag+' quiz result filters the trips',await page.locator('.hp-chip[data-filter="2"]').getAttribute('aria-pressed')==='true'&&new URL(page.url()).hash==='#viajes');
  await quiz.locator('[data-quiz-reset]').click();
  check(tag+' quiz restarts',await quiz.locator('.hp-q').first().evaluate(q=>q.classList.contains('is-on')&&q.contains(document.activeElement))&&await page.locator('.hp-result').isHidden());
  await chips.first().click();

  // Crew, photo strip, FAQ, closing and footer.
  check(tag+' crew leads to Conócenos',await page.locator('#nosotros a[href="/conocenos/"]').count()===1);
  const strip=page.locator('.hp-strip'),stripNav=page.locator('[data-strip-nav]');
  check(tag+' photo strip has captioned photos',await strip.locator('figure').evaluateAll(fs=>fs.length===5&&fs.every(f=>f.querySelector('img').alt.length>10&&f.querySelector('figcaption').textContent.trim())));
  if(width>=760){
   const prev=stripNav.locator('[data-strip="-1"]'),nextButton=stripNav.locator('[data-strip="1"]');
   check(tag+' strip arrows visible, previous disabled at start',await stripNav.isVisible()&&await prev.isDisabled()&&await nextButton.isEnabled());
   const before=await strip.evaluate(e=>e.scrollLeft);await nextButton.click();
   check(tag+' next arrow scrolls the strip and enables previous',await until(page,b=>document.querySelector('.hp-strip').scrollLeft>b+10&&!document.querySelector('[data-strip="-1"]').disabled,before));
   await prev.click();
   check(tag+' previous arrow returns',await until(page,()=>document.querySelector('.hp-strip').scrollLeft<=2&&document.querySelector('[data-strip="-1"]').disabled));
  }else check(tag+' strip arrows hidden on small screens (swipe)',!await stripNav.isVisible());
  check(tag+' home keeps three FAQ questions and the link to all',await page.locator('#dudas details').count()===3&&await page.locator('#dudas a[href="/preguntas-frecuentes/"]').count()===1);
  await page.locator('#dudas summary').first().click();check(tag+' FAQ question opens',await page.locator('#dudas details').first().evaluate(e=>e.open));
  const close=await page.locator('.hp-close.hp-close-photo').evaluate(e=>({img:e.querySelector('img').complete&&e.querySelector('img').naturalWidth>0,alt:e.querySelector('img').alt,links:[...e.querySelectorAll('a')].map(a=>a.getAttribute('href'))}));
  check(tag+' closing photo and actions',close.img&&close.alt.length>10&&close.links[0]==='#viajes'&&close.links[1]?.startsWith('https://wa.me/34648189257?'),close);
  check(tag+' footer links',await page.locator('.lst-footer .lst-footer-links a').count()===5&&await page.locator('.lst-footer .footer-legal a').count()===4);

  // Every image loads and has a text alternative (empty only when the image repeats nearby text).
  const images=await page.evaluate(()=>[...document.images].map(i=>({src:i.getAttribute('src').slice(0,70),alt:i.getAttribute('alt'),loaded:i.complete&&i.naturalWidth>0,decorative:i.getAttribute('aria-hidden')==='true'||!!i.closest('[aria-hidden="true"]')||(i.getAttribute('alt')===''&&!!i.closest('a')?.textContent.trim())})));
  check(tag+' images load',images.every(i=>i.loaded),images.filter(i=>!i.loaded));
  check(tag+' images have alt text',images.every(i=>i.alt!==null&&(i.alt.trim().length>0||i.decorative)),images.filter(i=>i.alt===null||(!i.alt.trim()&&!i.decorative)));

  // Tap targets: every stand-alone link or button in main, the footer and the mobile bar (44px tall; icon-only ones 44px wide too).
  const small=await page.evaluate(()=>[...document.querySelectorAll('main a, main button, main summary, .lst-footer-links a, .footer-legal a, .hp-bar a')].filter(e=>{if(!e.getClientRects().length)return false;const p=e.closest('p,li');const inRunningText=!!p&&p.textContent.trim()!==e.textContent.trim();return !inRunningText;}).map(e=>({where:(c=>c&&(c.id?'#'+c.id:'.'+c.classList[0]))(e.closest('section[id],section,footer,nav.hp-bar')),cls:String(e.className),text:e.textContent.trim().slice(0,40),height:Math.round(e.getBoundingClientRect().height),width:Math.round(e.getBoundingClientRect().width)})).filter(e=>e.height<44||(!e.text&&e.width<44)));
  check(tag+' tap targets at least 44px',small.length===0,small);

  // In-page anchors and the fixed header.
  const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.querySelector(h)));
  check(tag+' every in-page anchor has a target',anchors.length===0,anchors);
  await page.evaluate(()=>scrollTo(0,0));
  await page.locator('.hp-hero .hp-btn[href="#viajes"]').click();
  await page.waitForFunction(()=>document.querySelector('.site-header').classList.contains('is-scrolled'));
  const arrival=await page.evaluate(()=>({title:document.querySelector('#trips-title').getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,viewport:innerHeight}));
  check(tag+' hero CTA lands on the trips below the fixed header',arrival.title>=arrival.header-1&&arrival.title<arrival.viewport,arrival);
  check(tag+' scrolled header turns paper with the dark logo',await page.locator('.site-header').evaluate(e=>getComputedStyle(e).position==='fixed'&&getComputedStyle(e).backgroundColor==='rgb(255, 250, 231)')&&await page.locator('.site-header .brand-dark').isVisible());

  // Mobile bar: only once the hero has scrolled away, never on desktop.
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
  const barTop=await page.locator('.hp-bar').isVisible();
  await page.locator('#niveles').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
  const barLater=await page.locator('.hp-bar').isVisible();
  check(tag+' mobile bar timing',width>=1000?(!barTop&&!barLater):(!barTop&&barLater),{barTop,barLater});

  if(width<1000){
   await page.evaluate(()=>scrollTo(0,0));
   const toggle=page.locator('.menu-toggle');await toggle.click();
   check(tag+' mobile menu opens',await toggle.getAttribute('aria-expanded')==='true'&&await page.locator('#main-nav').isVisible());
   await page.keyboard.press('Escape');
   check(tag+' mobile menu closes with Escape',!await page.locator('#main-nav').isVisible()&&await toggle.evaluate(e=>e===document.activeElement));
  }

  const layout=await overflow(page);report.views.push({width,layout});
  check(tag+' no horizontal overflow',layout.scrollWidth<=width+1&&layout.wide.length===0,layout);
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});

  // Every internal link on the home answers.
  if(width===1440){
   const hrefs=await page.evaluate(()=>[...new Set([...document.querySelectorAll('a[href^="/"]')].map(a=>new URL(a.href).pathname))]);
   const broken=[];for(const href of hrefs){const r=await page.request.get(base+href);if(r.status()!==200)broken.push({href,status:r.status()});}
   check('internal links answer 200',broken.length===0,broken);
  }

  await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);await double(page);
  const doubled=await overflow(page);
  check(tag+' no page scroll sideways with 200% text',doubled.scrollWidth<=width+1,doubled);
  if([375,1440].includes(width))await page.screenshot({path:path.join(output,`home-text200-${width}.png`),fullPage:true});
  await context.close();
 }

 // Normal motion: the word rotates through the destinations without moving the layout, then stops on "surfear?".
 {
  const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();watch(page,'motion');
  await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{const rot=document.querySelector('.hp-rot'),h1=rot.closest('h1');window.__rot={seen:[rot.textContent.trim()],heights:[h1.getBoundingClientRect().height]};new MutationObserver(()=>{const last=rot.lastElementChild?.textContent.trim();if(last&&window.__rot.seen.at(-1)!==last)window.__rot.seen.push(last);window.__rot.heights.push(h1.getBoundingClientRect().height);}).observe(rot,{childList:true});});
  const words=JSON.parse(await page.locator('.hp-rot').getAttribute('data-words'));
  await page.waitForFunction(n=>window.__rot.seen.length>=n&&document.querySelector('.hp-rot').children.length===1,words.length+2,{timeout:40000});
  const rot=await page.evaluate(()=>({...window.__rot,final:document.querySelector('.hp-rot').textContent.trim()}));
  check('headline rotates through the destinations and stops on "surfear?"',JSON.stringify(rot.seen)===JSON.stringify(['surfear?',...words,'surfear?'])&&rot.final==='surfear?',rot.seen);
  check('rotating word keeps the headline height',Math.max(...rot.heights)-Math.min(...rot.heights)<1,rot.heights);
  await context.close();
 }

 // Without JavaScript: everything stays visible and linked.
 for(const width of [375,1440]){
  const tag=width+' no-JS';
  const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false});const page=await context.newPage();watch(page,tag);
  await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);
  check(tag+' static navigation',await page.locator('.static-navigation').isVisible()&&await page.locator('.static-navigation a').count()===4);
  const header=await page.locator('.site-header').evaluate(e=>({ink:getComputedStyle(e).color,paper:getComputedStyle(e).backgroundColor,light:getComputedStyle(e.querySelector('.brand-light')).display,dark:getComputedStyle(e.querySelector('.brand-dark')).display,trip:getComputedStyle(e.querySelector('.lst-header-trip')).color}));
  check(tag+' paper header shows the dark logo and ink text',header.paper===PAPER&&header.ink===INK&&header.light==='none'&&header.dark==='block'&&header.trip===INK,header);
  check(tag+' all tickets visible',(await visibleTickets(page)).length===await page.locator('.hp-ticket').count());
  check(tag+' quiz and strip arrows stay hidden',await page.locator('.hp-quiz').isHidden()&&await page.locator('[data-strip-nav]').isHidden());
  check(tag+' headline reads "surfear?"',(await page.locator('.hp-rot').textContent()).trim()==='surfear?');
  check(tag+' mobile bar',width>=1000?await page.locator('.hp-bar').isHidden():await page.locator('.hp-bar').isVisible());
  const layout=await overflow(page);check(tag+' no horizontal overflow',layout.scrollWidth<=width+1&&layout.wide.length===0,layout);
  await page.screenshot({path:path.join(output,`home-nojs-${width}.png`)});
  await context.close();
 }
}finally{
 await browser.close();await new Promise(r=>server.close(r));
 await writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));
}
if(report.issues.length||report.errors.length)throw Error(JSON.stringify({issues:report.issues,errors:report.errors},null,2));
console.log(`PASS: ${report.checks} home browser checks; hero, rail filters, quiz, strip, anchors, focus, tap targets, 200% text, motion and no JS. Evidence: ${output}`);
