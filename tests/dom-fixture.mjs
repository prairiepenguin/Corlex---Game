class Element {
  constructor(tag='div') {
    this.tagName=tag; this.children=[]; this.attrs={}; this.dataset=new Proxy({}, {set:(o,k,v)=>{o[k]=String(v);this.attrs['data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=String(v);return true;}}); this.style={}; this.hidden=false; this.disabled=false; this._text=''; this._value=undefined; this.listeners={};
    this.classList={
      contains:c=>this.className.split(' ').includes(c),
      add:c=>{if(!this.classList.contains(c))this.className+=' '+c;},
      remove:c=>{this.className=this.className.split(' ').filter(v=>v!==c).join(' ');},
      toggle:(c,on)=>{const enabled=on??!this.classList.contains(c);this.classList[enabled?'add':'remove'](c);return enabled;}
    };
  }
  get className(){return this.attrs.class||'';} set className(v){this.attrs.class=v;}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='hidden')this.hidden=true;if(k==='disabled')this.disabled=true;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v);if(k==='value')this._value=String(v);}
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

export function createDocument(html) { const doc=new Element('document'); parse(html,doc); doc.createElement=tag=>new Element(tag); doc.getElementById=id=>doc.all().find(e=>e.attrs.id===id)||null; doc.activeElement=null; activeDoc=doc; return doc; }
