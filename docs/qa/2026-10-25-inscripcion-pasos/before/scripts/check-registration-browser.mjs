// Optional browser QA. Intercept every external request; never create a Brevo contact.
import {createRequire} from 'node:module';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createSiteServer} from './serve.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE || 'playwright');
const output=path.resolve(process.env.LST_QA_OUTPUT || 'docs/qa/2026-10-25-brevo/browser');
await mkdir(output,{recursive:true});
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const server=createSiteServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:process.env.LST_CHROMIUM_PATH});
const errors=[],results=[];let submissions=[],mode='success';
const check=(name,actual,expected=true)=>{assert.deepEqual(actual,expected,name);results.push(name);};
async function route(context) {
 await context.route('https://**/*',async r=>{
  const u=r.request().url();
  if(u.startsWith('https://cdn.sanity.io/'))return r.fulfill({body:await readFile('dist/assets/community.webp'),contentType:'image/webp'});
  if(u.includes('.sibforms.com/serve/')&&r.request().method()==='POST'){
   submissions.push({url:u,body:r.request().postData()});
   if(mode==='network')return r.abort('failed');
   if(mode==='native')return r.fulfill({contentType:'text/html',body:'<h1>Native submission intercepted</h1>'});
   const body=mode==='malformed'?'not-json':JSON.stringify(mode==='rejected'?{success:false,message:'Revisa tu email.',errors:{EMAIL:'Email rechazado por Brevo.'}}:{success:true,...(mode==='redirect-malformed'?{redirect:'::::'}:mode==='redirect-insecure'?{redirect:'javascript:alert(1)'}:{})});
   await new Promise(resolve=>setTimeout(resolve,100));
   return r.fulfill({status:mode==='http'?503:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body});
  }
  return r.abort();
 });
}
async function fill(page) {
 for(const [name,value] of Object.entries({NOMBRE:'Prueba',APELLIDOS:'Local',EMAIL:'qa@example.test',WHATSAPP:'600000000',FECHADENACIMIENTO:'15-06-1995',DNI:'DOCUMENTO-PRUEBA',DIRECCION:'Dirección de prueba',CIUDAD:'Madrid',CODIGO_POSTAL:'28001',PAIS:'España',MOTIVA:'Verificación local sin envío real'}))await page.locator(`[name="${name}"]`).fill(value);
 for(const name of ['NIVEL_SURF','TALLA_CAMISETA','CONQUIENVIAJO','MATERIAL','CONOCIDO'])await page.locator(`[name="${name}"]`).first().check();
}
try {
 for(const width of [320,390,768,1440]) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await route(context);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const trip of trips) {
   await page.goto(origin+`/inscripciones/${trip.slug}/`);await page.evaluate(()=>document.fonts.ready);
   check(`${trip.slug} ${width}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   check(`${trip.slug} ${width}: correct trip`,(await page.locator('h1').innerText()).includes(trip.name));
   check(`${trip.slug} ${width}: native phone prefix`,await page.locator('[name=WHATSAPP__COUNTRY_CODE]').inputValue(),'+34');
   check(`${trip.slug} ${width}: date selection is explicit`,await page.locator('[name=VIAJE_SURF]:checked').count(),trip.departures.length===1?1:0);
   check(`${trip.slug} ${width}: controls have accessible labels`,await page.locator('input:not([type=hidden]):not([type=radio]):not([name=email_address_check])').evaluateAll(nodes=>nodes.every(n=>n.labels.length>0)));
   check(`${trip.slug} ${width}: submit touch target`,(await page.locator('button[type=submit]').boundingBox()).height>=44);
  }
  await page.goto(origin+'/inscripciones/marruecos/');
  await page.screenshot({path:path.join(output,`marruecos-${width}.png`),fullPage:width===390});
  if(width===320){
   await page.evaluate(()=>{const nodes=[...document.querySelectorAll('body,body *')];const sizes=nodes.map(e=>parseFloat(getComputedStyle(e).fontSize));nodes.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   check('text at 200% stays within 320px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844}});await route(context);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const trip=trips.find(t=>t.slug==='marruecos'),second=trip.departures[1];
 await page.goto(origin+`/inscripciones/marruecos/?salida=${second.id}`);
 check('dated URL selects the second Brevo category',await page.locator('[name=VIAJE_SURF]:checked').inputValue(),'4');
 await fill(page);
 await page.locator('[name=FECHADENACIMIENTO]').fill('31-02-1995');
 check('impossible birth date rejected',await page.locator('#sib-form').evaluate(f=>f.checkValidity()),false);
 await page.locator('[name=FECHADENACIMIENTO]').fill('15-06-1995');
 check('valid completed form accepted by native validation',await page.locator('#sib-form').evaluate(f=>f.checkValidity()));
 mode='success';submissions=[];
 await page.locator('#sib-form').evaluate(f=>{f.requestSubmit();f.requestSubmit();});
 await page.waitForSelector('#success-message.sib-form-message-panel--active');
 check('double submit sends exactly once',submissions.length,1);
 const payload=submissions[0];check('AJAX endpoint uses Brevo response mode',new URL(payload.url).searchParams.get('isAjax'),'1');
 for(const [name,value] of [['VIAJE_SURF','4'],['WHATSAPP__COUNTRY_CODE','+34'],['FECHADENACIMIENTO','15-06-1995'],['locale','es']])check(`payload ${name} exact`,payload.body.includes(`name="${name}"\r\n\r\n${value}\r\n`));
 check('submit disabled after success',await page.locator('button[type=submit]').isDisabled());
 check('success announced accessibly',await page.locator('#success-message').evaluate(e=>e===document.activeElement));
 for(const failure of ['rejected','network','malformed','http']) {
  mode=failure;await page.goto(origin+'/inscripciones/el-palmar/');await fill(page);submissions=[];
  await page.locator('button[type=submit]').click();await page.waitForSelector('#error-message.sib-form-message-panel--active');
  check(`${failure}: form data retained`,await page.locator('[name=NOMBRE]').inputValue(),'Prueba');
  check(`${failure}: manual retry possible`,await page.locator('button[type=submit]').isEnabled());
  check(`${failure}: no automatic retries`,submissions.length,1);
  if(failure==='rejected')check('server field error rendered',await page.locator('[name=EMAIL]').locator('xpath=ancestor::div[contains(@class,"form__entry")]').locator('.entry__error').innerText(),'Email rechazado por Brevo.');
 }
 for(const redirectMode of ['redirect-malformed','redirect-insecure']) {
  mode=redirectMode;await page.goto(origin+'/inscripciones/el-palmar/');await fill(page);
  await page.locator('button[type=submit]').click();await page.waitForSelector('#success-message.sib-form-message-panel--active');
  check(`${redirectMode}: successful submission stays confirmed`,await page.locator('#error-message').isVisible(),false);
  check(`${redirectMode}: successful submission cannot be repeated`,await page.locator('button[type=submit]').isDisabled());
 }
 await page.goto(origin+'/inscripciones/marruecos/?salida=incorrecta');
 check('invalid dated URL shows actionable error',await page.locator('#registration-date-error').isVisible());
 check('invalid dated URL cannot silently choose another trip',await page.locator('[name=VIAJE_SURF]:checked').count(),0);
 await page.locator('[name=VIAJE_SURF]').last().check();check('choosing a valid date clears URL error',await page.locator('#registration-date-error').isVisible(),false);
 await page.goto(origin+'/inscripciones/marruecos-2027-01-24/');check('historical route selects matching date',await page.locator('[name=VIAJE_SURF]:checked').inputValue(),'4');
 await page.goto(origin+'/viajes/marruecos/');await page.locator('[data-open-dates]:visible').first().click();
 const link=page.locator('#departure-dialog [data-registration]').last();await link.click();
 check('trip selector links to the chosen registration date',await page.locator('[name=VIAJE_SURF]:checked').inputValue(),'4');
 check('unknown slug remains 404',(await page.goto(origin+'/inscripciones/desconocido/')).status(),404);
 await context.close();
 console.log('Responsive, AJAX payload, error and date-link assertions passed.');
 const noJs=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',viewport:{width:390,height:844}});await route(noJs);const native=await noJs.newPage();
 await native.goto(origin+'/inscripciones/hossegor/');check('without JS single date preselected',await native.locator('[name=VIAJE_SURF]:checked').inputValue(),'1');
 await fill(native);mode='native';submissions=[];await native.locator('button[type=submit]').click();await native.waitForSelector('h1');
 check('without JS native POST reaches the same endpoint',submissions.length,1);
 check('native POST does not request AJAX',new URL(submissions[0].url).searchParams.has('isAjax'),false);
 await native.goto(origin+'/inscripciones/marruecos/');check('without JS multiple dates remain selectable',await native.locator('[name=VIAJE_SURF]').count(),2);
 await noJs.close();
 check('no product JavaScript errors',errors,[]);
 await writeFile(path.join(output,'results.json'),JSON.stringify({checks:results.length,results,errors,externalSubmissions:0},null,2)+'\n');
 console.log(`PASS: ${results.length} browser assertions at 320/390/768/1440px, exact POST payload, date links/aliases, native fallback, success/rejections/network/invalid JSON/HTTP errors, double submission and 200% text. No external submissions.`);
} finally {await browser.close();await new Promise(r=>server.close(r));}
