
(function () {
  'use strict';

  let isOptimizing = false;

  function findInput() {
    const els = document.querySelectorAll('div[contenteditable="true"], textarea');
    for (const el of els) if (el.offsetParent !== null) return el;
    return null;
  }

  function getPrompt() {
    const el = findInput();
    return el ? (el.innerText || el.textContent || "").trim() : "";
  }

  function setPrompt(text) {
    const el = findInput();
    if (!el) return false;

    el.focus();
    el.innerHTML = "";
    const node = document.createTextNode(text);
    el.appendChild(node);

    const sel = window.getSelection();
    sel.removeAllRanges();
    const range = document.createRange();
    range.setStart(node, text.length);
    range.collapse(true);
    sel.addRange(range);

    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    return true;
  }

  async function optimizePrompt() {
    if (isOptimizing) return;
    const original = getPrompt();
    if (!original) return;

    isOptimizing = true;
    updateFloating("Optimizing...");

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text:
                "You are a professional AI prompt optimizer. " +
                "Output ONLY the improved version.\n\nUser Prompt:\n" +
                original
            }
          ]
        }
      ]
    };

    const response = await fetch(
      // **FIXED:** Changed 'gemini-1.5-pro' to 'gemini-2.5-pro' for the latest available Pro model
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyDyvIQiuF1FB2DmNuyRua907FU07wEbu4A",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      updateFloating("API ERROR " + response.status);
      isOptimizing = false;
      return;
    }

    const data = await response.json();
    const optimized =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (optimized) {
      setPrompt(optimized);
      updateFloating("Optimized ✓");
      setTimeout(() => updateFloating("Optimize"), 1500);
    } else {
      updateFloating("No output");
    }

    isOptimizing = false;
  }

  function createFloatingButton() {
    const btn = document.createElement("button");
    btn.id = "gpo-float-btn";
    btn.innerText = "Optimize";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "999999999";
    btn.style.background = "#4b6cff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "14px 18px";
    btn.style.borderRadius = "12px";
    btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
    btn.style.fontSize = "14px";
    btn.style.cursor = "pointer";
    btn.onclick = optimizePrompt;
    document.body.appendChild(btn);
  }

  function updateFloating(text) {
    const btn = document.getElementById("gpo-float-btn");
    if (btn) btn.innerText = text;
  }

  function init() {
    createFloatingButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
