/* World Story Engine */
(function(){
"use strict";
const WorldStoryEngine={
 icon:function(type){return ({WAR:"⚔️",DIPLOMACY:"🤝",CIVILIZATION:"🧬",ECONOMY:"📈",GATE:"⚡",ENERGY:"🔋",TIME:"⏳",POLITICS:"🏛️"})[type]||"✦";},
 title:function(e){return ({WAR:"战争与冲突",DIPLOMACY:"联盟与外交",CIVILIZATION:"文明跃迁",ECONOMY:"经济变化",GATE:"World Gate",ENERGY:"能源危机",TIME:"时间流逝",POLITICS:"政治变化"})[e.type]||"世界事件";},
 explain:function(e){
  var m=e.meta||{};
  if(e.type==="WAR")return m.relation!=null?"关系指数跌破危险阈值（"+Math.round(m.relation)+"），利益冲突开始转化为公开敌对。":"世界稳定度下降，原有秩序无法继续吸收冲突。";
  if(e.type==="DIPLOMACY")return m.relation!=null?"双方关系升至 "+Math.round(m.relation)+"，贸易、技术或共同利益使合作比对抗更有利。":"两个世界发现共同利益，开始把竞争转化为合作。";
  if(e.type==="CIVILIZATION")return "科技、AI与资源条件跨过发展门槛，文明从 "+(m.from||"?")+" 进入 "+(m.to||"?")+"。";
  if(e.type==="ECONOMY")return "生产、贸易和金融状态发生明显变化，世界经济正在重新平衡。";
  if(e.type==="GATE")return "跨世界连接能力发生变化。Gate 会改变贸易、外交与文明扩散的可能性。";
  if(e.type==="POLITICS")return "内部稳定度和社会结构发生变化，治理方式随之调整。";
  if(e.type==="TIME")return "世界没有停止。即使没有人在操作，时间仍推动文明继续演化。";
  return "新的历史事件正在形成。";
 },
 add:function(e){
  var box=document.getElementById("worldStory");if(!box)return;
  var item=document.createElement("article");item.className="story-card story-"+(e.type||"WORLD");
  var time=new Date(e.ts||Date.now()).toLocaleTimeString("zh-SG",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  var w=null;if(typeof worlds!=="undefined"){if(Array.isArray(worlds))w=worlds.find(function(x){return x.id===e.worldId;});else if(worlds&&Array.isArray(worlds.list))w=worlds.list.find(function(x){return x.id===e.worldId;});}
  item.innerHTML='<div class="story-icon">'+this.icon(e.type)+'</div><div><h3>'+this.title(e)+(w?" · "+w.name:"")+'</h3><p>'+e.text+'</p><div class="story-cause"><b>为什么发生？</b> '+this.explain(e)+'</div></div><div class="story-time">'+time+'</div>';
  var empty=box.querySelector(".story-empty");if(empty)box.innerHTML="";
  box.prepend(item);while(box.children.length>5)box.removeChild(box.lastChild);
 }
};
window.WorldStoryEngine=WorldStoryEngine;
})();