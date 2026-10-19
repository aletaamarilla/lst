const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
(async () => {
 const browser = await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
 const results=[];
 try {
  for(const width of [390,1440]) {
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await ctx.route('https://**/*',r=>r.abort());
   const p=await ctx.newPage(); const errors=[]; p.on('pageerror',e=>errors.push(e.message));
   const shown=()=>p.locator('[data-catalog-trip]:visible h2').allTextContents();
   for (const [query,count,selected] of [['',6,''],['?nivel=1',5,'1'],['?nivel=2',6,'2'],['?nivel=3',6,'3'],['?nivel=4',5,'4'],['?nivel=01',6,''],['?nivel=2.0',6,''],['?nivel=%202',6,''],['?nivel=0',6,''],['?nivel=1&estado=confirmed',1,'1'],['?nivel=4&estado=upcoming',4,'4']]) {
    await p.goto('http://127.0.0.1:4175/viajes/'+query); await p.locator('[data-catalog-filters]').waitFor({state:'visible'});
    assert.equal((await shown()).length,count);assert.equal(await p.inputValue('#catalog-level'),selected);
   }
   await p.locator('[data-catalog-filters] [data-catalog-clear]').click(); assert.equal((await shown()).length,6); assert.equal(new URL(p.url()).search,'');
   await p.locator('#catalog-level').focus();await p.keyboard.press('Space');await p.keyboard.press('End');await p.keyboard.press('Enter');
   assert.equal(await p.inputValue('#catalog-level'),'4');assert(!(await shown()).includes('El Salvador'));
   await p.selectOption('#catalog-state','confirmed');assert.deepEqual(await shown(),['Asturias']);
   const live=await p.locator('#catalog-status').getAttribute('role');assert.equal(live,'status');assert((await p.locator('#catalog-status').innerText()).includes('IV · Supercracks'));
   await p.locator('[data-catalog-trip]:visible a').click();await p.waitForURL('**/viajes/asturias/');await p.locator('[data-open-dates]:visible').first().click();assert.equal(await p.locator('#departure-dialog [data-departure]').count(),2);await p.keyboard.press('Escape');
   await p.goBack();await p.locator('[data-catalog-filters]').waitFor({state:'visible'});assert.deepEqual(await shown(),['Asturias']);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
   results.push({width,queries:11,keyboard:true,clear:true,asturiasDates:2,backRestores:true});await ctx.close();
   const nj=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false});await nj.route('https://**/*',r=>r.abort());const n=await nj.newPage();
   await n.goto('http://127.0.0.1:4175/viajes/?nivel=1');assert.equal(await n.locator('[data-catalog-trip]:visible').count(),6);assert.equal(await n.locator('[data-catalog-filters]').isVisible(),false);
   await n.locator('[data-catalog-trip] a[href="/viajes/el-salvador/"]').click();await n.waitForURL('**/viajes/el-salvador/');
   await n.goto('http://127.0.0.1:4175/conocenos/');const before=await n.locator('h1').evaluate(e=>({top:e.getBoundingClientRect().top,bottom:document.querySelector('header').getBoundingClientRect().bottom,position:getComputedStyle(document.querySelector('header')).position}));assert(before.top>=before.bottom);assert.equal(before.position,'sticky');await n.evaluate(()=>scrollTo(0,600));assert.equal(await n.locator('header').evaluate(e=>e.getBoundingClientRect().top),0);
   results.push({width,noJsDestinations:6,noJsLink:true,aboutHeader:before,aboutStickyAfterScroll:true});await nj.close();
  }
  console.log(JSON.stringify({passed:true,results},null,2));fs.writeFileSync('/tmp/lst-independent-catalog.json',JSON.stringify({passed:true,results},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
