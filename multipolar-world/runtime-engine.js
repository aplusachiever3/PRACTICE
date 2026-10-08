const LifeEngine={
  clamp(v){return Math.max(0,Math.min(100,v))},
  init(w){if(w.life)return w;w.life={population:Math.round(20+w.ai*.8),resources:Math.round(w.energy*.9),technology:Math.round(w.ai*.7),stability:Math.round((w.rules.energy_stability+w.rules.matter_stability)/2),government:'Emerging Council',age:0};return w},
  tick(w){this.init(w);const l=w.life;l.age++;const growth=(w.finance+w.ai+l.technology)/300;l.population=Math.max(1,Math.round(l.population*(1+.006*growth)));l.resources=this.clamp(l.resources+(w.energy-50)*.08-l.population*.015);l.technology=this.clamp(l.technology+(w.ai/100)*.7+(l.resources>55?.4:-.2));l.stability=this.clamp(l.stability+(l.resources>50?.35:-.7)+(w.gate>70?.15:0));if(l.stability<35)l.government='Crisis Council';else if(l.technology>80)l.government='Technocracy';else if(l.population>100)l.government='World Assembly';return w}
};
const RuntimeEngine={
  tick(worlds){
    const before=worlds.map(w=>structuredClone(w));
    worlds.forEach(w=>{
      LifeEngine.tick(w);
      EconomyEngine.tick(w);
      DiplomacyEngine.init(w);
      const l=w.life;
      const stability=RuleEngine.stability(w.rules);
      const delta=(w.ai/100)*1.2+(w.finance/100)*.8+(w.gate/100)*.5;
      l.resources=l.resources||w.energy;
      w.energy=Math.round(Math.max(0,Math.min(100,w.energy+delta-(100-stability)/120)));
      w.ai=Math.round(Math.max(0,Math.min(100,w.ai+(stability>80?.4:-.2))));
      w.finance=Math.round(Math.max(0,Math.min(100,w.finance+(w.gate>70?.35:-.15))));
      DiplomacyEngine.tick(w,worlds);
      if(w.ai>=85&&w.civ.match(/^C[0-9]+$/)){
        const n=Math.min(9,Number(w.civ.slice(1))+1);
        if(n>Number(w.civ.slice(1)))w.civ='C'+n
      }
    });
    const events=[];
    worlds.forEach((w,i)=>events.push(...EventEngine.diff(before[i],w,worlds)));
    return {worlds,events};
  }
};