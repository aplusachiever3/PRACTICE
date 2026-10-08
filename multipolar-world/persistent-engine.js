/* Persistent World Engine V21.1 */
const PersistentEngine={\n  liveTickMode:true,
  TICK_MS:3000,
  MAX_OFFLINE_TICKS:5000,
  init(worlds){
    const now=Date.now();
    worlds.forEach(w=>{
      if(!w.persistent) w.persistent={worldTime:0,lastWallClock:now,totalTicks:0};
      if(!Number.isFinite(w.persistent.worldTime)) w.persistent.worldTime=0;
      if(!Number.isFinite(w.persistent.lastWallClock)) w.persistent.lastWallClock=now;
      if(!Number.isFinite(w.persistent.totalTicks)) w.persistent.totalTicks=0;
    });
    return worlds;
  },
  markLiveTick(worlds){
    const now=Date.now();
    this.init(worlds);
    worlds.forEach(w=>{
      w.persistent.worldTime+=this.TICK_MS;
      w.persistent.lastWallClock=now;
      w.persistent.totalTicks++;
    });
  },
  async catchUp(worlds){
    this.init(worlds);
    const now=Date.now();
    let elapsed=0;
    worlds.forEach(w=>{elapsed=Math.max(elapsed,Math.max(0,now-w.persistent.lastWallClock));});
    let count=Math.floor(elapsed/this.TICK_MS);
    if(count<=0){
      worlds.forEach(w=>w.persistent.lastWallClock=now);
      return {ticks:0,elapsedMs:elapsed,events:[]};
    }
    count=Math.min(count,this.MAX_OFFLINE_TICKS);
    const events=[];
    for(let i=0;i<count;i++){
      const result=RuntimeEngine.tick(worlds);
      MarketEngine.tick(worlds);
      if(result&&result.events) events.push(...result.events);
      worlds.forEach(w=>{
        w.persistent.worldTime+=this.TICK_MS;
        w.persistent.totalTicks++;
      });
    }
    worlds.forEach(w=>w.persistent.lastWallClock=now);
    return {ticks:count,elapsedMs:elapsed,events};
  },
  format(ms){
    const sec=Math.floor(ms/1000),days=Math.floor(sec/86400),hours=Math.floor(sec%86400/3600),mins=Math.floor(sec%3600/60);
    if(days)return days+"天 "+hours+"小时";
    if(hours)return hours+"小时 "+mins+"分钟";
    if(mins)return mins+"分钟";
    return Math.max(0,sec)+"秒";
  }
};
