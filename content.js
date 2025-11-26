(function () {
  'use strict';

  let isOptimizing = false;

  // ============== ROBUST INPUT FINDING ==============
  function findInput() {
    // Priority selectors for different platforms
    const selectors = [
      // ChatGPT
      '#prompt-textarea',
      'textarea[data-id="root"]',
      // Claude
      'div[contenteditable="true"][data-placeholder*="Reply"]',
      'div[contenteditable="true"].ProseMirror',
      // Gemini
      'div.ql-editor[contenteditable="true"]',
      'rich-textarea div[contenteditable="true"]',
      // Grok
      'div[data-testid="tweetTextarea_0"]',
      // DeepSeek & generic
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="prompt"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      for (const el of els) {
        if (el.offsetParent !== null && !el.disabled && !el.readOnly) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return el;
          }
        }
      }
    }
    return null;
  }

  function getPrompt() {
    const el = findInput();
    if (!el) return "";
    
    if (el.tagName === 'TEXTAREA') {
      return el.value.trim();
    }
    return (el.innerText || el.textContent || "").trim();
  }

  function setPrompt(text) {
    const el = findInput();
    if (!el) return false;

    el.focus();

    if (el.tagName === 'TEXTAREA') {
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
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
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return true;
  }

  // ============== META-PROMPT BUILDER ==============
  function buildMetaPrompt(originalPrompt, isVariation = false) {
    if (isVariation) {
      return `You are a Master Prompt Engineer. Generate 3 distinct optimized variations of this prompt.

REQUIREMENTS:
- Use advanced techniques: Chain-of-Thought, Role-Prompting, Few-Shot examples
- Each variation should take a different strategic approach
- Maintain the core intent
- Output ONLY the 3 variations separated by "---VARIATION---"

FORMAT:
[Optimized Variation 1]
---VARIATION---
[Optimized Variation 2]
---VARIATION---
[Optimized Variation 3]

USER PROMPT:
${originalPrompt}`;
    }

    return `You are a Master Prompt Engineer specializing in AI prompt optimization.

TASK: Transform this prompt using advanced techniques:
1. Role-Prompting: Assign expert persona
2. Chain-of-Thought: Add step-by-step reasoning
3. Context Enrichment: Add constraints and format specs
4. Clarity: Remove ambiguity, add specificity
5. Structure: Use clear sections if needed

Output ONLY the improved version (no explanations).

USER PROMPT:
${originalPrompt}`;
  }

  // ============== OPTIMIZE (SINGLE) ==============
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
              text: buildMetaPrompt(original, false)
            }
          ]
        }
      ]
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyClKbaFm3lUTrRFazHrY7VicKUE__zoyV0",
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
    const optimized = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (optimized) {
      setPrompt(optimized);
      updateFloating("Optimized ✓");
      setTimeout(() => updateFloating("Optimize"), 1500);
    } else {
      updateFloating("No output");
    }

    isOptimizing = false;
  }

  // ============== GENERATE VARIATIONS ==============
  async function generateVariations() {
    if (isOptimizing) return;
    const original = getPrompt();
    if (!original) return;

    isOptimizing = true;
    updateFloating("Generating...");
    updateVariationsBtn("Generating...");

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: buildMetaPrompt(original, true)
            }
          ]
        }
      ]
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyClKbaFm3lUTrRFazHrY7VicKUE__zoyV0",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      updateFloating("API ERROR " + response.status);
      updateVariationsBtn("Variations");
      isOptimizing = false;
      return;
    }

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (result) {
      showVariationsModal(result, original);
      updateFloating("Optimize");
      updateVariationsBtn("Variations");
    } else {
      updateFloating("No output");
      updateVariationsBtn("Variations");
    }

    isOptimizing = false;
  }

  // ============== VARIATIONS MODAL ==============
  function showVariationsModal(variationsText, originalPrompt) {
    const existingModal = document.getElementById("gpo-modal");
    if (existingModal) existingModal.remove();

    const variations = variationsText.split("---VARIATION---").map(v => v.trim()).filter(v => v);

    const modal = document.createElement("div");
    modal.id = "gpo-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      z-index: 999999998;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    const content = document.createElement("div");
    content.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;

    let html = `
      <h2 style="margin: 0 0 16px 0; color: #333; font-size: 20px;">Choose a Variation</h2>
      <div style="margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
        <strong style="color: #666; font-size: 13px;">Original:</strong>
        <p style="margin: 8px 0 0 0; color: #333; font-size: 14px;">${originalPrompt}</p>
      </div>
    `;

    variations.forEach((variation, idx) => {
      html += `
        <div style="margin-bottom: 12px; padding: 16px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: white;" 
             class="gpo-variation" data-variation="${idx}">
          <strong style="color: #4b6cff; font-size: 14px;">Variation ${idx + 1}:</strong>
          <p style="margin: 8px 0 0 0; color: #333; font-size: 14px; line-height: 1.5;">${variation}</p>
        </div>
      `;
    });

    html += `
      <button id="gpo-close-modal" style="
        width: 100%;
        padding: 12px;
        background: #666;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
        font-weight: 600;
      ">Close</button>
    `;

    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById("gpo-close-modal").onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    document.querySelectorAll(".gpo-variation").forEach((el) => {
      el.onmouseover = () => { 
        el.style.borderColor = "#4b6cff"; 
        el.style.background = "#f8f9ff"; 
      };
      el.onmouseout = () => { 
        el.style.borderColor = "#e0e0e0"; 
        el.style.background = "white"; 
      };
      el.onclick = () => {
        const idx = parseInt(el.dataset.variation);
        setPrompt(variations[idx]);
        modal.remove();
      };
    });
  }

  // ============== UI CREATION ==============
  function createFloatingButton() {
    const btn = document.createElement("button");
    btn.id = "gpo-float-btn";
    btn.innerText = "Optimize";
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999999;
      background: #000000;
      color: white;
      border: none;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    btn.onmouseover = () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    };
    btn.onmouseout = () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
    };
    btn.onclick = optimizePrompt;
    document.body.appendChild(btn);
  }

  function createVariationsButton() {
    const btn = document.createElement("button");
    btn.id = "gpo-variations-btn";
    btn.innerText = "Variations";
    btn.style.cssText = `
      position: fixed;
      bottom: 70px;
      right: 20px;
      z-index: 999999999;
      background: #000000;
      color: white;
      border: none;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    btn.onmouseover = () => {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    };
    btn.onmouseout = () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
    };
    btn.onclick = generateVariations;
    document.body.appendChild(btn);
  }

  function updateFloating(text) {
    const btn = document.getElementById("gpo-float-btn");
    if (btn) btn.innerText = text;
  }

  function updateVariationsBtn(text) {
    const btn = document.getElementById("gpo-variations-btn");
    if (btn) btn.innerText = text;
  }

  // ============== PERSISTENT UI ==============
  function createUI() {
    if (!document.getElementById("gpo-float-btn")) {
      createFloatingButton();
    }
    if (!document.getElementById("gpo-variations-btn")) {
      createVariationsButton();
    }
  }

  function setupPersistentUI() {
    createUI();

    const observer = new MutationObserver(() => {
      createUI();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ============== INITIALIZATION ==============
  function init() {
    setupPersistentUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
