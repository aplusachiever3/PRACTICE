/* Autonomous Multipolar World Engine - V21 */
const AutonomousEngine={
  init(w){
    if(!w.autonomy) w.autonomy={policy:"BALANCED",mood:"STABLE",decisions:0,lastDecision:"初始化"};
    if(!w.diplomacy) DiplomacyEngine.init(w);
    return w;
  },
  clamp(v){return Math.max(0,Math.min(100,v))},
  decide(w,worlds){
    this.init(w);
    const l=w.life||{}, e=w.economy||{};
    const stability=RuleEngine.stability(w.rules);
    let policy="BALANCED", action="保持平衡";
    if((l.resources||0)<35 || stability<55){
      policy="SURVIVAL"; action="优先恢复资源与稳定";
      w.energy=this.clamp(w.energy+1.2);
      w.finance=this.clamp(w.finance-0.4);
    }else if((w.ai||0)>82 && (l.technology||0)>75){
      policy="INNOVATION"; action="扩大科技与AI投入";
      w.ai=this.clamp(w.ai+0.8);
      w.finance=this.clamp(w.finance+0.3);
    }else if((e.growth||0)<1 || (w.finance||0)<45){
      policy="ECONOMIC"; action="优先发展贸易与金融";
      w.finance=this.clamp(w.finance+0.7);
      w.energy=this.clamp(w.energy+0.4);
    }else if((w.gate||0)>78){
      policy="EXPANSION"; action="扩大跨世界连接";
      w.gate=this.clamp(w.gate+0.45);
    }else{
      policy="BALANCED"; action="维持综合发展";
      w.energy=this.clamp(w.energy+0.25);
      w.ai=this.clamp(w.ai+0.2);
    }
    w.autonomy.policy=policy;
    w.autonomy.mood=stability<50?"UNSTABLE":stability>82?"CONFIDENT":"STABLE";
    w.autonomy.decisions++;
    w.autonomy.lastDecision=action;
    return action;
  },
  relations(w,worlds){
    this.init(w);
    const events=[];
    worlds.forEach(other=>{
      if(other.id===w.id)return;
      this.init(other);
      const tech=(w.ai+other.ai)/2, trade=(w.finance+other.finance)/2;
      const gap=Math.abs(RuleEngine.stability(w.rules)-RuleEngine.stability(other.rules));
      let rel=w.diplomacy.relations[other.id]??50;
      if(tech>75 && trade>55 && gap<20) rel+=0.45;
      else if(w.gate>75 && other.gate>75) rel+=0.25;
      else if(stabilityOf(w)<45 || stabilityOf(other)<45) rel-=0.35;
      if(w.autonomy.policy==="EXPANSION" && other.autonomy?.policy==="EXPANSION") rel-=0.2;
      rel=this.clamp(rel);
      w.diplomacy.relations[other.id]=Math.round(rel*10)/10;
      if(rel>82 && !w.diplomacy.alliances.includes(other.id) && tech>70){
        w.diplomacy.alliances.push(other.id);
        events.push(EventEngine.make("DIPLOMACY","INFO",w.name+" 与 "+other.name+" 建立新的世界联盟。",w.id,{with:other.id,relation:rel}));
      }
      if(rel<25 && Math.random()<0.12){
        events.push(EventEngine.make("DIPLOMACY","WARNING",w.name+" 与 "+other.name+" 的关系跌入危险区。",w.id,{with:other.id,relation:rel}));
      }
    });
    return events;
  },
  gateDecisions(w,worlds){
    const events=[];
    if((w.gate||0)<70)return events;
    const candidates=worlds.filter(x=>x.id!==w.id);
    if(!candidates.length)return events;
    candidates.sort((a,b)=>(w.diplomacy.relations[b.id]??50)-(w.diplomacy.relations[a.id]??50));
    const target=candidates[0];
    const r=TransformationEngine.simulate(w,target);
    if(r.success && Math.random()<0.18){
      w.energy=this.clamp(w.energy-r.cost*.08);
      w.gate=this.clamp(w.gate+0.2);
      events.push(EventEngine.make("GATE","INFO","世界之门自动开启："+w.name+" → "+target.name+"，身份连续性已保持。",w.id,{target:target.id,cost:r.cost,anchor:r.anchor}));
    }
    return events;
  },
  tick(worlds){
    const events=[];
    worlds.forEach(w=>{
      this.decide(w,worlds);
      events.push(...this.relations(w,worlds));
      events.push(...this.gateDecisions(w,worlds));
    });
    return events;
  }
};
function stabilityOf(w){return RuleEngine.stability(w.rules)}
