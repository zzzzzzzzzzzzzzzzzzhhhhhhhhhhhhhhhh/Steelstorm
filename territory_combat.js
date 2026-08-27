'use strict';
/* Steelstorm territory system: each commander starts with a 100 km x 100 km homeland. */
(function(){
 const KEY='steelstorm_territory_v1';
 const factions=[
  {id:'arcton',name:'Republic of Arcton',x:28,y:38},
  {id:'iron',name:'Iron Coast Federation',x:49,y:32},
  {id:'sable',name:'Sable Union',x:42,y:61},
  {id:'northstar',name:'Northstar Dominion',x:57,y:24}
 ];
 let s=JSON.parse(localStorage.getItem(KEY)||'null')||{spawn:null,land:100,explored:0,armies:[],claimed:[],enemyLand:4000,battles:0};
 const $=id=>document.getElementById(id);
 function save(){localStorage.setItem(KEY,JSON.stringify(s))}
 function render(){
  const box=$('territoryPanel'); if(!box)return;
  const spawn=s.spawn?`<b>${s.spawn.lat.toFixed(1)}°, ${s.spawn.lon.toFixed(1)}°</b>`:'Not selected';
  box.innerHTML=`<div class="card"><h2>🗺️ YOUR TERRITORY</h2><p>Starting homeland: <b>100 km²</b></p><p>Controlled land: <b>${Math.round(s.land)} km²</b></p><p>Explored: <b>${Math.round(s.explored)} km²</b></p><p>Spawn: ${spawn}</p><button class="btn primary" id="chooseSpawn">CHOOSE SPAWN ON MAP</button></div>`+
  `<div class="card"><h2>🧭 EXPLORATION</h2><p>Send a recon team into unclaimed land. Successful expeditions reveal territory that can be claimed.</p><button class="btn" id="explore">SEND EXPLORERS (+50 km²)</button></div>`+
  `<div class="card"><h2>⚔️ TERRITORY COMBAT</h2><p>Attack adjacent enemy territory with an army. The winner takes land from the losing side.</p>${factions.map(f=>`<button class="btn" style="margin:5px 0" data-attack="${f.id}">ATTACK ${f.name.toUpperCase()}</button>`).join('')}</div>`+
  `<div class="card"><h2>📊 WAR RECORD</h2><p>Battles: ${s.battles}</p><p>Enemy territory remaining: ${Math.max(0,Math.round(s.enemyLand))} km²</p></div>`;
  $('chooseSpawn').onclick=()=>chooseSpawn();$('explore').onclick=()=>explore();box.querySelectorAll('[data-attack]').forEach(b=>b.onclick=()=>attack(b.dataset.attack));
 }
 function chooseSpawn(){
  const map=document.querySelector('.earthMap'); if(!map){alert('Open the World Map first.');return}
  alert('Tap/click the Earth map where you want your capital. Your starting territory will be a 100 km² area around that point.');
  map.classList.add('spawnMode');
  const fn=e=>{const r=map.getBoundingClientRect(),x=((e.clientX-r.left)/r.width)*100,y=((e.clientY-r.top)/r.height)*100;s.spawn={lat=>(0),lon:0};s.spawn={lat:90-y*1.8,lon:x*3.6-180};s.land=100;save();map.classList.remove('spawnMode');map.removeEventListener('click',fn);render();alert('Capital placed! You control 100 km² to start.');};
  map.addEventListener('click',fn,{once:false});
 }
 function explore(){if(!s.spawn){alert('Choose a spawn point first.');return} s.explored+=50;s.land+=50;save();render();alert('Explorers returned with new territory mapped. You can now develop it.');}
 function attack(id){if(!s.spawn){alert('Choose a spawn point first.');return} if(s.land<150){alert('You need at least 150 km² and a developed army before launching a territorial offensive.');return}const loss=Math.max(25,Math.floor(Math.random()*76));const gain=Math.min(loss,Math.max(0,s.enemyLand));s.enemyLand-=gain;s.land+=gain;s.battles++;save();render();alert(`Battle for ${factions.find(f=>f.id===id).name}: ${gain} km² captured. Your controlled territory is now ${Math.round(s.land)} km².`)}
 window.addEventListener('load',()=>{let w=document.getElementById('world');if(w&&!document.getElementById('territoryPanel')){const d=document.createElement('div');d.id='territoryPanel';w.prepend(d)}render()});
})();
