const {chromium}=require('/home/amfernandez/.cache/ms-playwright-go/1.50.1/package');
const fs=require('node:fs');const path=require('node:path');
const out='/tmp/lst-final-review-20261012';fs.mkdirSync(out+'/captures',{recursive:true});
const slugs=['home','el-salvador','asturias','azores','euskadi','marruecos','cadiz'];
const sizes=[[320,740],[390,844],[768,1024],[1024,900],[1440,900],[320,320],[390,360],[768,360],[1024,480],[1440,480]];
const report={views:[],checks:[],issues:[],errors:[],requests:[]};
const check=(name,ok,data)=>{report.checks.push({name,ok,data});if(!ok)report.issues.push({name,data});};
(async()=>{const b=await chromium.launch({executablePath:'/home/amfernandez/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',args:['--no-sandbox']});
try{for(const [w,h] of sizes)for(const zoom of [1,2])for(const slug of slugs){
 const tag=`${slug}-${w}x${h}-text${zoom*100}`;const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin==='http://127.0.0.1:4175'&&r.request().method()==='GET')return r.continue();report.requests.push({tag,url:u.href,method:r.request().method()});return r.abort();});
 const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push({tag,message:e.message}));const responses=[];p.on('response',r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()});});
 const response=await p.goto('http://127.0.0.1:4175/'+(slug==='home'?'':`viajes/${slug}/`));await p.evaluate(()=>document.fonts.ready);
 await p.locator('img').evaluateAll(async es=>{await Promise.all(es.map(e=>{e.loading='eager';return e.decode().catch(()=>{});}));});
 if(zoom===2)await p.evaluate(()=>{const els=[...document.querySelectorAll('body,body *')],sizes=els.map(e=>parseFloat(getComputedStyle(e).fontSize));els.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');});
 await p.waitForTimeout(70);
 const view=await p.evaluate(()=>{const visible=e=>e.getClientRects().length&&!e.closest('dialog:not([open])');const texts=[...document.querySelectorAll('h1,h2,h3,h4,p,dt,dd,li,summary,figcaption,a,button')].filter(visible);
 const clipped=texts.filter(e=>!e.closest('.gallery-track')&&e.clientWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,cl:e.className,text:e.textContent.trim().slice(0,110),client:e.clientWidth,scroll:e.scrollWidth}));
 const overlap=(a,b)=>{if(!a||!b||!visible(a)||!visible(b))return false;const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return Math.min(x.right,y.right)>Math.max(x.left,y.left)+2&&Math.min(x.bottom,y.bottom)>Math.max(x.top,y.top)+2;};
 const collisions=[...document.querySelectorAll('.departure-photo')].map(e=>({pair:'date/title',overlap:overlap(e.querySelector('.departure-date'),e.querySelector('.departure-photo-title'))}));
 for(const e of document.querySelectorAll('.trip-cover')){collisions.push({pair:'title/photos',overlap:overlap(e.querySelector('.trip-cover-copy'),e.querySelector('.cover-photos'))});if(e.classList.contains('trip-cover--group'))collisions.push({pair:'group/title',overlap:overlap(e.querySelector('img'),e.querySelector('.trip-cover-copy'))});}
 const header=document.querySelector('header');for(let i=0;i<header.children.length;i++)for(let j=i+1;j<header.children.length;j++)collisions.push({pair:'header-'+i+'/'+j,overlap:overlap(header.children[i],header.children[j])});
 return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,title:document.title,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),missingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),clipped,collisions,forms:document.querySelectorAll('form,input,textarea').length,robots:document.querySelector('meta[name="robots"]').content};});
 report.views.push({tag,status:response.status(),...view});check(tag+' page assets/headings',response.status()===200&&view.h1.length===1&&view.title.includes('Surf Together')&&view.missingImages.length===0&&responses.length===0,{missing:view.missingImages,responses});
 check(tag+' no horizontal overflow',view.scrollWidth<=w,view.scrollWidth);check(tag+' no text clipped',view.clipped.length===0,view.clipped);check(tag+' no targeted overlap',view.collisions.every(c=>!c.overlap),view.collisions.filter(c=>c.overlap));check(tag+' no forms; remains noindex',view.forms===0&&view.robots==='noindex,nofollow');
 if(zoom===1&&h>=740){await p.screenshot({path:out+'/captures/'+tag+'-cover.png'});if(w===390||w===1440)await p.screenshot({path:out+'/captures/'+tag+'-full.png',fullPage:true});}
 if((w===320&&h===320||w===390&&h===844)&&zoom===2)await p.screenshot({path:out+'/captures/'+tag+'-cover.png'});
 if(slug==='home'&&w<1000){await p.locator('.menu-toggle').click();await p.locator('.nav-whatsapp').focus();const menu=await p.locator('.nav-whatsapp').evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {rect:r.toJSON(),hit:hit===e||e.contains(hit)};});check(tag+' menu last item reachable',menu.rect.top>=0&&menu.rect.bottom<=h+1&&menu.hit,menu);await p.keyboard.press('Escape');check(tag+' menu close focus',await p.locator('.menu-toggle').evaluate(e=>document.activeElement===e&&e.getAttribute('aria-expanded')==='false'));}
 await ctx.close();
}check('no page JS errors',report.errors.length===0,report.errors);check('no automatic external traffic',report.requests.length===0,report.requests);
}finally{await b.close();fs.writeFileSync(out+'/matrix.json',JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,checks:report.checks.length,issues:report.issues,errors:report.errors},null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
