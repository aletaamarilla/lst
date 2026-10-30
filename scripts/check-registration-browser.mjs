// Browser acceptance: all external submissions are intercepted, never sent to Brevo.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createSiteServer} from './serve.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const output=path.resolve(process.env.LST_QA_OUTPUT||'docs/qa/2026-10-25-inscripcion-pasos/browser');await mkdir(output,{recursive:true});
const trips=JSON.parse(await readFile('dist/catalog-snapshot.json','utf8')).trips;
const server=createSiteServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:process.env.LST_CHROMIUM_PATH});
const errors=[],results=[];let submissions=[],mode='success';
const check=(name,actual,expected=true)=>{assert.deepEqual(actual,expected,name);results.push(name);};
const groups=[{NOMBRE:'Prueba',APELLIDOS:'Local',EMAIL:'qa@example.test',WHATSAPP:'600000000'},
 {FECHADENACIMIENTO:'15-06-1995',DNI:'DOCUMENTO-PRUEBA',DIRECCION:'Dirección de prueba',CIUDAD:'Madrid',CODIGO_POSTAL:'28001',PAIS:'España'},
 {MATERIAL_MEDIDAS:'6 pies'}, {ACOMPANANTES:'Amistad de prueba'},
 {ALERGIAS_INTOLERANCIAS:'Sin preferencias',ENFERMEDAD_PROBLEMA:'Sin observaciones',MOTIVA:'Verificación local sin envío real'}];
