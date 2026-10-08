/* Non-invasive engine bootstrap
   app.js owns toggleEngine(). This file never overwrites it. */
(function () {
  "use strict";

  window.__ENGINE_FIX_VERSION = "2026-10-08-c1";

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

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("engineBtn");
    if (!button) return;

    // Use the main toggleEngine() defined by app.js.
    button.onclick = function () {
      try {
        if (typeof window.toggleEngine !== "function") {
          throw new Error("toggleEngine is not loaded.");
        }
        window.toggleEngine();
      } catch (error) {
        console.error("Multipolar World Engine start error:", error);
        const status = document.getElementById("storageStatus");
        if (status) status.textContent = "✕ Engine error: " + (error.message || error);
        setUI(false);
      }
    };

    setUI(false);
  });
})();