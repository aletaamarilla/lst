import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// Exercise the real controller with deterministic browser geometry, without remote services.
const source=await readFile('dist/trip.js','utf8');
const start=source.indexOf('const sectionNav =');
const end=source.indexOf('\nupdateReadingSpace();',start);
assert(start>=0&&end>start);
const controller=source.slice(start,end);

function harness(headerHeight=88,navHeight=58,headerPosition='fixed'){
  const state={coverBottom:360,contentBottom:5000,headerHeight,navHeight};
  const ids=['nivel','plan','alojamiento','incluye','dudas'];
  const targets=ids.map(id=>({id,top:3000,getBoundingClientRect(){return {top:this.top}}}));
  const links=ids.map(id=>({hash:'#'+id,attributes:{},setAttribute(name,value){this.attributes[name]=value},removeAttribute(name){delete this.attributes[name]},getBoundingClientRect(){return {left:10,right:90}}}));
  const nav={hidden:true,style:{},querySelectorAll:()=>links,getBoundingClientRect:()=>({left:0,right:600,height:nav.hidden?0:state.navHeight}),scrollBy:()=>{}};
  const root={style:{setProperty:()=>{}}};
  const cover={getBoundingClientRect:()=>({bottom:state.coverBottom})};
  const content={getBoundingClientRect:()=>({bottom:state.contentBottom})};
  const listeners={};let frame;
  const context={
    document:{documentElement:root,querySelector:selector=>({'.trip-section-nav':nav,'.trip-opening-gallery':cover,'.trip-layout':content})[selector]??null,querySelectorAll:()=>[],getElementById:id=>targets.find(target=>target.id===id)},
    tripHeader:{getBoundingClientRect:()=>({height:state.headerHeight})},
    window:{addEventListener:(name,callback)=>{listeners[name]=callback}},
    ResizeObserver:class{observe(){}},
    requestAnimationFrame:callback=>{frame=callback;return 1},
    getComputedStyle:element=>element===root?{scrollPaddingTop:`${state.headerHeight+state.navHeight+24}px`}:{position:headerPosition,scrollMarginTop:'20px'},
  };
  vm.runInNewContext(controller,context);
  const flush=()=>{const callback=frame;frame=null;callback?.()};
  flush();
  return {state,nav,targets,links,update(){listeners.scroll();flush()},active:()=>links.find(link=>link.attributes['aria-current']==='location')?.hash};
}

test('floating navigation occupies no opening row, appears after the cover and hides beyond the reading content',()=>{
  const h=harness();assert.equal(h.nav.hidden,true);
  h.state.coverBottom=80;h.update();assert.equal(h.nav.hidden,false);assert.equal(h.nav.style.top,'98px');
  h.state.contentBottom=0;h.update();assert.equal(h.nav.hidden,true);
  h.state.contentBottom=5000;h.state.coverBottom=360;h.update();assert.equal(h.nav.hidden,true);
});

test('a non-fixed mobile header leaves only the section menu above the reading content',()=>{
 const h=harness(78,52,'absolute');h.state.coverBottom=0;h.update();
 assert.equal(h.nav.hidden,false);assert.equal(h.nav.style.top,'10px');
});

test('every native anchor landing selects its own section with normal and enlarged header/navigation geometry',()=>{
  for(const [headerHeight,navHeight] of [[88,58],[156,92]]){
    for(let current=0;current<5;current++){
      const h=harness(headerHeight,navHeight);h.state.coverBottom=0;
      h.targets.forEach((target,i)=>{target.top=i<current?-500:i===current?headerHeight+navHeight+24+20:3000});
      h.update();assert.equal(h.active(),h.links[current].hash);
      assert.equal(h.nav.style.top,`${headerHeight+10}px`);
    }
  }
});
