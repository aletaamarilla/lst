import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const script=await readFile('dist/trip.js','utf8');
const start=script.indexOf("document.querySelectorAll('[data-carousel]').forEach");
assert(start>=0);
const controller=script.slice(start);

function harness(widths,viewport=1440,{cover=true,reduced=false,gap=8}={}){
 const document={activeElement:null};
 const button=()=>{const events={};return {disabled:false,addEventListener(name,fn){events[name]=fn},click(){document.activeElement=this;events.click?.({})}}};
 const previous=button(),next=button(),counter={textContent:''},events={},observers=[],calls=[];
 const images=widths.map(()=>({loading:'lazy'}));
 const children=widths.map((width,i)=>({offsetLeft:0,offsetWidth:width,querySelector:()=>images[i]}));
 const track={children,clientWidth:viewport,scrollWidth:0,scrollLeft:0,
  addEventListener(name,fn){events[name]=fn},focus(){document.activeElement=this},
  scrollTo(options){calls.push(options);this.scrollLeft=Math.max(0,Math.min(this.scrollWidth-this.clientWidth,options.left));events.scroll?.()}};
 const layout=()=>{
  let offset=0;
  // The final cover uses full-width frames even when the photo inside is narrow.
  children.forEach(child=>{if(cover)child.offsetWidth=track.clientWidth;child.offsetLeft=offset;offset+=child.offsetWidth+(cover?0:gap)});
  track.scrollWidth=Math.max(offset-(cover?0:gap),track.clientWidth);
 };
 layout();
 const carousel={classList:{contains:()=>cover},querySelector(selector){return {'[data-carousel-track]':track,'[data-carousel-prev]':previous,'[data-carousel-next]':next,'[data-carousel-counter]':counter}[selector]??null},querySelectorAll:()=>[]};
 document.querySelectorAll=()=>[carousel];
 vm.runInNewContext(controller,{document,reducedMotion:{matches:reduced},ResizeObserver:class{constructor(fn){observers.push(fn)}observe(){}}});
 return {track,previous,next,counter,calls,document,images,resize(width,{scrollBeforeObserver=false}={}){track.clientWidth=width;layout();if(scrollBeforeObserver)events.scroll?.();observers[0]()}};
}

test('full width cover frames keep narrow photos selectable through the final portrait',()=>{
 const h=harness([900,400,900,400]);
 assert.equal(h.counter.textContent,'01 / 04');assert(h.previous.disabled);
 assert.deepEqual(h.images.map(img=>img.loading),['eager','eager','lazy','lazy']);
 h.next.click();assert.equal(h.counter.textContent,'02 / 04');
 h.next.click();assert.equal(h.counter.textContent,'03 / 04');
 h.next.click();assert.equal(h.counter.textContent,'04 / 04');assert(h.next.disabled);
 const last=h.track.children.at(-1);
 assert(last.offsetLeft>=h.track.scrollLeft);assert(last.offsetLeft+last.offsetWidth<=h.track.scrollLeft+h.track.clientWidth);
 assert.equal(h.document.activeElement,h.track,'Focus remains in the carousel when its final arrow becomes disabled');
 h.previous.click();assert.equal(h.counter.textContent,'03 / 04');assert(!h.next.disabled);
});

test('cover resize retains the chosen photo and respects reduced motion',()=>{
 const h=harness([900,400,900,400],1440,{reduced:true});
 h.next.click();assert.equal(h.counter.textContent,'02 / 04');
 h.resize(900);assert.equal(h.counter.textContent,'02 / 04');assert.equal(h.calls.at(-1).behavior,'instant');
 assert.equal(h.track.scrollLeft,900);
});

test('a native scroll event during resize cannot replace the selected cover frame',()=>{
 const h=harness([900,400,900,400,500,400]);
 h.next.click();assert.equal(h.counter.textContent,'02 / 06');
 h.resize(390,{scrollBeforeObserver:true});
 assert.equal(h.counter.textContent,'02 / 06');assert.equal(h.track.scrollLeft,390);
});

test('accommodation carousels retain left alignment and their existing resize behaviour',()=>{
 const h=harness([300,300,300,300],600,{cover:false,gap:16});
 h.next.click();assert.equal(h.track.scrollLeft,316);assert.equal(h.counter.textContent,'02 / 04');
 const calls=h.calls.length;h.resize(500);assert.equal(h.calls.length,calls);assert.equal(h.track.scrollLeft,316);
 h.previous.click();assert.equal(h.track.scrollLeft,0);assert(h.previous.disabled);
 assert(h.images.every(img=>img.loading==='lazy'));
});

test('two narrow final photos from Senegal remain individually reachable in both directions',()=>{
 const h=harness([899.56,800,900,900,450.05,399.93]);
 for(let i=2;i<=6;i++){h.next.click();assert.equal(h.counter.textContent,`0${i} / 06`)}
 assert(h.next.disabled);
 for(let i=5;i>=1;i--){h.previous.click();assert.equal(h.counter.textContent,`0${i} / 06`)}
 assert(h.previous.disabled);
});

test('two narrow initial photos can advance from the first frame without skipping the second',()=>{
 const h=harness([400,400,900]);
 h.next.click();assert.equal(h.counter.textContent,'02 / 03');assert(h.track.scrollLeft>0);
 h.next.click();assert.equal(h.counter.textContent,'03 / 03');assert(h.next.disabled);
 h.previous.click();assert.equal(h.counter.textContent,'02 / 03');
 h.previous.click();assert.equal(h.counter.textContent,'01 / 03');assert(h.previous.disabled);
});
