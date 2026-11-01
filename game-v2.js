(() => {
'use strict';
const $=id=>document.getElementById(id), key='corlex-berth-v2';
const fresh=()=>({items:[],connected:false,archives:false,timeline:false,matches:false,dossier:false,finished:false,lamp:true,relay:32,log:[]});
let s=fresh(),verb='look',selected=null,lastFocus;
try{const v=JSON.parse(localStorage.getItem(key));if(v&&typeof v==='object'){for(const k of ['connected','archives','timeline','matches','dossier','finished','lamp'])if(typeof v[k]==='boolean')s[k]=v[k];s.items=Array.isArray(v.items)?v.items.filter(i=>['earpiece','notebook','cap','pass'].includes(i)):[];s.log=Array.isArray(v.log)?v.log.filter(t=>typeof t==='string').slice(-24):[];}}catch{}
const names={earpiece:'Earpiece',notebook:'Field notebook',cap:"Mom's knit cap",pass:'Transit pass'};
const has=i=>s.items.includes(i);
const objects=[
['bed','Canvas bed',1,41,30,22],['cap','Knit cap',11.8,48.5,6.8,7.5],['bag','Duffel bag',3.8,63,14,15],
['porthole','Porthole',22.7,12,12.8,23],['lamp','Bunk lamp',10.8,16.5,4.8,10],['mug','Tin mug',51.7,49.5,3.5,5.2],
['archives','Military archives',37.7,12,13.8,22],['timeline','Timeline',39.6,33,12.3,15.2],['dossier','Reaper dossier',50.3,6.5,16.3,34.5],
['matches','Image matches',66.4,10.7,16,21],['network','Hypernet terminal',66.4,32.3,16,15.5],['cube','Holo-cube',55.5,48.8,7.8,8.6],
['door','Cargo door',85.3,10,14.5,70],['mike','Mike',68.7,85,9,12]];
const stages=['connected','archives','timeline','matches','dossier'];
function objective(){
if(!has('earpiece')||!has('notebook'))return 'Search your duffel for equipment';
if(!s.connected)return 'Get Mike a live hypernet connection';
if(!s.archives)return 'Narrow the military archive search';
if(!s.timeline)return 'Put the evidence in chronological order';
if(!s.matches)return 'Identify the matching service record';
if(!s.dossier)return 'Connect the dossier evidence';
if(!has('pass'))return 'Find your transit pass';
return s.finished?'Investigation complete':'Take your lead to Titan';
}
function save(){try{localStorage.setItem(key,JSON.stringify(s));}catch{}render();}
function record(t){if(!s.log.includes(t))s.log.push(t);save();}
function say(t,who='CORLEX'){$('speaker').textContent=who;$('line').textContent=t;$('toast-speaker').textContent=who;$('toast-line').textContent=t;$('toast').hidden=false;}
function render(){
document.querySelectorAll('[data-verb]').forEach(b=>{b.classList.toggle('active',b.dataset.verb===verb);b.setAttribute('aria-pressed',String(b.dataset.verb===verb));});
$('objective').textContent=objective();$('progress').textContent=stages.filter(k=>s[k]).length+' / 5';
$('signal-label').textContent=s.connected?'RELAY LINK ACTIVE':'NO HYPERNET CONNECTION';
$('game').classList.toggle('connected',s.connected);$('game').classList.toggle('lamp-off',!s.lamp);$('game').classList.toggle('door-open',s.finished);
document.querySelectorAll('.hotspot').forEach(b=>b.classList.toggle('solved',!!s[b.dataset.object]||b.dataset.object==='cap'&&has('cap')));
$('inventory').replaceChildren();
s.items.forEach(i=>{const b=document.createElement('button');b.className='item'+(selected===i?' selected':'');b.dataset.item=i;b.title=names[i];b.setAttribute('aria-label','Select '+names[i]);b.setAttribute('aria-pressed',String(selected===i));if(i==='pass')b.innerHTML='<span class="pass-icon">DB<br>TRANSIT</span>';b.onclick=()=>{selected=selected===i?null:i;verb='use';render();$('hover').textContent=selected?'Use '+names[i]+' on...':'Choose an object';say(selected?names[i]+' selected. Click an object to use it, or click the item again to put it away.':'Item put away.');};$('inventory').append(b);});
for(let n=s.items.length;n<4;n++){const e=document.createElement('div');e.className='empty';if(!n)e.innerHTML='<span>SEARCH<br>YOUR BAG</span>';$('inventory').append(e);}
}
function show(title,html,actions=[],wide=false){
if($('modal').hidden)lastFocus=document.activeElement;
$('toast').hidden=true;$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal-actions').replaceChildren();$('modal').classList.toggle('wide',wide);
actions.forEach(([text,fn])=>{const b=document.createElement('button');b.textContent=text;b.onclick=fn;$('modal-actions').append(b);});
$('modal').hidden=false;$('close').focus();
}
function close(){$('modal').hidden=true;lastFocus?.focus();}
function feedback(t,good=false){$('puzzle-feedback').textContent=t;$('puzzle-feedback').className=good?'feedback success':'feedback';}
function collect(i){if(has(i))return;s.items.push(i);record('Collected: '+names[i]+'.');$('pickup').textContent='+ '+names[i];$('pickup').classList.remove('pop');void $('pickup').offsetWidth;$('pickup').classList.add('pop');}
function detail(type,text){return '<div class="closeup '+type+'"><span>'+text+'</span></div>';}
function bag(){
show('Inside the duffel',detail('bag-detail','Battered canvas. Everything you own.')+'<p>Unzip the inner pocket. Your gear is still packed from the journey.</p><div class="finds">'+['earpiece','notebook'].map(i=>'<button class="find" data-take="'+i+'" '+(has(i)?'disabled':'')+'><span>'+(i==='earpiece'?'◉':'▤')+'</span><strong>'+names[i]+'</strong><small>'+(has(i)?'In inventory':'Click to collect')+'</small></button>').join('')+'</div><p class="small">Collected items appear in your inventory below.</p>',[['Close bag',close]]);
document.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>{collect(b.dataset.take);bag();});
}
function bed(){
show('Canvas and shipping pallets',detail('bed-detail','Calling it a bed is generous.')+'<p>A canvas sack catches on something beneath the pillow. Your transit pass should be around here somewhere.</p>'+(has('pass')?'<p class="success">Transit pass recovered.</p>':'<button id="lift-pillow" class="large-action">Lift the pillow</button><div id="under-pillow"></div>'),[['Back to room',close]]);
if($('lift-pillow'))$('lift-pillow').onclick=()=>{$('lift-pillow').disabled=true;$('lift-pillow').textContent='Pillow lifted';$('under-pillow').innerHTML='<div class="discovery"><span class="ticket">DEATH BRINGER<br><b>PASSENGER TRANSIT</b><br>C. CORLEX · CARGO 04</span><p>Your pass slipped between the canvas sacks.</p><button id="take-pass">Take transit pass</button></div>';$('take-pass').onclick=()=>{collect('pass');bed();};};
}
function cap(){
show('A little piece of home',detail('cap-detail','Black wool, faded almost grey.')+'<p>Mom knitted this before university. The crown is going threadbare.</p><p>Some things are worth keeping, even when everything else fits in a duffel.</p>',has('cap')?[['Put it back on the bunk',()=>{s.items=s.items.filter(i=>i!=='cap');save();close();say('Back on the bunk. I will grab it before we dock.');}]]:[['Take the cap',()=>{collect('cap');close();say('Still warm. Still home.');}]]);
}
function porthole(){
show('A signal in the dark',detail('space-detail','Saturn. Stars. A passing comm relay.')+'<p>A relay beacon sweeps across the glass. The hull is blocking the connection.</p>'+(s.connected?'<p class="success">Earpiece attached. Relay stable.</p>':'<p>The earpiece can act as a short-range receiver.</p>'),s.connected?[['Open terminal',network],['Back to room',close]]:has('earpiece')?[['Attach earpiece to the frame',network],['Back to room',close]]:[['Search duffel',bag],['Back to room',close]]);
}
function network(){
if(!has('earpiece')){show('Receiver missing','<p>The holo-cube cannot see a relay through the hull. Your earpiece is still in the duffel.</p>',[['Search duffel',bag]]);return;}
if(s.connected){show('Hypernet connected','<div class="terminal-success">◉<br>RELAY LOCKED</div><p>Receiver: earpiece at porthole<br>Archive access: available<br>Mike: impatient</p>',[['Search military archives',archives],['Back to room',close]]);return;}
show('Tune the relay','<p>The receiver is clipped to the porthole. Sweep the frequency until it matches the passing beacon, then lock the signal.</p><div class="receiver"><div class="scope" aria-hidden="true"><div class="target-wave"></div><div id="tuned-wave"></div></div><label for="frequency">RECEIVER FREQUENCY <output id="freq-value"></output></label><input id="frequency" type="range" min="0" max="100" value="'+s.relay+'" aria-label="Receiver frequency"><div class="meter"><div id="signal-strength"></div></div><p id="signal-readout"></p><button id="lock-relay" class="large-action">Lock signal</button><p id="puzzle-feedback" class="feedback" role="status"></p></div>',[['Back to room',close]]);
const tune=()=>{s.relay=Number($('frequency').value);const strength=Math.max(0,100-Math.abs(73-s.relay)*4);$('freq-value').textContent=(400+s.relay*.1).toFixed(1)+' MHz';$('signal-strength').style.width=strength+'%';$('tuned-wave').style.transform='translateX('+((s.relay-73)*2)+'px)';$('signal-readout').textContent='SIGNAL '+strength+'% · '+(strength>=92?'MATCH — ready to lock':strength>60?'Beacon detected. Fine-tune.':'Static. Keep sweeping.');};
$('frequency').oninput=tune;tune();
$('lock-relay').onclick=()=>{if(Math.abs(s.relay-73)>2){feedback('No lock. Find a signal strength of at least 92%.');return;}s.connected=true;record('Relay linked through the porthole. Hypernet restored.');network();};
}
function offline(){if(s.connected)return false;show('Cached data only','<p>These holograms are local copies. Mike needs a live connection to search.</p>',[['Set up receiver',network],['Back to room',close]]);return true;}
function archives(){
if(offline())return;
if(s.archives){show('Archive result saved','<p class="success">Precision weapons training · Community Special Forces</p><p>The useful record sits between the end of the Asteroid Wars and the first confirmed Reaper killing.</p>',[['Open timeline',timeline],['Back to room',close]]);return;}
show('972,436 records. Find the right one.','<p class="file-note">CORLEX: “Hydropolymer shots are incredibly hard. Whoever trained her had resources. Start with specialist military training, after the war and before the first kill.”</p><div class="archive-form"><label>Service branch<select id="branch"><option value="">Choose a branch</option><option value="fleet">Merchant Fleet</option><option value="special">Community Special Forces</option><option value="civil">Civil Administration</option></select></label><label>Record window<select id="period"><option value="">Choose a period</option><option value="before">Before the Asteroid Wars</option><option value="between">After the war, before the first kill</option><option value="after">After the first confirmed kill</option></select></label><label>Training category<select id="training"><option value="">Choose a category</option><option value="medical">Field medicine</option><option value="navigation">Navigation</option><option value="precision">Precision weapons</option></select></label></div><button id="search-records" class="large-action">Search archive</button><div id="archive-results"></div><p id="puzzle-feedback" class="feedback" role="status"></p>',[['Back to room',close]],true);
$('search-records').onclick=()=>{const v=[$('branch').value,$('period').value,$('training').value];if(v.includes('')){feedback('Choose all three search filters.');return;}if(v.join('|')!=='special|between|precision'){$('archive-results').replaceChildren();feedback('No relevant record. Reconsider Corlex’s note above.');return;}
$('archive-results').innerHTML='<div class="search-result"><span class="success">1 RELEVANT RECORD</span><h2>Soldier receives specialist commendation</h2><p>Special Forces. Precision weapons. Post-war transition.</p><button id="save-record">Pin record to notebook</button></div>';feedback('Record found. Pin it to keep the evidence.',true);
$('save-record').onclick=()=>{if(!has('notebook')){feedback('Your notebook is still packed. Collect it from the duffel first.');return;}s.archives=true;record('Service record: Special Forces, precision weapons, post-war transition.');archives();};};
}
function timeline(){
if(offline())return;
if(!s.archives){show('Too many dates','<p>Narrow the military archives first. Then compare the record with the Reaper’s history.</p>',[['Open archives',archives]]);return;}
if(s.timeline){show('The timeline fits','<p class="success">War ends → specialist record → first Reaper killing.</p><p>A trained soldier leaves service. An assassin appears. Now check the candidates.</p>',[['Open image matches',matches],['Back to room',close]]);return;}
const cards=[['kill','First Reaper killing','The Second Duke is killed by a long-range hydropolymer shot.'],['war','Asteroid Wars end','The conflict ends. Specialist soldiers begin leaving active service.'],['record','Specialist commendation','Archived during the post-war transition, before the Duke’s death.']];let order=[];
show('Reconstruct the sequence','<p>Click the evidence cards in order, earliest to latest. Use the wording on each card to place the record.</p><div id="time-slots" class="time-slots"></div><div class="timeline-cards">'+cards.map(([id,t,d])=>'<button class="evidence-card" data-event="'+id+'"><span>'+t+'</span><small>'+d+'</small></button>').join('')+'</div><p id="puzzle-feedback" class="feedback" role="status"></p>',[['Clear sequence',()=>{order=[];draw();}],['Verify sequence',()=>{if(order.length!==3){feedback('Place all three cards first.');return;}if(order.join('|')!=='war|record|kill'){feedback('That conflicts with the archive. Clear the sequence and try again.');return;}s.timeline=true;record('Timeline: war ends, service record, first confirmed Reaper killing.');timeline();}],['Back to room',close]],true);
function draw(){$('time-slots').innerHTML=[0,1,2].map(n=>'<div><b>'+(n+1)+'</b><span>'+(cards.find(c=>c[0]===order[n])?.[1]||'Choose a card')+'</span></div>').join('');document.querySelectorAll('[data-event]').forEach(b=>{b.disabled=order.includes(b.dataset.event);b.classList.toggle('placed',b.disabled);});}
document.querySelectorAll('[data-event]').forEach(b=>b.onclick=()=>{if(order.length<3&&!order.includes(b.dataset.event)){order.push(b.dataset.event);draw();}});draw();
}
function matches(){
if(offline())return;
if(!s.timeline){show('Unfiltered photographs','<p>Reconstruct the timeline to limit Mike’s search to the right service period.</p>',[['Open timeline',timeline]]);return;}
if(s.matches){show('Identity confirmed','<div class="identity confirmed"></div><p class="success">Amanda · Community Special Forces</p><p>The training and service window match. Connect your evidence in the dossier.</p>',[['Open case board',dossier],['Back to room',close]]);return;}
show('Choose the matching service record','<div class="match-layout"><div><div class="identity"></div><p class="small">BOUNTY PORTRAIT · THE REAPER</p></div><div><p>Three records. Match <strong>both</strong> the weapon specialty and service window.</p><div class="suspects"><button data-suspect="lyra"><b>Lyra</b><span>Fleet navigation · service began after the Duke’s death.</span></button><button data-suspect="amanda"><b>Amanda</b><span>Special Forces · precision weapons · post-war transition.</span></button><button data-suspect="mara"><b>Mara</b><span>Field medicine · left service before the war ended.</span></button></div></div></div><p id="puzzle-feedback" class="feedback" role="status"></p>',[['Back to room',close]],true);
document.querySelectorAll('[data-suspect]').forEach(b=>b.onclick=()=>{if(b.dataset.suspect!=='amanda'){b.disabled=true;b.classList.add('rejected');feedback('Excluded. Training or service window conflicts with the evidence.');return;}s.matches=true;record('Identity: Amanda. Training and service window match the Reaper.');matches();});
}
function dossier(){
if(!s.matches){show('The Reaper','<div class="match-layout"><div class="identity"></div><div><p class="reward">100,000 CREDITS</p><p>A name would be a start. Find the service record, reconstruct the timeline, and compare the candidates.</p><p class="small">NEXT: '+objective()+'</p></div></div>',[['Continue search',s.archives?timeline:archives],['Back to room',close]],true);return;}
if(s.dossier){show('Lead compiled · Amanda','<p class="success">IDENTITY CONFIRMED / LAST REPORTED ON TITAN</p><p>Mike has packed the service record, timeline, and identity match into one case file. It is enough to start looking.</p>',[['Prepare to leave',door],['Review notebook',journal],['Back to room',close]]);return;}
let pair=null;const links=new Set(),left=[['weapon','Hydropolymer shot'],['time','First kill after the war'],['face','Bounty portrait']],right=[['face','Amanda’s service photograph'],['weapon','Specialist precision training'],['time','Post-war service record']];
show('Make the case','<p>Choose a clue on the left, then its supporting evidence on the right. Connect all three.</p><div class="evidence-board"><div>'+left.map(([k,t])=>'<button data-clue="'+k+'">'+t+'</button>').join('')+'</div><div class="link-count" id="link-count">0 / 3<br>LINKED</div><div>'+right.map(([k,t])=>'<button data-proof="'+k+'">'+t+'</button>').join('')+'</div></div><p id="puzzle-feedback" class="feedback" role="status"></p>',[['Back to room',close]],true);
document.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{pair=b.dataset.clue;document.querySelectorAll('[data-clue]').forEach(c=>c.classList.toggle('chosen',c===b));feedback('Choose the supporting evidence on the right.');});
document.querySelectorAll('[data-proof]').forEach(b=>b.onclick=()=>{if(!pair){feedback('Choose a clue on the left first.');return;}if(pair!==b.dataset.proof){feedback('That does not explain this clue. Try another connection.');return;}links.add(pair);document.querySelector('[data-clue="'+pair+'"]').disabled=true;b.disabled=true;pair=null;$('link-count').innerHTML=links.size+' / 3<br>LINKED';feedback('Evidence connected.',true);if(links.size===3){s.dossier=true;record('Case compiled: Amanda is the Reaper. Last reported on Titan.');dossier();}});
}
function hint(specific=false){
const a=!has('earpiece')||!has('notebook')?['Your equipment is still packed. Search the duffel.','Open the duffel. Collect both the earpiece and notebook.']:!s.connected?['A receiver needs a clear view of space. Try the porthole.','Use the earpiece on the porthole. Tune to 407.3 MHz, then lock.']:!s.archives?['Read Corlex’s note above the archive filters.','Search Special Forces / after the war, before the first kill / precision weapons. Pin the result.']:!s.timeline?['The record tells you where it sits between war and killing.','War ends, specialist commendation, first Reaper killing. Then verify.']:!s.matches?['Match both the training and the service window.','Amanda is the only candidate whose training and service window fit.']:!s.dossier?['Explain the weapon, the timing, and the identity.','Shot → precision training; killing → post-war record; portrait → Amanda’s photo.']:!has('pass')?['You need your passenger credential. Where did you sleep?','Examine the bed, lift the pillow, and take the transit pass.']:['The case is saved. Head for the door.','Use the transit pass on the door, then press the release.'];
return a[specific?1:0];
}
function mike(){
show('Mike · your only decent company','<div class="mike-face"></div><p>“Yeah, boss? What are we doing?”</p><div id="conversation" class="conversation">'+objective()+'.</div>',[['What should I do next?',()=>{$('conversation').textContent=hint();}],['Be specific, Mike',()=>{$('conversation').textContent=hint(true);}],['Why chase the Reaper?',()=>{$('conversation').textContent='“A hundred thousand credits buys a real bed. And real food. I have also calculated that being alive is preferable to either.”';}],['How is the search going?',()=>{$('conversation').textContent='“'+stages.filter(k=>s[k]).length+' of five milestones, boss. '+objective()+'.”';}],['Back to work',close]]);
}
function journal(){
show("Corlex's field notebook",'<p class="reward">THE REAPER / 100,000 CREDITS</p><p class="objective-note">NEXT: '+objective()+'</p><div id="journal-notes"></div><p class="small">Progress saves automatically. You can retry every puzzle without penalty.</p>',[['Ask Mike',mike],['Back to room',close],['Start over',()=>show('Reset this investigation?','<p>This clears the inventory and puzzle progress for this room.</p>',[['Keep playing',journal],['Reset',()=>{s=fresh();selected=null;verb='look';save();close();say('Gear is packed. Start with the duffel by the bunk.','MIKE');}]])]]);
(s.log.length?s.log:['No evidence pinned yet. Search the room and recover your equipment.']).forEach(t=>{const p=document.createElement('p');p.textContent='◆ '+t;$('journal-notes').append(p);});
}
function door(){
if(!s.dossier){show('Cargo deck access',detail('door-detail','The old motors are quiet. For now.')+'<p>I need a lead before we reach Titan. Finish the investigation first.</p><p class="small">NEXT: '+objective()+'</p>',[['Back to room',close],['Check notebook',journal]]);return;}
if(!has('pass')){show('Passenger credential required','<div class="access-reader">CARGO 04<br><span>INSERT TRANSIT PASS</span></div><p>The door needs your transit pass. It is not in the duffel. Maybe it slipped out where you slept.</p>',[['Check the bunk',bed],['Back to room',close]]);return;}
show('Ready to leave?','<div class="access-reader granted">C. CORLEX<br><span>PASSENGER VERIFIED</span></div><p>Case file saved. Pass accepted. '+(has('cap')?'Mom’s cap is packed.':'Your cap is still on the bunk, if you want it.')+'</p><p>The Reaper is somewhere on Titan.</p>',[['Press door release',()=>{s.finished=true;record('Cargo door released. Next stop: Titan.');close();$('departure').hidden=false;$('return-room').focus();}],['Stay a little longer',close]]);
}
function use(i,id){
if(i==='earpiece'&&['porthole','network','cube'].includes(id)){network();return;}
if(i==='notebook'){if(['archives','timeline','matches','dossier'].includes(id))({archives,timeline,matches,dossier})[id]();else journal();return;}
if(i==='pass'&&id==='door'){door();return;}
if(i==='cap'&&id==='bed'){s.items=s.items.filter(i=>i!=='cap');save();say('Cap back on the bunk. One less thing in my pockets.');return;}
say(i==='earpiece'?'No signal through that. A receiver needs a clear view of space.':i==='pass'?'A passenger credential. Try the cargo door’s reader.':'Warm ears will not get Mike a connection. Try putting the cap on the bed.');
}
function interact(id){
if(selected){const i=selected;selected=null;render();use(i,id);return;}
if(verb==='talk'&&id!=='mike'){mike();$('conversation').textContent=id==='door'?'“It is a door, boss. I am the conversational one.”':hint();return;}
const views={bed,cap,bag,porthole,archives,timeline,dossier,matches,network,door,mike};
if(views[id]){views[id]();return;}
if(id==='lamp'){s.lamp=!s.lamp;save();say(s.lamp?'A little warmth. Better.':'Lamp off. Just the holograms now.');return;}
if(id==='mug'){show('The last of the coffee',detail('mug-detail','Tin. A cracked handle. Cold coffee.')+'<p>Yesterday’s coffee. It is not going to improve with age.</p>',[['Drink it anyway',()=>{close();say('Cold. Bitter. Still coffee. I feel marginally more qualified to make bad decisions.');}],['Leave it',close]]);return;}
if(id==='cube'){show('Holo-cube · investigation workspace','<p>Select a workspace to open it.</p><div class="workspace-status">'+stages.map(k=>'<span class="'+(s[k]?'success':'')+'">'+(s[k]?'◆':'◇')+' '+k+'</span>').join('')+'</div>',[['Hypernet',network],['Archives',archives],['Timeline',timeline],['Image matches',matches],['Case board',dossier]],true);}
}
function pulse(e){const r=$('game').getBoundingClientRect(),d=$('click-ring');d.style.left=(e.clientX-r.left)+'px';d.style.top=(e.clientY-r.top)+'px';d.classList.remove('pulse');void d.offsetWidth;d.classList.add('pulse');}
objects.forEach(([id,label,x,y,w,h])=>{const b=document.createElement('button');b.className='hotspot';b.dataset.object=id;b.setAttribute('aria-label',label);b.title=label;b.style.cssText='left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%';const hover=()=>{$('hover').textContent=selected?'Use '+names[selected]+' on '+label.toLowerCase():(verb==='talk'?'Ask Mike about ':verb==='use'?'Use ':'Examine ')+label.toLowerCase();};b.onmouseenter=hover;b.onfocus=hover;b.onclick=e=>{pulse(e);interact(id);};$('hotspots').append(b);});
function setVerb(v){verb=v;selected=null;render();$('hover').textContent=v.toUpperCase()+' — choose an object';}
document.querySelectorAll('[data-verb]').forEach(b=>b.onclick=()=>setVerb(b.dataset.verb));
$('journal').onclick=journal;$('close').onclick=close;$('dismiss-toast').onclick=()=>$('toast').hidden=true;
$('return-room').onclick=()=>{$('departure').hidden=true;$('journal').focus();};
function help(){$('game').classList.toggle('hints');say('Objects open close-ups. Collect gear from the duffel. Select an inventory item, then a target. Click Mike for conversation and hints.','MIKE');}
$('help').onclick=help;
$('game').addEventListener('click',e=>{if(e.target===$('scene')||e.target===$('hotspots')){pulse(e);selected=null;render();say('Choose an object to investigate. Press H to reveal the room’s interactive objects.');}});
document.addEventListener('keydown',e=>{
if(!$('opening').hidden)return;
if(e.key==='Escape'){if(!$('departure').hidden)$('return-room').click();else if(!$('modal').hidden)close();else{selected=null;$('toast').hidden=true;render();}return;}
const panel=!$('departure').hidden?$('departure'):!$('modal').hidden?$('modal'):null;
if(panel){if(e.key==='Tab'){const f=[...panel.querySelectorAll('button:not(:disabled),select,input')],first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
if(['1','2','3'].includes(e.key))setVerb({1:'look',2:'use',3:'talk'}[e.key]);if(e.key.toLowerCase()==='j')journal();if(e.key.toLowerCase()==='h')help();
});
function opening(){
selected=null;render();$('modal').hidden=true;$('departure').hidden=true;$('toast').hidden=true;
$('game').hidden=true;$('game-instructions').hidden=true;$('opening').hidden=false;
$('start-game').textContent=s.log.length?'Continue investigation →':'Begin investigation →';
$('opening-save').textContent=s.log.length?'Your saved investigation is ready to continue.':'Your progress saves automatically in this browser.';
$('start-game').focus();
}
$('start-game').onclick=()=>{
$('opening').hidden=true;$('game').hidden=false;$('game-instructions').hidden=false;
say(s.log.length?'Welcome back, boss. '+objective()+'.':'Open your duffel by the bunk. Your gear is still packed.','MIKE');
document.querySelector('[data-object="bag"]').focus();
};
$('title-screen').onclick=opening;
opening();
})();
