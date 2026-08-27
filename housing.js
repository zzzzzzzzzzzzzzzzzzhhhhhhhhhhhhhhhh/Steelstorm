'use strict';
(function(){
 const KEY='steelstorm_housing_v1';
 const state=JSON.parse(localStorage.getItem(KEY)||'null')||{houses:0,population:0,last:Date.now()};
 const $=id=>document.getElementById(id); const CAP=5;
 function save(){localStorage.setItem(KEY,JSON.stringify(state))}
 function render(){const box=$('housingPanel');if(!box)return;state.population=Math.min(state.population,state.houses*CAP);box.innerHTML=`<div class="card"><h2>🏠 HOUSING & POPULATION</h2><p>Houses: <b>${state.houses}</b></p><p>Population: <b>${state.population}</b> / ${state.houses*CAP}</p><p class="muted">Each house provides ${CAP} population capacity. Workers come from your population.</p><button class="btn primary" id="buyHouse">BUY HOUSE • $300</button></div>`;$('buyHouse').onclick=()=>{let e=window.steelstormEconomy;if(!e||e.money<300)return alert('Not enough money to buy a house.');e.money-=300;state.houses++;state.population=Math.min(state.houses*CAP,state.population+CAP);save();localStorage.setItem('steelstorm_economy_v1',JSON.stringify(e));render();const mt=$('moneyTop');if(mt)mt.textContent=Math.floor(e.money).toLocaleString()}}
 window.addEventListener('load',()=>{const b=$('buildings');if(b&&!$('housingPanel')){const d=document.createElement('div');d.id='housingPanel';b.prepend(d)}render()});
})();
