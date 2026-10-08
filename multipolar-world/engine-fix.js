/* Engine bridge: supports both classic-script global bindings and window globals. */
(function () {
  "use strict";
  window.__ENGINE_FIX_VERSION = "2026-10-08-d2";

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

    button.onclick = function () {
      try {
        // Do not rely only on window.*: classic scripts may expose a
        // global lexical binding that is callable directly.
        if (typeof toggleEngine === "function") {
          toggleEngine();
          return;
        }
        if (typeof window.toggleEngine === "function") {
          window.toggleEngine();
          return;
        }
        throw new Error("toggleEngine is not available in the page.");
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