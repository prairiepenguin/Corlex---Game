import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createDocument} from './dom-fixture.mjs';

const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
const berth=await fs.readFile(new URL('../game-v2.js',import.meta.url),'utf8');
const encounter=await fs.readFile(new URL('../tengra.js',import.meta.url),'utf8');
const storage=new Map([['corlex-berth-v2',JSON.stringify({items:['earpiece'],log:['Existing cargo progress']})]]);
const originalBerth=storage.get('corlex-berth-v2');
let doc;
function boot(){
  doc=createDocument(html);
  const context=vm.createContext({document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
  vm.runInContext(berth,context);vm.runInContext(encounter,context);
}
const id=k=>{const e=doc.getElementById(k);assert.ok(e,'Missing element '+k);return e;};
const click=selector=>{const b=doc.querySelector(selector);assert.ok(b,'Missing '+selector);b.click();};
const target=k=>click('[data-tg-target="'+k+'"]');
const pick=(parent,text)=>{const b=id(parent).children.find(e=>e.textContent===text);assert.ok(b,'Missing action '+text);b.click();};
const choice=t=>pick('tg-choices',t);
const detail=t=>pick('tg-detail-actions',t);
const state=()=>JSON.parse(storage.get('corlex-tengra-v1')||'{}');
function truce(){target('amanda');if(!state().talked)choice('“I’m Cody. Clearly in over my head.”');choice('“Promise you won’t shoot me?”');assert.equal(state().truce,true);}
function prepare(){id('tg-cup').click();target('door');assert.equal(state().prepared,true);}

boot();id('start-tengra').click();assert.equal(id('tengra-demo').hidden,false);assert.equal(id('game').hidden,true);assert.equal(id('opening').hidden,true);
id('tg-plan').click();assert.match(id('tg-detail-title').textContent,/Not yet/);id('tg-close').click();
target('emitter');assert.equal(state().emitter,true);assert.ok(id('tengra-demo').classList.contains('tg-inspecting'));detail('Mark the field');assert.ok(id('tg-stage').classList.contains('field-mapped'));
target('clock');assert.equal(state().clock,true);detail('Keep that in mind');
target('island');detail('Take the silver cup');assert.equal(state().cup,true);assert.equal(id('tg-cup').disabled,false);
prepareNoTruce();
function prepareNoTruce(){id('tg-cup').click();target('door');assert.equal(state().prepared,false);assert.match(id('tg-line').textContent,/agree to talk/);}
truce();id('tg-cup').click();target('emitter');assert.match(id('tg-line').textContent,/sound dies/);assert.equal(state().cup,true);
prepare();id('tg-plan').click();detail('Rush her from cover');assert.equal(state().truce,false);assert.equal(state().cup,true);assert.equal(id('tg-stage').dataset.phase,'cover');
truce();prepare();id('tg-plan').click();detail('Wait for the clock glance');assert.equal(id('tg-stage').dataset.phase,'wait');
choice('Wait for her glance');assert.equal(id('tg-stage').dataset.phase,'glance');choice('Throw it at the emitter');assert.equal(state().truce,false);assert.equal(id('tg-stage').dataset.phase,'cover');
truce();prepare();id('tg-plan').click();detail('Wait for the clock glance');choice('Wait for her glance');choice('Send the cup beyond the field');assert.equal(id('tg-stage').dataset.phase,'turned');
id('tg-stunner').click();target('amanda');assert.equal(state().finished,true);assert.equal(id('tg-stage').dataset.phase,'finished');assert.equal(id('tg-cinematic').hidden,false);assert.match(id('tg-line').textContent,/interrupted/);
choice('“Then tell me.”');assert.match(id('tg-line').textContent,/park/);choice('Back to title');assert.equal(id('tengra-demo').hidden,true);assert.equal(id('opening').hidden,false);
assert.equal(storage.get('corlex-berth-v2'),originalBerth,'Cargo progress must remain unchanged');
boot();id('start-tengra').click();assert.equal(id('tg-stage').dataset.phase,'finished');id('tg-reset').click();detail('Restart');assert.equal(state().finished,false);assert.equal(state().cup,false);assert.equal(id('tg-cinematic').hidden,true);assert.equal(storage.get('corlex-berth-v2'),originalBerth);
console.log('PASS: demo launch, observation, cup collection, truce, prerequisite blocks, wrong tactics, recovery, distraction, stunner ending, cliffhanger, resume, restart and isolated cargo save.');
