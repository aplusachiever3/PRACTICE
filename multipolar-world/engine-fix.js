/* Robust engine bootstrap / click handler
   Fixes START MACHINE on GitHub Pages and keeps the simulation running
   even if IndexedDB is unavailable or a non-critical subsystem fails. */
(function () {
  "use strict";

  function setUI(running) {
    const state = document.getElementById("engineState");
    const dash = document.getElementById("dashEngine");
    const btn = document.getElementById("engineBtn");

    if (state) state.textContent = running ? "RUNNING" : "OFFLINE";
    if (dash) dash.textContent = running ? "RUNNING" : "OFFLINE";
    if (btn) {
      btn.textContent = running ? "STOP MACHINE ■" : "START MACHINE ▶";
      btn.disabled = false;
    }
  }

  async function safeTick() {
    try {
      if (typeof runTick !== "function") {
        throw new Error("Runtime engine is not loaded.");
      }
      await runTick();
    } catch (error) {
      console.error("Multipolar World Engine tick error:", error);
      const status = document.getElementById("storageStatus");
      if (status) status.textContent = "⚠ Tick warning: " + (error.message || error);
      // Do not stop the machine because local storage is non-critical.
    }
  }

  window.toggleEngine = function () {
    try {
      if (typeof machineRunning === "undefined") {
        throw new Error("Engine state is not initialized.");
      }

      machineRunning = !machineRunning;
      setUI(machineRunning);

      if (machineRunning) {
        const status = document.getElementById("storageStatus");
        if (status) status.textContent = "▶ Machine running…";

        // Run immediately, then every 3 seconds.
        safeTick();
        clearInterval(tickTimer);
        tickTimer = setInterval(safeTick, 3000);
      } else {
        clearInterval(tickTimer);
        tickTimer = null;
        const status = document.getElementById("storageStatus");
        if (status) status.textContent = "■ Machine stopped";
      }
    } catch (error) {
      console.error("Multipolar World Engine start error:", error);
      machineRunning = false;
      clearInterval(tickTimer);
      tickTimer = null;
      setUI(false);

      const status = document.getElementById("storageStatus");
      if (status) status.textContent = "✕ Engine error: " + (error.message || error);
    }
  };

  // Bind directly as a backup to the inline onclick.
  document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("engineBtn");
    if (!button) return;

    button.onclick = window.toggleEngine;
    setUI(false);
  });
})();