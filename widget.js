(function(){
  // Settings defaults
  const defaults = {
    title: "Akademie Asistent",
    avatar: "🧑‍🎓",
    avatarImg: null,
    chatBG: "linear-gradient(120deg,#2977ff 0%,#0b234a 100%)",
    headBG: "linear-gradient(90deg,#2977ff 0,#0b234a 100%)"
  };
  function getSettings() {
    return window.ChatbotConfig || defaults;
  }
  function applySettings(s) {
    document.documentElement.style.setProperty("--chat-bg", s.chatBG||defaults.chatBG);
    document.documentElement.style.setProperty("--head-bg", s.headBG||defaults.headBG);
  }
  const settings = getSettings();
  applySettings(settings);

  // ---- CSS injection ----
  const css = `
    :root {
      --chat-bg: linear-gradient(120deg,#2977ff 0%,#0b234a 100%);
      --head-bg: linear-gradient(90deg,#2977ff 0,#0b234a 100%);
    }
    #widget-bubble {
      position: fixed; right: 32px; bottom: 32px; z-index: 9999;
      width: 62px; height: 62px; background: #296bff;
      color: #fff; font-size: 2.3rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 18px #1c2949aa; cursor: pointer;
      transition: background .18s;
      animation: bounceIn 0.6s cubic-bezier(.5,1.6,.47,1.02);
    }
    #widget-bubble:hover { background: #1644a0; }
    @keyframes bounceIn { 0%{transform:scale(.7);opacity:0;} 80%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
    #widget-chat {
      position: fixed; right: 32px; bottom: 108px; z-index: 9999;
      width: 385px; max-width: 97vw; height: 520px; background: var(--chat-bg,#f7f9fb);
      border-radius: 22px; box-shadow: 0 12px 44px #0004, 0 1.5px 0px #c5d2f3;
      display: flex; flex-direction: column; opacity: 0; pointer-events: none;
      transform: translateY(30px) scale(.97); transition: opacity .32s,transform .23s;
      border: 1.6px solid #c5d2f3;
    }
    #widget-chat.open { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); animation: fadeIn .29s cubic-bezier(.7,1.6,.67,1.01);}
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .w-head {
      height: 60px; background: var(--head-bg,#296bff); color: #fff;
      border-radius: 22px 22px 0 0; display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; font-weight: 500; font-size: 1.08rem; letter-spacing: 0.01em;
      box-shadow: 0 2px 9px #18368a0f;
    }
    .w-logo {
      width: 36px; height: 36px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; margin-right: 8px;
      box-shadow: 0 2px 10px #18368a0c; background: #fff4;
      overflow:hidden; font-size:1.13rem;
    }
    .w-logo img { width:36px;height:36px;border-radius:50%;display:block;}
    .w-close { cursor: pointer; font-size: 2.1rem; font-weight: 300; opacity:.7; }
    .w-close:hover { opacity:1; }
    .w-msgs { flex: 1; overflow-y: auto; padding: 17px 13px 11px 13px; display: flex; flex-direction: column; gap: 14px; scroll-behavior:smooth;}
    .w-row { display:flex; align-items:flex-end; gap:9px; }
    .w-bot, .w-user { padding: 11px 18px; font-size: 1.05rem; line-height: 1.55; border-radius: 18px;
      box-shadow: 0 2.5px 18px #18368a15; word-break: break-word; white-space: pre-line;
      max-width: 74vw; min-width: 32px; animation: slidein .20s cubic-bezier(.39,1.4,.71,.96);}
    @keyframes slidein { from { transform: translateY(20px) scale(.95); opacity:0; } to { transform: translateY(0) scale(1); opacity:1; } }
    .w-bot { margin-right: auto; background: #f0f4ff; color: #1c2742; border-radius: 18px 18px 18px 7px; border:1.3px solid #c5d2f3;}
    .w-user { margin-left: auto; background: #296bff; color: #fff; border-radius: 18px 18px 7px 18px; border:1.5px solid #296bff; font-weight:500;}
    .w-avatar-bot { background: #e3ecff;}
    .w-avatar {
      width: 37px; height: 37px; min-width: 37px; min-height: 37px; max-width: 37px; max-height: 37px;
      border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 7px #18368a13; font-size: 1.38rem; font-weight: 600;
      border: 1.1px solid #c5d2f3; overflow: hidden; flex-shrink: 0;
    }
    .w-avatar-bot { background: #e3ecff; }
    .w-avatar-user { background: #296bff; color: #fff; }
    .w-avatar img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;
    }
    .w-inpbox { padding:13px 15px 15px 15px; background: #f7f9fb; border-radius: 0 0 22px 22px; display:flex;gap:10px;border-top:1.5px solid #c5d2f3;}
    #w-input { flex:1; min-height:34px; max-height:80px; border-radius:10px; border:1.2px solid #c5d2f3; padding:8px 11px; font-size:1rem; outline:none; resize: none; background:#fff; transition: border .2s;}
    #w-send { background: #296bff; color: #fff; border:none; border-radius:10px; font-weight:600; padding:7px 17px; cursor:pointer; font-size:1.1rem; box-shadow:0 1px 8px #296bff15;transition:background .2s;}
    #w-send:disabled { opacity:.55; }
    #w-send:hover { background:#1644a0;}
    @media (max-width:700px){#widget-chat{width:99vw;right:0;}}
    @media (max-width:440px){#widget-chat{height:99vh;bottom:0;border-radius:0;}}
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  // --- DOM
  const bubble = document.createElement('div');
  bubble.id = "widget-bubble";
  bubble.innerHTML = "💬";
  const chat = document.createElement('div');
  chat.id = "widget-chat";
  chat.innerHTML = `
    <div class="w-head" id="w-head">
      <div style="display:flex;align-items:center;">
        <div class="w-logo" id="logo-avatar"></div>
        <span id="chat-title"></span>
      </div>
      <span class="w-close" title="Zavřít">&times;</span>
    </div>
    <div class="w-msgs" id="w-msgs"></div>
    <div class="w-inpbox">
      <textarea id="w-input" rows="1" placeholder="Napiš zprávu..."></textarea>
      <button id="w-send">➤</button>
    </div>
  `;
  document.body.appendChild(bubble);
  document.body.appendChild(chat);

  // Show/hide
  bubble.onclick = ()=>{ chat.classList.add("open"); setTimeout(()=>input.focus(),180);}
  chat.querySelector('.w-close').onclick = ()=>chat.classList.remove("open");

  // Avatar/název
  function updateHeader() {
    const s = getSettings();
    applySettings(s);
    const logo = document.getElementById("logo-avatar");
    logo.innerHTML = s.avatarImg ? `<img src="${s.avatarImg}">` : (s.avatar||defaults.avatar);
    document.getElementById("chat-title").innerText = s.title||defaults.title;
  }
  updateHeader();

  // Messages
  const msgsDiv = document.getElementById("w-msgs");
  const input = document.getElementById("w-input");
  const sendBtn = document.getElementById("w-send");
  // Historie (localStorage)
  function saveHist(hist){localStorage.setItem("widget-history",JSON.stringify(hist));}
  function loadHist(){try{return JSON.parse(localStorage.getItem("widget-history"))|| [];}catch{return []}}
  let history = loadHist();
  function renderMsg(role, text) {
    const row = document.createElement("div");
    row.className = "w-row";
    // Avatar
    const avatar = document.createElement("div");
    avatar.className = "w-avatar " + (role === "user" ? "w-avatar-user" : "w-avatar-bot");
    if (role === "user") {
      avatar.innerText = "👤";
    } else {
      const s = getSettings();
      if (s.avatarImg) {
        avatar.innerHTML = `<img src="${s.avatarImg}">`;
      } else {
        avatar.innerText = s.avatar || defaults.avatar;
      }
    }
    // Bubble
    const bubble = document.createElement("div");
    bubble.className = role === "user" ? "w-user" : "w-bot";
    bubble.innerText = text;
    // Left/Right alignment
    if (role === "user") {
      row.appendChild(bubble); row.appendChild(avatar);
    } else {
      row.appendChild(avatar); row.appendChild(bubble);
    }
    msgsDiv.appendChild(row);
    setTimeout(()=>{msgsDiv.scrollTop=msgsDiv.scrollHeight;},18);
  }

  function renderHist() {
    msgsDiv.innerHTML = "";
    history.forEach(m => renderMsg(m.role, m.text));
    setTimeout(()=>{msgsDiv.scrollTop=msgsDiv.scrollHeight;},18);
  }
  renderHist();
  // Odesílání zprávy (Enter)
  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    renderMsg("user", msg); history.push({role:"user",text:msg}); saveHist(history);
    input.value = ""; input.focus();
    sendBtn.disabled = true; sendBtn.innerText = "…";
    try {
      const res = await fetch(" https://d90afe85778d.ngrok-free.app", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({question: msg})
      });
      const data = await res.json();
      renderMsg("bot", data.answer || "Omlouvám se, došlo k chybě.");
      history.push({role:"bot",text:data.answer||"Omlouvám se, došlo k chybě."}); saveHist(history);
    } catch {
      renderMsg("bot", "⚠️ Chyba při připojení k serveru.");
      history.push({role:"bot",text:"⚠️ Chyba při připojení k serveru."}); saveHist(history);
    }
    sendBtn.disabled = false; sendBtn.innerText = "➤";
  }
  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", function(e){
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault();
      sendMessage();
    }
  });

  // Změna nastavení
  window.addEventListener("storage", ()=>{
    updateHeader();
    document.getElementById("widget-chat").style.background = getSettings().chatBG || defaults.chatBG;
    document.getElementById("w-head").style.background = getSettings().headBG || defaults.headBG;
  });
  // Při načtení uprav vzhled
  document.getElementById("widget-chat").style.background = settings.chatBG || defaults.chatBG;
  document.getElementById("w-head").style.background = settings.headBG || defaults.headBG;
})();
