const worlds=[
{id:"W1",name:"Aster",x:"0x",y:"0y",z:"0z",time:1,energy:72,ai:58,finance:64,gate:82,civ:"C3"},
{id:"W2",name:"Qora",x:"0q",y:"0w",z:"0e",time:10,energy:91,ai:71,finance:48,gate:67,civ:"C4"},
{id:"W3",name:"Chrona",x:"3t",y:"7t",z:"2t",time:1000,energy:55,ai:96,finance:83,gate:91,civ:"C5"}
];
const links=[["W1","W2",76],["W2","W3",88],["W1","W3",42]];
const el=id=>document.getElementById(id);
function render(){
 el("worlds").innerHTML=worlds.map(w=>`<button class="world" onclick="selectWorld('${w.id}')"><b>${w.id}</b><span>${w.name}</span><small>Time ×${w.time} · Gate ${w.gate}</small></button>`).join("");
 el("network").innerHTML=links.map(l=>`<div class="link"><b>${l[0]} ↔ ${l[1]}</b><span>Gate bandwidth ${l[2]}</span></div>`).join("");
}
function selectWorld(id){
 const w=worlds.find(x=>x.id===id);
 el("detail").innerHTML=`<h2>${w.id} · ${w.name}</h2><p>Coordinates: (${w.x}, ${w.y}, ${w.z})</p><div class="stats"><div>⏳ Time <b>×${w.time}</b></div><div>⚡ Energy <b>${w.energy}</b></div><div>🧠 AI <b>${w.ai}</b></div><div>💰 Finance <b>${w.finance}</b></div><div>🚪 Gate <b>${w.gate}</b></div><div>🏛️ Civilization <b>${w.civ}</b></div></div>`;
}
render(); selectWorld("W1");