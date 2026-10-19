const {chromium}=require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');const fs=require('fs');
(async()=>{const browser=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});const report=[];
for(const base of ['http://127.0.0.1:4175','http://127.0.0.1:4177'])for(let run=0;run<3;run++){
 const context=await browser.newContext({viewport:{width:1440,height:844},reducedMotion:'no-preference'});const p=await context.newPage();await p.goto(base+'/niveles/');await p.evaluate(()=>document.fonts.ready);
 for(const slug of ['supercracks','supercracks','rookies']){
 await p.evaluate(()=>{window.cues=[];new MutationObserver(ms=>ms.forEach(m=>{if(!m.oldValue.includes('is-arriving')&&m.target.classList.contains('is-arriving'))window.cues.push({id:m.target.id,t:performance.now()})})).observe(document.querySelector('.guide-levels-grid')||document.body,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true})});
 await p.locator(`.guide-index a[href="#${slug}"]`).focus();await p.keyboard.press('Enter');await p.waitForTimeout(2500);
 report.push({base,run,slug,...await p.evaluate(s=>({cues:window.cues,top:document.getElementById(s).getBoundingClientRect().top,offset:getComputedStyle(document.documentElement).scrollPaddingTop,focus:document.activeElement.id,hash:location.hash}),slug)});
 }
 await context.close();
}
await browser.close();fs.writeFileSync('/home/amfernandez/personalProjects/letsurftogethersystem/docs/qa/2026-10-13-tarjetas-home/motion-comparison.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));})().catch(e=>{console.error(e);process.exit(1)});