const radios=[[],[],['NIVEL_SURF','MATERIAL'],['TALLA_CAMISETA','CONQUIENVIAJO'],['CONOCIDO']];
async function routing(context){
 await context.route('https://**/*',async r=>{
  const url=r.request().url();
  if(url.startsWith('https://cdn.sanity.io/'))return r.fulfill({body:await readFile('dist/assets/community.webp'),contentType:'image/webp'});
  if(url.includes('.sibforms.com/serve/')&&r.request().method()==='POST'){
   submissions.push({url,body:r.request().postData()});
   if(mode==='network')return r.abort('failed');
   if(mode==='native')return r.fulfill({contentType:'text/html',body:'<h1>Native POST intercepted</h1>'});
   await new Promise(resolve=>setTimeout(resolve,100));
   const response=mode==='rejected'?{success:false,message:'Revisa tu email.',errors:{EMAIL:'Email rechazado por Brevo.'}}:{success:true,...(mode==='redirect-malformed'?{redirect:'::::'}:mode==='redirect-insecure'?{redirect:'javascript:alert(1)'}:{})};
   return r.fulfill({status:mode==='http'?503:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:mode==='malformed'?'not-json':JSON.stringify(response)});
  }
  return r.abort();
 });
}
async function fillStep(page,index){
 if(index===0&&await page.locator('[name=VIAJE_SURF]:checked').count()===0)await page.locator('[name=VIAJE_SURF]').first().check();
 for(const [name,value] of Object.entries(groups[index]))await page.locator(`[name="${name}"]`).fill(value);
 for(const name of radios[index])await page.locator(`[name="${name}"]`).first().check();
}
async function complete(page){for(let i=0;i<5;i++){await fillStep(page,i);if(i<4)await page.locator('[data-step-next]').click();}}
async function contextFor(width=390,js=true){const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:js,reducedMotion:'reduce'});await routing(context);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));return{context,page};}
try{
 for(const width of [320,390,768,1440]){
  const {context,page}=await contextFor(width);
  for(const trip of trips){
   await page.goto(origin+`/inscripciones/${trip.slug}/`);await page.evaluate(()=>document.fonts.ready);
   check(`${trip.slug} ${width}: one visible step`,await page.locator('[data-registration-step]:visible').count(),1);
   check(`${trip.slug} ${width}: starts on first step`,await page.locator('#sib-form').getAttribute('data-current-step'),'0');
   check(`${trip.slug} ${width}: correct trip`,(await page.locator('h1').innerText()).includes(trip.name));
   check(`${trip.slug} ${width}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   check(`${trip.slug} ${width}: next touch target`,(await page.locator('[data-step-next]').boundingBox()).height>=44);
   check(`${trip.slug} ${width}: no premature submit`,await page.locator('button[type=submit]').isVisible(),false);
   check(`${trip.slug} ${width}: date selection`,await page.locator('[name=VIAJE_SURF]:checked').count(),trip.departures.length===1?1:0);
  }
  await page.goto(origin+'/inscripciones/el-palmar/');
  for(let step=0;step<5;step++){
   check(`${width} step ${step}: exactly one section`,await page.locator('[data-registration-step]:visible').count(),1);
   check(`${width} step ${step}: correct section`,await page.locator('#sib-form').getAttribute('data-current-step'),String(step));
   check(`${width} step ${step}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   check(`${width} step ${step}: active progress`,await page.locator('[aria-current=step]').getAttribute('data-go-step'),String(step));
   check(`${width} step ${step}: announcement stays visually hidden`,await page.locator('#registration-step-announcement').evaluate(e=>e.getBoundingClientRect().width<=1&&e.getBoundingClientRect().height<=1));
   check(`${width} step ${step}: skip link stays outside view until focused`,await page.locator('.skip-link').evaluate(e=>e.getBoundingClientRect().bottom<=0));
   if([390,1440].includes(width)&&[0,2,4].includes(step)){
    // Capture from the top so Chromium does not composite offscreen fixed links into a full-page image.
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,`el-palmar-${width}-step${step+1}.png`),fullPage:true});
   }
   await fillStep(page,step);
   if(step<4)await page.locator('[data-step-next]').click();
  }
  if(width===320){
   await page.evaluate(()=>{const nodes=[...document.querySelectorAll('body,body *')],sizes=nodes.map(e=>parseFloat(getComputedStyle(e).fontSize));nodes.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
   check('200% text fits at 320px',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await context.close();
 }
 console.log('All trips and five steps fit at four screen widths.');
 const {context,page}=await contextFor();const multi=trips.find(t=>t.departures.length>1),second=multi.departures[1];
 await page.goto(origin+`/inscripciones/${multi.slug}/?salida=${second.id}`);
 check('URL selects exact second departure',await page.locator('[name=VIAJE_SURF]:checked').getAttribute('data-departure-id'),second.id);
 check('future progress cannot skip required fields',await page.locator('[data-go-step="4"]').isDisabled());
 await page.locator('[data-step-next]').click();check('empty step cannot advance',await page.locator('#sib-form').getAttribute('data-current-step'),'0');
 await fillStep(page,0);await page.locator('[name=EMAIL]').fill('incorrecto');await page.locator('[data-step-next]').click();
 check('invalid email cannot advance',await page.locator('#sib-form').getAttribute('data-current-step'),'0');
 await page.locator('[name=EMAIL]').fill('qa@example.test');await page.locator('[name=EMAIL]').press('Enter');
 check('Enter advances without sending',await page.locator('#sib-form').getAttribute('data-current-step'),'1');check('Enter did not submit to Brevo',submissions.length,0);
 check('step focus follows navigation',await page.locator('[data-registration-step="1"]').evaluate(e=>e===document.activeElement));
 await fillStep(page,1);await page.locator('[name=FECHADENACIMIENTO]').fill('31-02-1995');await page.locator('[data-step-next]').click();
 check('impossible date cannot advance',await page.locator('#sib-form').getAttribute('data-current-step'),'1');
 await page.locator('[name=FECHADENACIMIENTO]').fill('15-06-1995');await page.locator('[data-step-prev]').click();
 check('back preserves name',await page.locator('[name=NOMBRE]').inputValue(),'Prueba');
 check('back preserves selected trip',await page.locator('[name=VIAJE_SURF]:checked').getAttribute('data-departure-id'),second.id);
 await page.locator('[data-go-step="1"]').click();await page.locator('[data-step-next]').click();
 for(let i=2;i<5;i++){await fillStep(page,i);if(i<4)await page.locator('[data-step-next]').click();}
 await page.locator('[data-go-step="0"]').click();await page.locator('[name=EMAIL]').fill('');await page.locator('[data-go-step="4"]').click();
 await page.locator('button[type=submit]').click();check('final validation reveals earlier invalid step',await page.locator('#sib-form').getAttribute('data-current-step'),'0');
 check('invalid hidden fields do not send',submissions.length,0);
 await page.locator('[name=EMAIL]').fill('qa@example.test');await page.locator('[data-go-step="4"]').click();
 mode='rejected';await page.locator('button[type=submit]').click();await page.waitForSelector('#error-message.sib-form-message-panel--active');
 check('server field error reveals contact step',await page.locator('#sib-form').getAttribute('data-current-step'),'0');
 check('server error is connected to field',await page.locator('[name=EMAIL]').getAttribute('aria-invalid'),'true');
 check('server error is readable',await page.locator('#error-EMAIL').innerText(),'Email rechazado por Brevo.');
 await page.locator('[name=EMAIL]').fill('fixed@example.test');await page.locator('[data-go-step="4"]').click();
 mode='success';submissions=[];
 await page.locator('#sib-form').evaluate(f=>{f.requestSubmit();f.requestSubmit();});
 check('navigation locked during send',await page.locator('[data-go-step="0"]').isDisabled());
 await page.waitForSelector('#success-message.sib-form-message-panel--active');
 check('duplicate send prevented',submissions.length,1);check('form hidden after success',await page.locator('#sib-form').isVisible(),false);
 check('success has keyboard focus',await page.locator('#success-message').evaluate(e=>e===document.activeElement));
 const payload=submissions[0];check('same Brevo AJAX mode',new URL(payload.url).searchParams.get('isAjax'),'1');
 for(const [name,value] of [['VIAJE_SURF',await page.locator('[name=VIAJE_SURF]:checked').inputValue()],['NOMBRE','Prueba'],['EMAIL','fixed@example.test'],['WHATSAPP__COUNTRY_CODE','+34'],['FECHADENACIMIENTO','15-06-1995'],['locale','es'],['TALLA_CAMISETA','1'],['NIVEL_SURF','1']])check(`complete payload includes hidden-step ${name}`,payload.body.includes(`name="${name}"\r\n\r\n${value}\r\n`));
 for(const failure of ['network','malformed','http','redirect-malformed','redirect-insecure']){
  await page.goto(origin+'/inscripciones/el-palmar/');await complete(page);mode=failure;submissions=[];
  await page.locator('button[type=submit]').click();const succeeded=failure.startsWith('redirect');
  await page.waitForSelector(`${succeeded?'#success-message':'#error-message'}.sib-form-message-panel--active`);
  check(`${failure}: exactly one intercepted send`,submissions.length,1);
  if(!succeeded){check(`${failure}: retry enabled`,await page.locator('button[type=submit]').isEnabled());await page.locator('[data-step-prev]').click();check(`${failure}: back keeps values`,await page.locator('[name=ACOMPANANTES]').inputValue(),'Amistad de prueba');}
 }
 await page.goto(origin+`/inscripciones/${multi.slug}/?salida=incorrecta`);
 check('invalid departure URL still explained',await page.locator('#registration-date-error').isVisible());
 check('invalid departure URL no silent selection',await page.locator('[name=VIAJE_SURF]:checked').count(),0);
 await page.locator('[name=VIAJE_SURF]').last().check();check('valid choice clears URL error',await page.locator('#registration-date-error').isVisible(),false);
 await page.goto(origin+`/inscripciones/${multi.slug}-${second.start}/`);check('dated alias still selects matching date',await page.locator('[name=VIAJE_SURF]:checked').getAttribute('data-departure-id'),second.id);
 for(const [slug,value] of [['marruecos','3'],['marruecos-avanzado','4']]){await page.goto(origin+`/inscripciones/${slug}/`);check(`${slug}: preserves isolated Brevo category`,await page.locator('[name=VIAJE_SURF]:checked').inputValue(),value);}
 check('unknown route is 404',(await page.goto(origin+'/inscripciones/desconocido/')).status(),404);
 await context.close();
 const native=await contextFor(390,false);await native.page.goto(origin+'/inscripciones/hossegor/');
 check('without JS all five sections readable',await native.page.locator('[data-registration-step]:visible').count(),5);
 check('without JS enhanced navigation absent',await native.page.locator('.registration-progress').isVisible(),false);
 for(let i=0;i<5;i++)await fillStep(native.page,i);
 mode='native';submissions=[];await native.page.locator('button[type=submit]').click();
 check('native form submitted once',submissions.length,1);check('native form preserves original endpoint',new URL(submissions[0].url).searchParams.has('isAjax'),false);
 await native.context.close();check('no product JavaScript errors',errors,[]);
 await writeFile(path.join(output,'results.json'),JSON.stringify({checks:results.length,results,errors,externalSubmissions:0},null,2)+'\n');
 console.log(`PASS: ${results.length} assertions; 7 trips, 5 steps, 320/390/768/1440px, validation/back/Enter/focus, earlier-step server errors, full payload, network/HTTP/JSON errors, duplicate sends, aliases, 200% text and native POST. No external submissions.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
