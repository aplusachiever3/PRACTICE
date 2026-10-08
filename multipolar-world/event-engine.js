const EventEngine={
  make(type,severity,text,worldId=null,meta={}){
    return {ts:Date.now(),type,severity,text,worldId,meta};
  },
  diff(before,after,worlds){
    const events=[];
    const push=(type,severity,text,w,meta={})=>events.push(this.make(type,severity,text,w.id,meta));
    const pct=(n)=>Math.round(n);
    const prevC=before.civ, nextC=after.civ;
    if(after.economy){
      const g=after.economy.gdp-(before.economy?.gdp||after.economy.gdp);
      const inf=after.economy.inflation-(before.economy?.inflation||after.economy.inflation);
      const tb=after.economy.trade_balance-(before.economy?.trade_balance||0);
      if(Math.abs(g)>=2)push("ECONOMY",g>0?"INFO":"WARNING",g>0?`GDP expansion: ${after.name} reached ${after.economy.gdp}T.`:`GDP contraction: ${after.name} fell to ${after.economy.gdp}T.`,after,{gdp:after.economy.gdp});
      if(inf>=.2)push("ECONOMY","WARNING",`Inflation pressure rising in ${after.name} (${after.economy.inflation}%).`,after,{inflation:after.economy.inflation});
      if(tb>=2)push("ECONOMY","INFO",`${after.name} records a stronger trade surplus (+${tb}).`,after,{tradeBalance:after.economy.trade_balance});
      if(tb<=-2)push("ECONOMY","WARNING",`${after.name} enters a deeper trade deficit (${after.economy.trade_balance}).`,after,{tradeBalance:after.economy.trade_balance});
      if(after.energy<25)push("ECONOMY","CRITICAL",`Energy crisis in ${after.name}: reserves are critically low.`,after,{energy:after.energy});
    }
    const oldRel=before.diplomacy?.relations||{}, newRel=after.diplomacy?.relations||{};
    for(const o of worlds){
      if(o.id===after.id)continue;
      const old=oldRel[o.id], now=newRel[o.id];
      if(old==null||now==null)continue;
      if(now>=65&&old<65)push("DIPLOMACY","INFO",`${after.name} forms an alliance with ${o.name}.`,after,{with:o.id,relation:now});
      else if(now>=40&&old<40)push("DIPLOMACY","INFO",`${after.name} signs a treaty with ${o.name}.`,after,{with:o.id,relation:now});
      else if(now<20&&old>=20)push("DIPLOMACY","WARNING",`Relations between ${after.name} and ${o.name} deteriorate sharply.`,after,{with:o.id,relation:now});
      if(now<0&&old>=0)push("WAR","WARNING",`Hostilities erupt between ${after.name} and ${o.name}.`,after,{with:o.id,relation:now});
    }
    if(after.politics&&before.politics){
      if(after.politics.government!==before.politics.government)push("POLITICS","INFO",`${after.name} changes government: ${before.politics.government} → ${after.politics.government}.`,after,{from:before.politics.government,to:after.politics.government});
      if(after.politics.stability<35&&before.politics.stability>=35)push("WAR","CRITICAL",`${after.name} enters a political crisis; conflict risk is elevated.`,after,{stability:after.politics.stability});
    }
    if(prevC!==nextC)push("CIVILIZATION","INFO",`${after.name} advances from ${prevC} to ${nextC}.`,after,{from:prevC,to:nextC});
    if(after.gate<30&&before.gate>=30)push("GATE","WARNING",`${after.name} gate network becomes unstable (Gate ${after.gate}).`,after,{gate:after.gate});
    if(after.gate>=90&&before.gate<90)push("GATE","INFO",`${after.name} reaches a high-capacity gate era (Gate ${after.gate}).`,after,{gate:after.gate});
    return events;
  }
};