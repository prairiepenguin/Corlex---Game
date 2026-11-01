// Interaction-logic checks using a small DOM fixture; these are not visual browser tests.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

import { createDocument } from './dom-fixture.mjs';

const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
const source=await fs.readFile(new URL('../game-v2.js',import.meta.url),'utf8');
const store=new Map();
function boot(){
  const doc=createDocument(html);
  vm.runInNewContext(source,{document:doc,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}});
  return doc;
}
let doc=boot();
const id=k=>{const e=doc.getElementById(k);assert.ok(e,'Missing element '+k);return e;};
const click=(sel)=>{const e=doc.querySelector(sel);assert.ok(e,'Missing selector '+sel);e.click();};
const object=k=>click('[data-object="'+k+'"]');
const action=text=>{const e=id('modal-actions').children.find(e=>e.textContent===text);assert.ok(e,'Missing action '+text);e.click();};
const state=()=>JSON.parse(store.get('corlex-berth-v2')||'{}');

assert.equal(id('inventory').children.length,4);
assert.equal(id('opening').hidden,false);
assert.equal(id('game').hidden,true);
id('start-game').click();
assert.equal(id('opening').hidden,true);
assert.equal(id('game').hidden,false);
object('archives');assert.equal(id('modal-title').textContent,'Cached data only');id('close').click();
object('door');assert.match(id('modal-title').textContent,/Cargo/);id('close').click();
click('[data-touch-object="bag"]');assert.ok(id('game').classList.contains('dialog-open'));click('[data-take="earpiece"]');click('[data-take="notebook"]');assert.deepEqual(state().items,['earpiece','notebook']);id('close').click();assert.equal(id('game').classList.contains('dialog-open'),false);
click('[data-item="earpiece"]');object('porthole');assert.equal(id('modal-title').textContent,'Tune the relay');
id('lock-relay').click();assert.match(id('puzzle-feedback').textContent,/No lock/);assert.equal(state().connected,false);
id('frequency').value=73;id('frequency').oninput();assert.match(id('signal-readout').textContent,/100%/);id('lock-relay').click();assert.equal(state().connected,true);id('close').click();
id('files-tab').click();click('[data-touch-object="archives"]');id('search-records').click();assert.match(id('puzzle-feedback').textContent,/all three/);
id('branch').value='fleet';id('period').value='between';id('training').value='precision';id('search-records').click();assert.match(id('puzzle-feedback').textContent,/No relevant/);
id('branch').value='special';id('search-records').click();assert.ok(doc.getElementById('save-record'));assert.equal(state().archives,false);id('save-record').click();assert.equal(state().archives,true);id('close').click();
object('timeline');click('[data-event="kill"]');click('[data-event="record"]');click('[data-event="war"]');action('Verify sequence');assert.match(id('puzzle-feedback').textContent,/conflicts/);assert.equal(state().timeline,false);
action('Clear sequence');click('[data-event="war"]');click('[data-event="record"]');click('[data-event="kill"]');action('Verify sequence');assert.equal(state().timeline,true);id('close').click();
object('matches');click('[data-suspect="lyra"]');assert.match(id('puzzle-feedback').textContent,/Excluded/);assert.equal(state().matches,false);click('[data-suspect="amanda"]');assert.equal(state().matches,true);id('close').click();
object('dossier');click('[data-proof="weapon"]');assert.match(id('puzzle-feedback').textContent,/left first/);click('[data-clue="weapon"]');click('[data-proof="time"]');assert.match(id('puzzle-feedback').textContent,/does not explain/);
click('[data-proof="weapon"]');click('[data-clue="time"]');click('[data-proof="time"]');click('[data-clue="face"]');click('[data-proof="face"]');assert.equal(state().dossier,true);id('close').click();
object('door');assert.equal(id('modal-title').textContent,'Passenger credential required');id('close').click();
object('bed');id('lift-pillow').click();id('take-pass').click();assert.ok(state().items.includes('pass'));id('close').click();
object('cap');action('Take the cap');assert.equal(state().items.length,4);
object('lamp');assert.equal(state().lamp,false);object('lamp');assert.equal(state().lamp,true);
click('[data-item="pass"]');object('door');action('Press door release');assert.equal(state().finished,true);assert.equal(id('departure').hidden,false);id('return-room').click();
doc=boot();assert.equal(id('opening').hidden,false);assert.match(id('start-game').textContent,/Continue/);id('start-game').click();assert.match(id('objective').textContent,/complete/);assert.equal(id('inventory').children.length,4);assert.ok(id('game').classList.contains('connected'));
id('title-screen').click();assert.equal(id('game').hidden,true);assert.equal(id('opening').hidden,false);assert.equal(state().finished,true);id('start-game').click();
id('journal').click();action('Start over');action('Reset');assert.equal(state().items.length,0);assert.equal(state().connected,false);
console.log('PASS: collection, missing-equipment blocks, tuning, wrong and correct archive filters, explicit evidence saving, timeline retry, candidate rejection, three evidence links, pass discovery, optional cap, lamp toggle, exit, reload and reset.');
