import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = await fs.readFile(new URL('../device.js', import.meta.url), 'utf8');
function run({agent='',width=1440,touches=0,coarse=false,hint='unknown',mode='auto'}={}) {
  const classes=new Set();
  const root={dataset:{deviceHint:hint,layoutMode:mode},classList:{toggle:(key,on)=>on?classes.add(key):classes.delete(key)}};
  const label={textContent:''};
  const window={innerWidth:width,listeners:{},addEventListener:(name,fn)=>window.listeners[name]=fn,matchMedia:()=>({matches:coarse,addEventListener(){}})};
  vm.runInNewContext(source,{document:{documentElement:root,getElementById:()=>label},window,navigator:{userAgent:agent,maxTouchPoints:touches}});
  return {root,classes,label,window};
}

const cases=[
  [{agent:'iPhone Mobile',width:390,touches:5,coarse:true},'phone','mobile'],
  [{agent:'iPhone Mobile',width:844,touches:5,coarse:true},'phone','mobile'],
  [{agent:'iPad',width:1024,touches:5,coarse:true},'tablet','mobile'],
  [{agent:'Macintosh',width:1024,touches:5,coarse:true},'tablet','mobile'],
  [{agent:'Android Tablet',width:1280,touches:5,coarse:true},'tablet','mobile'],
  [{agent:'Windows NT',width:1440},'desktop','desktop'],
  [{agent:'Windows NT',width:500},'desktop','mobile'],
  [{agent:'Windows NT',width:1440,touches:10},'desktop','desktop'],
  [{agent:'iPhone Mobile',width:390,touches:5,mode:'desktop'},'phone','desktop'],
  [{agent:'Windows NT',width:1440,mode:'mobile'},'desktop','mobile'],
  [{agent:'Unknown',width:1600,hint:'phone'},'phone','mobile'],
];
for(const [input,device,layout] of cases){
  const result=run(input);
  assert.equal(result.root.dataset.device,device,JSON.stringify(input));
  assert.equal(result.root.dataset.activeLayout,layout,JSON.stringify(input));
  assert.equal(result.classes.has('mobile-ui'),layout==='mobile');
  assert.match(result.label.textContent,new RegExp(layout==='mobile'?'Touch layout':'Desktop layout'));
}
const responsive=run({agent:'Windows NT',width:1440});
responsive.window.innerWidth=600;responsive.window.listeners.resize();
assert.equal(responsive.root.dataset.activeLayout,'mobile');
responsive.window.innerWidth=1440;responsive.window.listeners.resize();
assert.equal(responsive.root.dataset.activeLayout,'desktop');
console.log('PASS: 11 device/layout cases, desktop-style iPad detection, manual overrides, and live viewport changes.');
