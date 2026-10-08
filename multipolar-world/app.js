/* Multipolar World App - stable controller */
(function(){
"use strict";
var history=[];
var base=[
{id:"W1",name:"Aster",x:"0x",y:"0y",z:"0z",time:1,energy:72,ai:58,finance:64,gate:82,civ:"C3",rules:{gravity:1,time_rate:1,energy_stability:88,matter_stability:94,biology_compatibility:91,consciousness_compatibility:86}},
{id:"W2",name:"Qora",x:"0q",y:"0w",z:"0e",time:10,energy:91,ai:71,finance:48,gate:67,civ:"C4",rules:{gravity:.4,time_rate:10,energy_stability:79,matter_stability:83,biology_compatibility:68,consciousness_compatibility:74}},
{id:"W3",name:"Chrona",x:"3t",y:"7t",z:"2t",time:1000,energy:55,ai:96,finance:83,gate:91,civ:"C5",rules:{gravity:2.2,time_rate:1000,energy_stability:72,matter_stability:76,biology_compatibility:61,consciousness_compatibility:93}}
];
var worlds=base.map(function(w){return structuredClone(w);});
var links=[["W1","W2",76],["W2","W3",88],["W1","W3",42]];
var machineRunning=false,tickTimer=null,ticks=0,events=0;
function el(id){return document.getElementById(id);}
function safe(fn){try{return fn();}catch(e){console.error(e);return null;}}
function updateDashboard(){
 worlds.forEach(function(w){LifeEngine.init(w);EconomyEngine.init(w);DiplomacyEngine.init(w);});
 var avgTech=worlds.reduce(function(s,w){return s+w.life.technology;},0)/Math.max(1,worlds.length);
 var avgStab=worlds.reduce(function(s,w){return s+RuleEngine.stability(w.rules);},0)/Math.max(1,worlds.length);
 if(el("dashWorlds"))el("dashWorlds").textContent=worlds.length;
 if(el("dashPopulation"))el("dashPopulation").textContent=worlds.reduce(function(s,w){return s+w.life.population;},0).toLocaleString();
 if(el("dashTech"))el("dashTech").textContent=Math.round(avgTech)+"%";
 if(el("dashStability"))el("dashStability").textContent=Math.round(avgStab)+"%";
 if(el("dashEngine"))el("dashEngine").textContent=machineRunning?"RUNNING":"OFFLINE";
 var mk=safe(function(){return MarketEngine.tick(worlds);})||{mwi:0,energy_price:0,urc_rate:0,world_gdp:0};
 if(el("dashGDP"))el("dashGDP").textContent=worlds.reduce(function(s,w){return s+(w.economy?w.economy.gdp:0);},0).toLocaleString()+"T";
 if(el("dashMWI"))el("dashMWI").textContent=mk.mwi;
 if(el("marketMWI"))el("marketMWI").textContent=mk.mwi;
 if(el("marketEnergy"))el("marketEnergy").textContent=mk.energy_price+" URC";
 if(el("marketURC"))el("marketURC").textContent=mk.urc_rate+"x";
 if(el("marketGDP"))el("marketGDP").textContent=mk.world_gdp+"T";
 if(el("worldBars"))el("worldBars").innerHTML=worlds.map(function(w){return '<div class="bar-row"><span>'+w.id+' · '+w.name+'</span><i><em style="width:'+w.life.technology+'%"></em></i><b>'+Math.round(w.life.technology)+'%</b></div>';}).join("");
}
function render(){
 worlds.forEach(function(w){LifeEngine.init(w);EconomyEngine.init(w);DiplomacyEngine.init(w);});
 if(el("worlds"))el("worlds").innerHTML=worlds.map(function(w){
   return '<button class="world" onclick="selectWorld(\''+w.id+'\')"><b>'+w.id+'</b><span>'+w.name+'</span><small>Time ×'+w.time+' · Gate '+w.gate+'</small></button>';
 }).join("");
 if(el("network"))el("network").innerHTML=links.map(function(l){return '<div class="link"><b>'+l[0]+' ↔ '+l[1]+'</b><span>Bandwidth '+l[2]+'</span></div>';}).join("");
}
function selectWorld(id){
 var w=worlds.find(function(x){return x.id===id;}); if(!w)return;
 LifeEngine.init(w);EconomyEngine.init(w);DiplomacyEngine.init(w);
 var rs=Math.round((w.rules.energy_stability+w.rules.matter_stability+w.rules.biology_compatibility+w.rules.consciousness_compatibility)/4);
 if(el("detail"))el("detail").innerHTML='<h2>'+w.id+' · '+w.name+'</h2><p>Coordinates: ('+w.x+', '+w.y+', '+w.z+')</p><div class="stats"><div>⏳ Time <b>×'+w.time+'</b></div><div>⚡ Energy <b>'+w.energy+'</b></div><div>🧠 AI <b>'+w.ai+'</b></div><div>💰 Finance <b>'+w.finance+'</b></div><div>🏦 GDP <b>'+(w.economy.gdp||0)+'T</b></div><div>📈 Growth <b>'+(w.economy.growth||0)+'%</b></div><div>📦 Trade <b>'+(w.economy.trade_balance||0)+'</b></div><div>🏛️ Sovereignty <b>'+(w.politics.sovereignty||100)+'%</b></div><div>🤝 Alliances <b>'+((w.diplomacy.alliances||[]).length)+'</b></div><div>🚪 Gate <b>'+w.gate+'</b></div><div>🏛️ Civilization <b>'+w.civ+'</b></div><div>👥 Population <b>'+w.life.population+'</b></div><div>🌱 Resources <b>'+Math.round(w.life.resources)+'</b></div><div>🔬 Technology <b>'+Math.round(w.life.technology)+'</b></div><div>🏛️ Government <b>'+w.life.government+'</b></div></div><h3>⚙️ World Rules</h3><div class="stats"><div>Gravity <b>'+w.rules.gravity+'</b></div><div>Time Rate <b>×'+w.rules.time_rate+'</b></div><div>Energy Stability <b>'+w.rules.energy_stability+'%</b></div><div>Matter Stability <b>'+w.rules.matter_stability+'%</b></div><div>Biology Compatibility <b>'+w.rules.biology_compatibility+'%</b></div><div>Consciousness Compatibility <b>'+w.rules.consciousness_compatibility+'%</b></div></div><p>🛡️ Rule Stability: <b>'+rs+'%</b></p>';
}
async function createWorld(){
 var n=(el("name")&&el("name").value.trim())||"Unnamed";
 var id="W"+(worlds.length+1);
 var time=Number(el("timeRate").value)||1;
 var w={id:id,name:n,x:el("x").value||"x",y:el("y").value||"y",z:el("z").value||"z",time:time,energy:Number(el("energy").value)||70,ai:50,finance:50,gate:Number(el("gate").value)||50,civ:"C1",rules:{gravity:Number(el("gravity").value)||1,time_rate:time,energy_stability:70,matter_stability:70,biology_compatibility:70,consciousness_compatibility:70}};
 worlds.push(w); await WorldStorage.save(worlds); render();selectWorld(id);initGate();updateDashboard();
 if(el("machineStatus"))el("machineStatus").textContent="✓ "+id+" created and stored in this browser.";
}
function initGate(){
 var s=el("sourceWorld"),t=el("targetWorld");if(!s||!t)return;
 s.innerHTML=worlds.map(function(w){return '<option value="'+w.id+'">'+w.id+' · '+w.name+'</option>';}).join("");
 t.innerHTML=worlds.map(function(w){return '<option value="'+w.id+'">'+w.id+' · '+w.name+'</option>';}).join("");
 if(worlds.length>1)t.value=worlds[1].id;
}
function openGate(){
 var s=el("sourceWorld"),t=el("targetWorld");if(!s||!t)return;
 var a=worlds.find(function(w){return w.id===s.value;}),b=worlds.find(function(w){return w.id===t.value;});if(!a||!b)return;
 var r=TransformationEngine.simulate(a,b);
 if(el("gateResult"))el("gateResult").innerHTML='<div class="gate-status '+(r.success?'success':'failed')+'">'+(r.success?'🟢 GATE ENTRY SUCCESS':'🔴 GATE ENTRY FAILED')+'</div><div class="stats"><div>World Distance <b>'+r.distance.toFixed(2)+'</b></div><div>Rule Gap <b>'+r.ruleGap.toFixed(3)+'</b></div><div>Compatibility <b>'+r.compatibility+'%</b></div><div>Transformation Energy <b>'+r.cost+'</b></div><div>Anchor Stability <b>'+r.anchor+'%</b></div><div>Temporal Stress <b>'+r.temporal+'%</b></div></div><p>🧬 '+r.form+'</p><p>🔐 '+r.reason+'</p>';
}
function renderHistory(){
 var log=el("historyLog");if(!log)return;
 log.innerHTML=history.map(function(e){return '<div><small>'+new Date(e.ts).toLocaleString()+' · '+(e.type||"WORLD")+' · '+(e.severity||"INFO")+'</small><br>'+e.text+'</div>';}).join("");
}
function addHistory(text,type,severity,meta){
 var e={ts:Date.now(),type:type||"WORLD",severity:severity||"INFO",text:text,meta:meta||{}};
 history.unshift(e);history=history.slice(0,200);WorldStorage.addHistory(e).catch(function(){});renderHistory();
}
function toggleEngine(){
 machineRunning=!machineRunning;
 if(el("engineState"))el("engineState").textContent=machineRunning?"RUNNING":"OFFLINE";
 if(el("dashEngine"))el("dashEngine").textContent=machineRunning?"RUNNING":"OFFLINE";
 if(el("engineBtn"))el("engineBtn").textContent=machineRunning?"STOP MACHINE ■":"START MACHINE ▶";
 if(machineRunning){
   if(el("storageStatus"))el("storageStatus").textContent="▶ Machine running…";
   clearInterval(tickTimer);
   runTick().catch(function(e){console.error(e);if(el("storageStatus"))el("storageStatus").textContent="⚠ Tick warning: "+e.message;});
   tickTimer=setInterval(function(){runTick().catch(function(e){console.error(e);});},3000);
 }else{
   clearInterval(tickTimer);tickTimer=null;
   if(el("storageStatus"))el("storageStatus").textContent="■ Machine stopped";
 }
}
async function runTick(){
 var result=RuntimeEngine.tick(worlds);MarketEngine.tick(worlds);ticks++;
 if(el("tickCount"))el("tickCount").textContent=ticks;
 render();
 var w=worlds[Math.floor(Math.random()*worlds.length)];
 events+=(result.events||[]).length;
 if(el("eventCount"))el("eventCount").textContent=events;
 if(result.events&&result.events.length)result.events.forEach(function(e){addHistory(e.text,e.type,e.severity,e.meta);});
 else addHistory("Tick "+ticks+" · "+w.id+" "+w.name+" evolved · no major events","WORLD","INFO");
 updateDashboard();
 if(el("liveLog")){el("liveLog").innerHTML="<div>⏱ Tick "+ticks+" · "+w.id+" "+w.name+" evolved · Energy "+w.energy+" · AI "+w.ai+" · Finance "+w.finance+" · "+w.civ+"</div>"+el("liveLog").innerHTML;while(el("liveLog").children.length>8)el("liveLog").removeChild(el("liveLog").lastChild);}
 initGate();await WorldStorage.save(worlds);
 if(el("storageStatus"))el("storageStatus").textContent="✓ Auto-saved · Tick "+ticks;
}
async function saveWorlds(){await WorldStorage.save(worlds);if(el("storageStatus"))el("storageStatus").textContent="✓ Worlds saved to IndexedDB";}
function exportWorlds(){WorldStorage.export(worlds);if(el("storageStatus"))el("storageStatus").textContent="✓ World backup exported";}
function importWorlds(){if(el("worldImport"))el("worldImport").click();}
async function handleWorldImport(file){try{var incoming=await WorldStorage.importFile(file);await WorldStorage.replace(incoming);worlds.splice(0,worlds.length);incoming.forEach(function(w){worlds.push(w);});render();selectWorld(worlds[0].id);initGate();updateDashboard();if(el("storageStatus"))el("storageStatus").textContent="✓ World data imported";}catch(e){if(el("storageStatus"))el("storageStatus").textContent="✕ Import failed: "+e.message;}if(el("worldImport"))el("worldImport").value="";}
async function clearWorldHistory(){await WorldStorage.clearHistory();history=[];renderHistory();if(el("storageStatus"))el("storageStatus").textContent="✓ World history cleared";}
function boot(){
 Promise.all([WorldStorage.load().catch(function(){return[];}),WorldStorage.loadHistory(200).catch(function(){return[];})]).then(function(data){
   var saved=data[0]||[];history=data[1]||[];
   saved.forEach(function(w){if(!worlds.some(function(x){return x.id===w.id;}))worlds.push(w);});
   render();selectWorld(worlds[0].id);initGate();updateDashboard();renderHistory();
 }).catch(function(e){console.error(e);render();selectWorld("W1");initGate();updateDashboard();});
}
window.toggleEngine=toggleEngine;window.runTick=runTick;window.createWorld=createWorld;window.openGate=openGate;window.selectWorld=selectWorld;window.saveWorlds=saveWorlds;window.exportWorlds=exportWorlds;window.importWorlds=importWorlds;window.handleWorldImport=handleWorldImport;window.clearWorldHistory=clearWorldHistory;window.initGate=initGate;window.__MULTIPOLAR_ENGINE_VERSION="2026-10-08-d4";
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();