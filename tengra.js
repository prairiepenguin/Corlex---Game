(() => {
'use strict';
const $=id=>document.getElementById(id), key='corlex-tengra-v1';
const fresh=()=>({emitter:false,clock:false,arm:false,window:false,cup:false,talked:false,truce:false,prepared:false,finished:false,heat:0});
let s=fresh(),selected=null,phase='cover',lastFocus;
let audioEnabled=false,audioContext;
function sound(kind){
if(!audioEnabled)return;
try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext??=new Audio();audioContext.resume();const now=audioContext.currentTime;
const notes=kind==='cup'?[920,1430,740]:kind==='stun'?[190,380,760]:[440];
notes.forEach((hz,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=kind==='stun'?'triangle':'sine';osc.frequency.value=hz;const start=now+i*.055;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.035,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+.3);osc.connect(gain);gain.connect(audioContext.destination);osc.start(start);osc.stop(start+.32);});
}catch{audioEnabled=false;$('tg-sound').textContent='Sound unavailable';$('tg-sound').setAttribute('aria-pressed','false');}
}
try{const v=JSON.parse(localStorage.getItem(key));if(v&&typeof v==='object'){for(const k of Object.keys(s))if(typeof s[k]==='boolean'&&typeof v[k]==='boolean')s[k]=v[k];if(Number.isInteger(v.heat))s.heat=Math.max(0,Math.min(2,v.heat));}}catch{}
if(s.finished)phase='finished';
const objects=[
['amanda','Talk to Amanda',54,12,16,57],
['emitter','Suppression emitter',56.5,49.5,6.5,8],
['clock','Wall clock',29.8,4.5,9,18],
['island','Kitchen island / cup',32,39,19,16],
['door','Broken doorway',0,5,14,35],
['arm','Mechanical arm',54,23,10,13],
['window','Window / city park',74,3,25,31],
['rifle','Rifle by the window',75,33,16,17]];
function objective(){
if(s.finished)return 'Encounter complete · what was she protecting?';
if(phase==='wait')return 'Wait for Amanda to glance toward the clock';
if(phase==='glance')return 'Send the cup beyond the suppression field';
if(phase==='turned')return 'Use the stunner while she is distracted';
if(!s.emitter||!s.clock)return 'Read the room: inspect the emitter and clock';
if(!s.truce)return 'Talk Amanda into a temporary truce';
if(!s.cup)return 'Find something you can use as a distraction';
if(!s.prepared)return 'Use the cup on the doorway to plan a distraction';
return 'Your opening is ready. Make your move.';
}
function ready(){return s.emitter&&s.clock&&s.truce&&s.cup&&s.prepared;}
function save(){try{localStorage.setItem(key,JSON.stringify(s));}catch{}render();}
function render(){
$('tg-objective').textContent=objective();
$('tg-pressure').textContent=s.finished?'STILL ALIVE':s.heat===2?'TENSION: HIGH':s.heat===1?'TENSION: RISING':'TENSION: HELD';
$('tg-pressure').dataset.heat=String(s.heat);
$('tg-stage').dataset.phase=phase;
$('tg-stage').classList.toggle('field-mapped',s.emitter&&!s.finished);
$('tg-stage').classList.toggle('cup-taken',s.cup);
$('tg-stunner').setAttribute('aria-pressed',String(selected==='stunner'));
$('tg-cup').setAttribute('aria-pressed',String(selected==='cup'));
$('tg-cup').disabled=!s.cup||s.finished;
$('tg-stunner').disabled=s.finished;
$('tg-cup').textContent=s.cup?'○ Silver cup':'○ Cup · not collected';
$('tg-selection').textContent=selected?'Selected: '+(selected==='cup'?'silver cup':'stunner')+' — choose a target.':'Select gear, then a target.';
$('tg-plan').textContent=s.finished?'Replay encounter':ready()?'Make your move →':'Review your plan';
$('tg-hint').disabled=s.finished;
$('start-tengra').textContent=s.finished?'Revisit confrontation →':s.emitter||s.clock||s.talked?'Continue confrontation →':'Play the confrontation →';
$('tg-scene-label').textContent=s.finished?'One chance. Taken.':phase==='cover'?'Behind the island · stay low':phase==='wait'?'Watch the clock.':phase==='glance'?'Her eyes move. Yours do not.':'A sound beyond the field.';
$('tg-clues').replaceChildren();
[['emitter','Sound dies inside the field.'],['clock','She keeps checking the clock.'],['truce','She agreed not to shoot. For now.'],['cup','Silver cup collected.'],['prepared','A distraction beyond the field.']].forEach(([k,t])=>{const li=document.createElement('li');li.textContent=(s[k]?'◆ ':'◇ ')+(s[k]?t:{emitter:'Understand the silent room',clock:'Find what steals her attention',truce:'Buy a moment to think',cup:'Find a distraction',prepared:'Choose where the sound can travel'}[k]);li.className=s[k]?'tg-done':'';$('tg-clues').append(li);});
document.querySelectorAll('[data-tg-object]').forEach(b=>b.classList.toggle('observed',!!s[b.dataset.tgObject]));
document.querySelectorAll('[data-tg-target]').forEach(b=>{b.disabled=s.finished;b.setAttribute('aria-label',selected?'Use '+selected+' on '+b.dataset.label:b.dataset.label);});
}
function choices(list){
$('tg-choices').replaceChildren();
list.forEach(([text,fn])=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;$('tg-choices').append(b);});
}
function line(who,text,list=[]){$('tg-speaker').textContent=who;$('tg-line').textContent=text;choices(list);}
function detail(title,text,actions=[],object=''){
lastFocus=document.activeElement;$('tg-detail-title').textContent=title;$('tg-detail-body').replaceChildren();
if(object){const crop=document.createElement('div');crop.className='tg-closeup tg-crop-'+object;crop.setAttribute('role','img');crop.setAttribute('aria-label',title+' close-up');$('tg-detail-body').append(crop);}
const p=document.createElement('p');p.textContent=text;$('tg-detail-body').append(p);$('tg-detail-actions').replaceChildren();
actions.forEach(([t,fn])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=fn;$('tg-detail-actions').append(b);});
$('tg-detail').hidden=false;$('tengra-demo').classList.add('tg-inspecting');$('tg-close').focus();
}
function closeDetail(){$('tg-detail').hidden=true;$('tengra-demo').classList.remove('tg-inspecting');lastFocus?.focus();}
function beat(kicker,title,text){$('tg-beat-kicker').textContent=kicker;$('tg-beat-title').textContent=title;$('tg-beat-text').textContent=text;$('tg-cinematic').hidden=false;}
function hint(){
if(!s.emitter)return 'Look at the small cyan-ringed emitter on the coffee table. That is why the door made no sound.';
if(!s.clock)return 'The wall clock is pulling her attention. Inspect it.';
if(!s.truce)return 'Talk to Amanda. Admit you are in over your head, then ask her to promise not to shoot.';
if(!s.cup)return 'Inspect the kitchen island. The silver cup is within reach.';
if(!s.prepared)return 'Select the cup, then the broken doorway. It is outside the suppression field.';
return 'Choose Make your move. Wait for her glance, send the cup beyond the field, then use the stunner.';
}
function checkpoint(text){
s.heat=1;s.truce=false;s.prepared=false;selected=null;phase='cover';$('tg-cinematic').hidden=true;save();
line('AMANDA',text,[['Take a breath. Try talking.',talk],['Ask Mike quietly',()=>line('MIKE',hint(),[['Talk to Amanda',talk]])]]);
}
function risk(text){s.heat++;if(s.heat>=3){checkpoint('Enough. Back behind the island. You are not getting a second warning.');return;}save();line('AMANDA',text,[['De-escalate',talk],['Think it through',()=>line('MIKE',hint(),[['Talk to Amanda',talk]])]]);}
function truce(){s.talked=true;s.truce=true;s.heat=Math.max(0,s.heat-1);save();line('AMANDA','For now. Put the gun down, hunter, and tell me why I should care.',[['“Bodies are hard to dispose of?”',()=>{line('AMANDA','She almost smiles. “They are. Keep talking.”',[['Read the room',()=>line('CORLEX','A deadline. A silent room. There has to be a way.',[['Talk to Amanda',talk]])]]);}],['Look for an opening',()=>line('CORLEX','Her pistol settles a fraction. Do not waste this.',[['Talk to Amanda',talk]])]]);}
function talk(){
if(s.finished){ending();return;}
if(phase!=='cover'){line('MIKE','You already have the opening. Do not give it away.',phaseChoices());return;}
if(!s.talked){line('AMANDA','Who the hell are you?',[
['“I’m Cody. Clearly in over my head.”',()=>{s.talked=true;save();line('AMANDA','Stand up. Slowly.', [['“Promise you won’t shoot me?”',truce],['“Bodies are hard to dispose of?”',truce],['“I know what you’re worth.”',()=>risk('And is it worth dying for?')]]);}],
['“I’m a hunter. We can talk.”',()=>{s.talked=true;save();line('AMANDA','Then you know who I am. Give me one reason.', [['“Bodies are hard to dispose of?”',truce],['“Promise you won’t shoot?”',truce]]);}],
['“Put the gun down.”',()=>risk('You first. Your position is considerably worse than mine.')]]);return;}
if(!s.truce){line('AMANDA','I am still waiting for a reason not to shoot.', [['“Promise you won’t shoot me?”',truce],['“Bodies are hard to dispose of?”',truce],['“Let’s both take a breath.”',truce]]);return;}
line('AMANDA','Talk. Make it interesting.',[
['“What’s happening in the park?”',()=>{s.window=true;save();line('AMANDA','A great many people making a great deal of noise. You should have stayed down there.', [['Keep her talking',talk]]);}],
['“You keep checking that clock.”',()=>risk('And you should keep your eyes on me.')],
['“I’m clearly outmatched here.”',()=>{s.heat=Math.max(0,s.heat-1);save();line('AMANDA','At last. An accurate assessment.', [['Keep her talking',talk]]);}],
['Return to observing',()=>line('CORLEX','I have seconds to think. As long as she thinks I am talking.', [['Talk to Amanda',talk]])]]);
}
function inspect(id){
if(s.finished){ending();return;}
if(selected){const item=selected;selected=null;save();use(item,id);return;}
if(phase!=='cover'){line('MIKE','Stay with the plan.',phaseChoices());return;}
if(id==='amanda'){talk();return;}
if(id==='emitter'){s.emitter=true;save();detail('A pocket of silence','The emitter swallows sound around Amanda and the coffee table. That explains the silent door crash. A noise inside the field is useless. The doorway is beyond its edge.',[['Mark the field',()=>{closeDetail();line('CORLEX','Make the sound outside the field. Make her look away.', [['Talk to Amanda',talk]]);}]],'emitter');return;}
if(id==='clock'){s.clock=true;save();detail('The clock matters','Her eyes keep returning to the clock. Something outside this apartment is running on a schedule. When she checks it again, her attention will split.',[['Keep that in mind',()=>{closeDetail();line('CORLEX','Wait for the glance. Then act.', [['Talk to Amanda',talk]]);}]],'clock');return;}
if(id==='island'){detail('Within reach','The marble island is the only reason you are still alive. A silver cup sits near the edge. Light enough to send across the room; loud enough to matter outside that field.',s.cup?[['Back behind cover',closeDetail]]:[['Take the silver cup',()=>{s.cup=true;save();closeDetail();line('CORLEX','One silver cup. Hardly a plan. Yet.', [['Talk to Amanda',talk]]);}]],'island');return;}
if(id==='door'){detail('Beyond the field','The shattered door opens onto the hallway. Its threshold lies outside the emitter’s range. If something clatters there, Amanda will hear it.',[['Back to cover',closeDetail]],'door');return;}
if(id==='arm'){s.arm=true;save();detail('Not an ordinary opponent','Metal joints. Almost no wasted motion. Her mechanical arm is already trained on your cover. A direct rush gives her the advantage.',[['Keep low',closeDetail]],'arm');return;}
if(id==='window'){s.window=true;save();detail('Angel City, far below','The park is filling with press and security. Her rifle is positioned to overlook it. Whatever Amanda is waiting for, it is close.',[['Back to the room',closeDetail]],'window');return;}
detail('A rifle with a view','Set up beside the armchair, facing the park. Too far away to reach from cover. Reaching for it now would leave you exposed.',[['Leave it alone',closeDetail]],'rifle');
}
function use(item,target){
if(item==='cup'){
if(target!=='door'){line('CORLEX',target==='emitter'?'You tap the cup against the marble. The sound dies. It needs to land beyond the field.':'The doorway is the useful target. A clatter beside Amanda will vanish inside the field.', [['Ask Mike',()=>line('MIKE',hint(),[['Talk to Amanda',talk]])]]);return;}
if(!s.emitter||!s.clock||!s.truce){line('MIKE',!s.emitter?'Understand the emitter before you use the cup.':!s.clock?'Find what already draws her eyes. Do not improvise this.':'Get her to agree to talk before moving that cup.', [['Talk to Amanda',talk]]);return;}
if(phase==='glance'){toss();return;}
s.prepared=true;save();line('CORLEX','The doorway. Beyond the silence. Wait for the clock, then send the cup.', [['Make your move',plan],['Talk to Amanda',talk]]);return;
}
if(target==='amanda'&&phase==='turned'){finish();return;}
line('MIKE','Not while she is watching you. The stunner needs an opening.',phase==='cover'?[['Talk to Amanda',talk]]:phaseChoices());
}
function plan(){
if(s.finished){restart();return;}
if(!ready()){detail('Not yet. Think it through.',hint(),[['Back to the room',closeDetail],['Ask Amanda to talk',()=>{closeDetail();talk();}]]);return;}
detail('Three beats. One chance.','You have a truce, a cup, and a boundary where sound returns. Wait for her glance at the clock. Send the cup past the boundary. Move while she is looking toward the door.',[
['Wait for the clock glance',()=>{closeDetail();phase='wait';save();beat('01 / HOLD','Not yet.','Keep your eyes on the clock. Let her attention move first.');line('CORLEX','Stay low. Wait for it.',phaseChoices());}],
['Throw the cup immediately',()=>{closeDetail();risk('What are you doing with that cup?');}],
['Rush her from cover',()=>{closeDetail();checkpoint('The pistol tracks you before you clear the island. Back. Now.');}]
]);
}
function phaseChoices(){
if(phase==='wait')return [['Wait for her glance',()=>{phase='glance';save();beat('02 / DISTRACT','There.','Her eyes flick toward the clock. The doorway is beyond the field.');line('CORLEX','Her eyes move. This is the moment.',phaseChoices());}]];
if(phase==='glance')return [['Send the cup beyond the field',toss],['Throw it at the emitter',()=>{checkpoint('The cup lands inside the silence. Amanda never looks away. Back to cover.');}]];
if(phase==='turned')return [['Move left and use the stunner',finish],['Hesitate',()=>checkpoint('Her eyes return to you. The opening is gone. Talk your way back into one.')]];
return [['Talk to Amanda',talk]];
}
function toss(){phase='turned';save();sound('cup');beat('03 / MOVE','Sound returns.','The cup strikes the threshold. Amanda turns toward it.');line('MIKE','Now, boss.',phaseChoices());}
function finish(){s.finished=true;phase='finished';selected=null;save();sound('stun');ending();}
function ending(){phase='finished';render();beat('DEMO COMPLETE','Still alive.','The stunner catches her mechanical arm. Her pistol hits the floor.');line('AMANDA','You have no idea what you just interrupted.', [['“Then tell me.”',()=>line('AMANDA','Look at the park, hunter. That is where your next question belongs.', [['Replay encounter',restart],['Back to title',title]])],['Replay encounter',restart],['Back to title',title]]);}
function restart(){detail('Restart the confrontation?','This resets this encounter only. The cargo-room investigation is kept.', [['Restart',()=>{s=fresh();phase='cover';selected=null;save();closeDetail();$('tg-cinematic').hidden=true;talk();}],['Keep playing',closeDetail]]);}
function title(){closeDetail();$('title-screen').click();}
function start(){
$('opening').hidden=true;$('game').hidden=true;$('game-instructions').hidden=true;$('tengra-demo').hidden=false;
selected=null;phase=s.finished?'finished':'cover';$('tg-cinematic').hidden=true;render();if(s.finished)ending();else talk();$('tg-title').focus();
}
objects.forEach(([id,label,x,y,w,h])=>{
const b=document.createElement('button');b.className='tg-hotspot';b.dataset.tgObject=id;b.style.cssText='left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%';b.setAttribute('aria-label',label);b.title=label;
b.onmouseenter=b.onfocus=()=>{$('tg-scene-label').textContent=selected?'Use '+selected+' on '+label.toLowerCase():label;};b.onclick=()=>inspect(id);$('tg-hotspots').append(b);
const target=document.createElement('button');target.type='button';target.dataset.tgTarget=id;target.dataset.label=label;target.textContent=label;target.onclick=()=>inspect(id);$('tg-targets').append(target);
});
$('start-tengra').onclick=start;$('tg-title').onclick=title;$('tg-close').onclick=closeDetail;
$('tg-sound').onclick=()=>{audioEnabled=!audioEnabled;$('tg-sound').textContent=audioEnabled?'Sound on':'Sound off';$('tg-sound').setAttribute('aria-pressed',String(audioEnabled));sound('click');};
$('tg-hint').onclick=()=>line('MIKE',hint(),phase==='cover'?[['Talk to Amanda',talk],['Review your plan',plan]]:phaseChoices());
$('tg-plan').onclick=plan;$('tg-reset').onclick=restart;
$('tg-stunner').onclick=()=>{selected=selected==='stunner'?null:'stunner';render();};
$('tg-cup').onclick=()=>{if(s.cup){selected=selected==='cup'?null:'cup';render();}};
document.addEventListener('keydown',e=>{
if($('tengra-demo').hidden)return;
if(!$('tg-detail').hidden){if(e.key==='Escape')closeDetail();if(e.key==='Tab'){const all=[...$('tg-detail').querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===all.at(-1)){e.preventDefault();all[0].focus();}}return;}
if(e.key==='Escape'){selected=null;render();}
if(e.key.toLowerCase()==='h'){$('tg-stage').classList.toggle('show-hotspots');}
});
render();
})();
