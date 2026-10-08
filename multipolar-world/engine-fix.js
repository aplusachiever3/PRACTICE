(function(){
  window.toggleEngine=function(){
    try{
      machineRunning=!machineRunning;
      document.getElementById("engineState").textContent=machineRunning?"RUNNING":"OFFLINE";
      document.getElementById("dashEngine").textContent=machineRunning?"RUNNING":"OFFLINE";
      document.getElementById("engineBtn").textContent=machineRunning?"STOP MACHINE ■":"START MACHINE ▶";
      if(machineRunning){
        document.getElementById("storageStatus").textContent="▶ Machine starting…";
        Promise.resolve(runTick()).catch(function(e){
          machineRunning=false;
          document.getElementById("engineState").textContent="OFFLINE";
          document.getElementById("dashEngine").textContent="OFFLINE";
          document.getElementById("engineBtn").textContent="START MACHINE ▶";
          document.getElementById("storageStatus").textContent="✕ Engine error: "+(e.message||e);
          console.error(e);
        });
        tickTimer=setInterval(function(){Promise.resolve(runTick()).catch(function(e){console.error(e)})},3000);
      }else{
        clearInterval(tickTimer);
        tickTimer=null;
        document.getElementById("storageStatus").textContent="■ Machine stopped";
      }
    }catch(e){console.error(e)}
  };
})();