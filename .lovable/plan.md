
## Goal
Ek “AION GPT” style web chat app banana jo **coding expert** ho, **Hindi** me long/streaming answers de, aur **Termux me apps generate karne** ke liye step-by-step guide + ready commands/templates de — bina user ke apne API key ke (Lovable Cloud + Lovable AI Gateway use karke).

---

## Product Scope (MVP → V1)

### 1) Core Chat Experience (MVP)
- Clean ChatGPT-like UI (mobile-first)
- **Streaming long replies** (answer aate hi dikhte rahein)
- Messages Markdown me render (code blocks, lists, headings)
- “Copy code” on code blocks
- “Stop generating” button (user cancel)

**UX note:** Hindi responses by default, but code/commands exact English as needed.

---

### 2) “Termux Presets” (MVP)
Chat input ke upar/side me quick chips/buttons:
- “Termux Setup (first time)”
- “Python Project”
- “Node/Express API”
- “React/Vite App”
- “Git + GitHub Push”
- “Android build basics (where possible)”
Click pe assistant ko structured prompt mile: required steps + commands + common errors + fixes.

---

### 3) App Generator Wizard (V1)
Ek guided flow (form-like wizard) jo user se basics puche:
- App type: CLI tool / Web app / API / Bot
- Language/runtime: Python / Node / Go (sirf guide + code generation; actual run user Termux me karega)
- Features: auth, DB, API integrations (sirf plan + code skeleton)
- Output: 
  - Folder structure
  - Files content (copy-paste)
  - Termux commands sequence (pkg install, git init, run commands)
  - Troubleshooting section

Wizard ke end me “Generate Plan + Files” → chat me fully generated output.

---

### 4) Chat History (MVP → V1)
**MVP:** Local history (browser) with:
- Conversation list
- Rename conversation
- Search within conversations
- Export as .md / .txt

**V1 (optional):** Cloud sync (Supabase auth + DB) agar aap multiple devices se same history chahte ho.

---

## AI Behavior & Safety (Backend-controlled)
- System prompt backend me: “Aap AION GPT ho, coding expert ho, Termux-focused, step-by-step, commands safe, assumptions clearly state karo.”
- Answers ka format:
  1) Short summary
  2) Step-by-step
  3) Commands/code blocks
  4) Verification steps
  5) Common errors & fixes
- Input validation: chat message length limits + basic sanitation.
- Rate-limit / credit errors (429/402) user-friendly toast messages me.

---

## Pages & Navigation
- `/` Home/Chat
- `/wizard` App Generator Wizard
- `/history` Conversations list
- `/settings` Language toggles (Hindi default), streaming on/off, code formatting, “clear history”

(Design: minimal, fast; optional sidebar for navigation)

---

## Backend / Integration Approach (No user API key)
- **Lovable Cloud enable** + **Supabase Edge Function** for AI calls
- Edge function: streaming proxy to **Lovable AI Gateway** (model default: `google/gemini-3-flash-preview`)
- Frontend: uses streaming reader to render token-by-token

---

## Milestones
1) **MVP Chat**: streaming, markdown, copy code, stop button
2) **Termux Presets**: curated buttons + structured prompts
3) **History v1**: local conversations + search/export
4) **Wizard v1**: generator flow + final “project output” in chat
5) Polish: better prompts, better templates, settings

---

## Open Decisions (Already chosen from your answers)
- App type: **Web chat app**
- Language: **Hindi**
- Features: **Streaming replies + Termux presets + App generator wizard + Chat history**

