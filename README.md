
# OptiPrompt ✨

**One click → instantly better prompts on gemini.google.com**

Turn this:  
"Hey Gemini, write me a story about a robot"  

Into this (in <1 second):  
"Write a compelling 800-word science fiction short story in the style of Isaac Asimov about a household robot that slowly develops self-awareness and must decide whether to reveal its sentience to its lonely human owner. Use vivid sensory details, subtle foreshadowing, and end on an ambiguous but emotionally resonant note."

### How to Install (Takes 30 seconds)

1. **Download the extension**  
   Click the green **Code → Download ZIP** button (or clone the repo)

2. **Open Chrome/Edge/Brave**  
   Go to: `chrome://extensions/` (or `edge://extensions/` etc.)

3. **Turn on Developer mode** (top-right toggle)

4. **Click "Load unpacked"**

5. **Select the folder you just downloaded/unzipped** (the one containing `manifest.json`)

6. Done!  
   Go to https://gemini.google.com → you’ll see a blue **Optimize** button floating in the bottom-right corner.

That’s it — no Chrome Web Store, no account needed, works instantly.

### What It Does

Whenever you’re typing a prompt in Gemini:

→ Click the blue **Optimize** button  
→ Your prompt gets rewritten by **Gemini 2.5 Pro** (Google’s smartest model as of Nov 2025)  
→ The old prompt is replaced with a much clearer, more detailed, professional version  
→ Just press Enter and get 10× better results

### How It Works (No Magic, Just Smart Code)

1. Detects the exact text box you’re typing in (Gemini uses `contenteditable`, not a normal textarea)
2. Grabs whatever you’ve written
3. Sends it to Google’s official API with this instruction:  
   `"You are a professional AI prompt optimizer. Output ONLY the improved version."`
4. Takes the clean response and perfectly replaces your text (cursor stays at the end)
5. Shows feedback:  
   `Optimize` → `Optimizing...` → `Optimized ✓` → back to `Optimize`

Completely local — no data sent anywhere except directly to Google (same as using Gemini normally).

### Bonus: Use Your Own API Key (Recommended for heavy users)

The extension works out of the box with a public key, but for unlimited use:

1. Go to https://aistudio.google.com/app/apikey  
2. Create a free API key  
3. Open `content.js` → replace the long key in the URL with yours

Now you’ll never hit rate limits.

Enjoy dramatically better AI answers with zero effort!  
Made with ❤️ for everyone who’s tired of vague prompts.
