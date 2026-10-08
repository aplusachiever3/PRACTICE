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
 if(el("dashEngine"))el("dashEngine").textContent=machineRunning?"运行中":"已停止";
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
 renderCosmos();
 worlds.forEach(function(w){LifeEngine.init(w);EconomyEngine.init(w);DiplomacyEngine.init(w);});
 if(el("worlds"))el("worlds").innerHTML=worlds.map(function(w){
   return '<button class="world" onclick="selectWorld(\''+w.id+'\')"><b>'+w.id+'</b><span>'+w.name+'</span><small>时间 ×'+w.time+' · 世界之门 '+w.gate+'</small></button>';
 }).join("");
 if(el("network"))el("network").innerHTML=links.map(function(l){return '<div class="link"><b>'+l[0]+' ↔ '+l[1]+'</b><span>带宽 '+l[2]+'</span></div>';}).join("");
}
function showWorldEvent(e){
 var box=el("eventVisualizer");if(!box)return;
 var type=(e&&e.type)||"WORLD",sev=(e&&e.severity)||"INFO",text=(e&&e.text)||"世界发生变化";
 var icon=type==="GATE"?"⚡":type==="WAR"?"⚔️":type==="DIPLOMACY"?"🤝":type==="CIVILIZATION"?"🧬":type==="ENERGY"?"🔋":type==="ECONOMY"?"📈":type==="TIME"?"⏳":"✦";
 var cls=type==="WAR"?"event-war":type==="DIPLOMACY"?"event-alliance":type==="GATE"?"event-gate":type==="CIVILIZATION"?"event-civilization":type==="ENERGY"?"event-energy":"event-world";
 var item=document.createElement("div");item.className="event-flash "+cls+" event-"+String(sev).toLowerCase();
 item.innerHTML='<span class="event-icon">'+icon+'</span><div><b>'+({WAR:"战争",DIPLOMACY:"联盟 / 外交",GATE:"WORLD GATE",CIVILIZATION:"文明跃迁",ENERGY:"能源危机",ECONOMY:"经济"}[type]||"世界事件")+'</b><p>'+text+'</p></div>';
 box.prepend(item);while(box.children.length>4)box.removeChild(box.lastChild);setTimeout(function(){item.classList.add("event-fade");},4200);
 var map=el("cosmosMap");if(map){map.classList.remove("cosmos-shock");void map.offsetWidth;map.classList.add("cosmos-shock");map.classList.add(cls);setTimeout(function(){map.classList.remove(cls);},1800);}
 var source=e&&e.meta&&(e.meta.source||e.meta.world||e.meta.from),target=e&&e.meta&&(e.meta.target||e.meta.with||e.meta.to);
 var nodes=map?map.querySelectorAll(".cosmos-world"):null;
 if(nodes)Array.prototype.forEach.call(nodes,function(n){var onclick=n.getAttribute("onclick")||"";if((source&&onclick.indexOf(source)>=0)||(target&&onclick.indexOf(target)>=0)){n.classList.add("event-node-hit");n.classList.add(cls+"-node");setTimeout(function(){n.classList.remove("event-node-hit");n.classList.remove(cls+"-node");},1800);}});
}
function renderCosmos(){
 var box=el("cosmosMap"); if(!box)return;
 var pos={W1:[24,58],W2:[50,30],W3:[76,58]};
 var html='<div class="cosmos-stars"></div>';
 links.forEach(function(l){
   var a=pos[l[0]]||[20,50],b=pos[l[1]]||[80,50];
   var rel=l[2], cls=rel>=75?"friendly":rel<50?"tense":"neutral";
   html+='<div class="cosmos-link '+cls+'" style="left:'+a[0]+'%;top:'+a[1]+'%;width:'+Math.hypot(b[0]-a[0],b[1]-a[1])+'%;transform:rotate('+Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+'deg)"></div>';
 });
 worlds.forEach(function(w){
   var p=pos[w.id]||[50,50], stab=Math.round((w.rules.energy_stability+w.rules.matter_stability+w.rules.biology_compatibility+w.rules.consciousness_compatibility)/4);
   var pulse=w.autonomy&&w.autonomy.policy?w.autonomy.policy:"BALANCED";
   html+='<button class="cosmos-world" style="left:'+p[0]+'%;top:'+p[1]+'%" onclick="selectWorld(\''+w.id+'\')"><span class="world-orbit"></span><strong>'+w.name+'</strong><small>'+w.id+' · '+w.civ+'</small><em>⚡ '+Math.round(w.energy)+' · ◉ '+stab+'%</em><i>'+pulse+'</i></button>';
 });
 box.innerHTML=html;
}
function selectWorld(id){
 var w=worlds.find(function(x){return x.id===id;}); if(!w)return;
 LifeEngine.init(w);EconomyEngine.init(w);DiplomacyEngine.init(w);
 var rs=Math.round((w.rules.energy_stability+w.rules.matter_stability+w.rules.biology_compatibility+w.rules.consciousness_compatibility)/4);
 if(el("detail"))el("detail").innerHTML='<h2>'+w.id+' · '+w.name+'</h2><p>坐标： ('+w.x+', '+w.y+', '+w.z+')</p><div class="stats"><div>⏳ Time <b>×'+w.time+'</b></div><div>⚡ Energy <b>'+w.energy+'</b></div><div>🧠 AI <b>'+w.ai+'</b></div><div>💰 Finance <b>'+w.finance+'</b></div><div>🏦 GDP <b>'+(w.economy.gdp||0)+'T</b></div><div>📈 Growth <b>'+(w.economy.growth||0)+'%</b></div><div>📦 Trade <b>'+(w.economy.trade_balance||0)+'</b></div><div>🏛️ Sovereignty <b>'+(w.politics.sovereignty||100)+'%</b></div><div>🤝 Alliances <b>'+((w.diplomacy.alliances||[]).length)+'</b></div><div>🚪 世界之门 <b>'+w.gate+'</b></div><div>🏛️ Civilization <b>'+w.civ+'</b></div><div>👥 Population <b>'+w.life.population+'</b></div><div>🌱 Resources <b>'+Math.round(w.life.resources)+'</b></div><div>🔬 Technology <b>'+Math.round(w.life.technology)+'</b></div><div>🏛️ Government <b>'+w.life.government+'</b></div></div><h3>⚙️ World Rules</h3><div class="stats"><div>重力 <b>'+w.rules.gravity+'</b></div><div>时间速率 <b>×'+w.rules.time_rate+'</b></div><div>能量稳定度 <b>'+w.rules.energy_stability+'%</b></div><div>物质稳定度 <b>'+w.rules.matter_stability+'%</b></div><div>生物兼容度 <b>'+w.rules.biology_compatibility+'%</b></div><div>意识兼容度 <b>'+w.rules.consciousness_compatibility+'%</b></div></div><p>🛡️ Rule Stability: <b>'+rs+'%</b></p>';
}
async function createWorld(){
 var n=(el("name")&&el("name").value.trim())||"未命名世界";
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
 var s=el("sourceWorld"),t=el("targetWorld"),out=el("gateResult");
 if(!s||!t||!out)return;
 var a=worlds.find(function(w){return w.id===s.value;}),b=worlds.find(function(w){return w.id===t.value;});
 if(!a||!b){out.innerHTML='<div class="gate-status failed">🔴 请先选择来源世界和目标世界。</div>';return;}
 if(a.id===b.id){out.innerHTML='<div class="gate-status failed">🔴 来源世界和目标世界不能相同。</div>';return;}
 try{
   var r=TransformationEngine.simulate(a,b);
   out.innerHTML='<div class="gate-status '+(r.success?'success':'failed')+'">'+(r.success?'🟢 世界之门开启成功':'🔴 世界之门转换失败')+'</div>'+
   '<div class="stats"><div>世界距离 <b>'+Number(r.distance).toFixed(2)+'</b></div><div>规则差距 <b>'+Number(r.ruleGap).toFixed(3)+'</b></div><div>兼容度 <b>'+r.compatibility+'%</b></div><div>转换能量 <b>'+r.cost+'</b></div><div>锚点稳定度 <b>'+r.anchor+'%</b></div><div>时间压力 <b>'+r.temporal+'%</b></div></div>'+
   '<p>🧬 '+r.form+'</p><p>🔐 '+r.reason+'</p>';
   if(el("storageStatus"))el("storageStatus").textContent=r.success?"✓ 世界之门转换模拟完成":"⚠ 世界之门无法完成转换";
   addHistory((r.success?"世界之门开启：":"世界之门失败：")+a.name+" → "+b.name,r.success?"GATE":"WARNING",r.success?"INFO":"WARNING",{source:a.id,target:b.id,compatibility:r.compatibility,cost:r.cost});
 }catch(e){
   console.error("World Gate error:",e);
   out.innerHTML='<div class="gate-status failed">🔴 世界之门发生错误：'+(e.message||e)+'</div>';
 }
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
 if(el("engineState"))el("engineState").textContent=machineRunning?"运行中":"已停止";
 if(el("dashEngine"))el("dashEngine").textContent=machineRunning?"运行中":"已停止";
 if(el("engineBtn"))el("engineBtn").textContent=machineRunning?"停止模拟器 ■":"启动模拟器 ▶";
 if(machineRunning){
   if(el("storageStatus"))el("storageStatus").textContent="▶ 模拟器运行中…";
   clearInterval(tickTimer);
   runTick().catch(function(e){console.error(e);if(el("storageStatus"))el("storageStatus").textContent= "⚠ 回合警告："+e.message;});
   tickTimer=setInterval(function(){runTick().catch(function(e){console.error(e);});},3000);
 }else{
   clearInterval(tickTimer);tickTimer=null;
   if(el("storageStatus"))el("storageStatus").textContent="■ 模拟器已停止";
 }
}
async function runTick(){
 var result=RuntimeEngine.tick(worlds);MarketEngine.tick(worlds);ticks++;
 if(el("tickCount"))el("tickCount").textContent=ticks;
 render();
 var w=worlds[Math.floor(Math.random()*worlds.length)];
 events+=(result.events||[]).length;
 if(el("eventCount"))el("eventCount").textContent=events;
 if(result.events&&result.events.length){result.events.forEach(function(e){if(!e)return;addHistory(e.text||"世界发生变化",e.type||"WORLD",e.severity||"INFO",e.meta||{});showWorldEvent(e);if(window.WorldStoryEngine)WorldStoryEngine.add(e);});}else{var quiet={ts:Date.now(),type:"WORLD",severity:"INFO",text:"回合 "+ticks+" · "+w.id+" "+w.name+" 已演化 · 无重大事件",meta:{}};addHistory(quiet.text,quiet.type,quiet.severity,quiet.meta);showWorldEvent(quiet);if(window.WorldStoryEngine)WorldStoryEngine.add(quiet);}
 updateDashboard();
 if(el("liveLog")){
   var line="<div>⏱ 回合 "+ticks+" · "+w.id+" "+w.name+" 已演化 · 能量 "+w.energy+" · 人工智能 "+w.ai+" · 金融 "+w.finance+" · "+w.civ+"</div>";
   el("liveLog").innerHTML=line+el("liveLog").innerHTML;
   while(el("liveLog").children.length>8)el("liveLog").removeChild(el("liveLog").lastChild);
 }
 initGate();await WorldStorage.save(worlds);
 if(el("storageStatus"))el("storageStatus").textContent="✓ 已自动保存 · 回合 "+ticks;
}
async function saveWorlds(){await WorldStorage.save(worlds);if(el("storageStatus"))el("storageStatus").textContent="✓ 世界已保存到 IndexedDB";}
function exportWorlds(){WorldStorage.export(worlds);if(el("storageStatus"))el("storageStatus").textContent="✓ 世界备份已导出";}
function importWorlds(){if(el("worldImport"))el("worldImport").click();}
async function handleWorldImport(file){try{var incoming=await WorldStorage.importFile(file);await WorldStorage.replace(incoming);worlds.splice(0,worlds.length);incoming.forEach(function(w){worlds.push(w);});render();selectWorld(worlds[0].id);initGate();updateDashboard();if(el("storageStatus"))el("storageStatus").textContent="✓ 世界数据已导入";}catch(e){if(el("storageStatus"))el("storageStatus").textContent= "✕ 导入失败："+e.message;}if(el("worldImport"))el("worldImport").value="";}
async function clearWorldHistory(){await WorldStorage.clearHistory();history=[];renderHistory();if(el("storageStatus"))el("storageStatus").textContent="✓ 世界历史已清除";}
async function boot(){
 try{
   var data=await Promise.all([WorldStorage.load().catch(function(){return[];}),WorldStorage.loadHistory(200).catch(function(){return[];})]);
   var saved=data[0]||[];history=data[1]||[];
   saved.forEach(function(w){if(!worlds.some(function(x){return x.id===w.id;}))worlds.push(w);});
   if(typeof PersistentEngine!=="undefined"){
     var offline=await PersistentEngine.catchUp(worlds);
     if(offline.ticks>0){
       addHistory("离线世界时间已推进 "+PersistentEngine.format(offline.elapsedMs)+" · 自动演化 "+offline.ticks+" 个回合","TIME","INFO",{offlineTicks:offline.ticks,elapsedMs:offline.elapsedMs});
       await WorldStorage.save(worlds);
     }
   }
   render();selectWorld(worlds[0].id);initGate();updateDashboard();renderHistory();
   if(el("storageStatus"))el("storageStatus").textContent="✓ 世界已恢复 · 世界时间已连续运行";
   setTimeout(function(){ if(!machineRunning) toggleEngine(); },1200);
 }catch(e){console.error(e);render();selectWorld("W1");initGate();updateDashboard();}
}
window.showWorldEvent=showWorldEvent;window.toggleEngine=toggleEngine;window.runTick=runTick;window.createWorld=createWorld;window.openGate=openGate;window.selectWorld=selectWorld;window.saveWorlds=saveWorlds;window.exportWorlds=exportWorlds;window.importWorlds=importWorlds;window.handleWorldImport=handleWorldImport;window.clearWorldHistory=clearWorldHistory;window.initGate=initGate;window.__MULTIPOLAR_ENGINE_VERSION="2026-10-08-v21-persistent";
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
document.addEventListener("DOMContentLoaded",function(){var b=el("gateBtn");if(b)b.onclick=function(){openGate();};});
})();