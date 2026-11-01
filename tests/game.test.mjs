// Interaction-logic checks using a small DOM fixture; these are not visual browser tests.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

class Element {
  constructor(tag='div') {
    this.tagName=tag; this.children=[]; this.attrs={}; this.dataset=new Proxy({}, {set:(o,k,v)=>{o[k]=String(v);this.attrs['data-'+k]=String(v);return true;}}); this.style={}; this.hidden=false; this.disabled=false; this._text=''; this._value=undefined; this.listeners={};
    this.classList={
      contains:c=>this.className.split(' ').includes(c),
      add:c=>{if(!this.classList.contains(c))this.className+=' '+c;},
      remove:c=>{this.className=this.className.split(' ').filter(v=>v!==c).join(' ');},
      toggle:(c,on)=>{const enabled=on??!this.classList.contains(c);this.classList[enabled?'add':'remove'](c);return enabled;}
    };
  }
  get className(){return this.attrs.class||'';} set className(v){this.attrs.class=v;}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='hidden')this.hidden=true;if(k==='disabled')this.disabled=true;if(k.startsWith('data-'))this.dataset[k.slice(5)]=String(v);if(k==='value')this._value=String(v);}
  get value(){return this._value??(this.tagName==='select'?this.children[0]?.value:'')??'';} set value(v){this._value=String(v);}
  append(e){this.children.push(e);e.parent=this;}
  replaceChildren(){this.children=[];this._text='';}
  set textContent(v){this.replaceChildren();this._text=String(v);} get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  set innerHTML(html){this.replaceChildren();parse(html,this);} get innerHTML(){return this._html||'';}
  addEventListener(k,fn){this.listeners[k]=fn;}
  focus(){activeDoc.activeElement=this;}
  click(){if(!this.disabled)this.onclick?.({target:this,clientX:100,clientY:100});}
  getBoundingClientRect(){return {left:0,top:0,width:1672,height:941};}
  matches(selector){
    if(selector==='button:not(:disabled)')return this.tagName==='button'&&!this.disabled;
    if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));
    const attr=selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if(attr)return Object.hasOwn(this.attrs,attr[1])&&(attr[2]===undefined||this.attrs[attr[1]]===attr[2]);
    return this.tagName===selector;
  }
  all(){return this.children.flatMap(c=>[c,...c.all()]);}
  querySelectorAll(sel){return this.all().filter(e=>sel.split(',').some(s=>e.matches(s.trim())));}
  querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
}
let activeDoc;
function parse(html,root){
  const stack=[root]; const voids=new Set(['img','input','meta','link','br','hr']);
  for(const token of html.match(/<[^>]*>|[^<]+/g)||[]){
    if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}
    if(token.startsWith('<!'))continue;
    if(token.startsWith('<')){
      const tag=token.match(/^<([a-z0-9-]+)/i)?.[1];if(!tag)continue;const e=new Element(tag);
      const raw=token.slice(tag.length+1,-1); const attrs=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;let m;
      while((m=attrs.exec(raw)))e.setAttribute(m[1],m[2]??m[3]??m[4]??'');
      stack.at(-1).append(e);if(!voids.has(tag))stack.push(e);
    } else stack.at(-1)._text+=token;
  }
}
const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
const source=await fs.readFile(new URL('../game-v2.js',import.meta.url),'utf8');
const store=new Map();
function boot(){
  const doc=new Element('document');parse(html,doc);doc.createElement=tag=>new Element(tag);doc.getElementById=id=>doc.all().find(e=>e.attrs.id===id)||null;doc.activeElement=null;activeDoc=doc;
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
object('bag');click('[data-take="earpiece"]');click('[data-take="notebook"]');assert.deepEqual(state().items,['earpiece','notebook']);id('close').click();
click('[data-item="earpiece"]');object('porthole');assert.equal(id('modal-title').textContent,'Tune the relay');
id('lock-relay').click();assert.match(id('puzzle-feedback').textContent,/No lock/);assert.equal(state().connected,false);
id('frequency').value=73;id('frequency').oninput();assert.match(id('signal-readout').textContent,/100%/);id('lock-relay').click();assert.equal(state().connected,true);id('close').click();
object('archives');id('search-records').click();assert.match(id('puzzle-feedback').textContent,/all three/);
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
