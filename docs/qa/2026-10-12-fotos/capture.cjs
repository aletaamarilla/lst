const {chromium}=require(process.env.LST_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const phase=process.argv[2]||'before';const out=process.env.LST_QA_OUTPUT||`/tmp/lst-photo-captures/${phase}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.LST_CHROMIUM_PATH,args:['--no-sandbox']});const results=[];
 for(const [width,height] of [[320,740],[390,844],[768,1024],[1440,900],[390,360]]){
  for(const slug of ['el-salvador','asturias','azores']){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.route('https://**/*',r=>r.abort());
   await page.goto(`http://127.0.0.1:4175/viajes/${slug}/`);await page.evaluate(()=>document.fonts.ready);
   const photos=page.locator('[data-photo]');const count=await photos.count();
   for(let i=0;i<count;i++){
    await photos.nth(i).scrollIntoViewIfNeeded();await page.waitForTimeout(100);
    const normal=await photos.nth(i).locator('img').evaluate(e=>({box:e.getBoundingClientRect().toJSON(),natural:[e.naturalWidth,e.naturalHeight],src:e.getAttribute('src')}));
    if(i===0)await page.screenshot({path:`${out}/${slug}-${width}x${height}-normal.png`});
    await photos.nth(i).click();await page.locator('.photo-slide img').nth(i).evaluate(e=>e.decode());await page.waitForTimeout(80);
    const expanded=await page.locator('.photo-slide img').nth(i).evaluate(e=>{const r=e.getBoundingClientRect();const scale=Math.min(r.width/e.naturalWidth,r.height/e.naturalHeight);return {box:r.toJSON(),painted:[e.naturalWidth*scale,e.naturalHeight*scale],fit:getComputedStyle(e).objectFit};});
    const modal=await page.evaluate(()=>({dialog:document.querySelector('.photo-dialog').getBoundingClientRect().toJSON(),close:document.querySelector('.photo-close').getBoundingClientRect().toJSON(),controls:document.querySelector('.photo-controls').getBoundingClientRect().toJSON(),scroll:document.querySelector('.photo-dialog').scrollHeight,dock:getComputedStyle(document.querySelector('.trip-dock')).visibility}));
    results.push({slug,width,height,i,normal,expanded,modal});
    if(i===0||normal.natural[1]>normal.natural[0])await page.screenshot({path:`${out}/${slug}-${width}x${height}-photo${i+1}.png`});
    await page.keyboard.press('Escape');await page.waitForTimeout(40);
   }
   if(slug==='asturias'){
    await page.locator(width>=1000?'.trip-header-cta':'.dock-cta').click();await page.screenshot({path:`${out}/asturias-${width}x${height}-dates.png`});
    await page.evaluate(()=>{const list=document.querySelector('.departure-dialog-list');for(let i=2;i<16;i++){const clone=list.firstElementChild.cloneNode(true);clone.querySelector('h3').textContent=`Salida temporal de prueba ${i+1}`;list.append(clone);}});
    await page.locator('.departure-enquiry').last().scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/asturias-${width}x${height}-long-dates.png`});
    results.push({slug,width,height,longDates:await page.evaluate(()=>({dialog:document.querySelector('.departure-dialog').getBoundingClientRect().toJSON(),close:document.querySelector('.departure-close').getBoundingClientRect().toJSON(),list:document.querySelector('.departure-dialog-list').getBoundingClientRect().toJSON(),constrained:document.querySelector('.departure-dialog').classList.contains('is-constrained')}))});
   }
   await page.close();
  }
 }
 fs.writeFileSync(`${out}/audit.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>r.longDates?{width:r.width,height:r.height,long:r.longDates}:{slug:r.slug,size:`${r.width}x${r.height}`,photo:r.i+1,natural:r.normal.natural,normal:[r.normal.box.width,r.normal.box.height],expanded:r.expanded.painted,controlsBottom:r.modal.controls.bottom}),null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
