/* App for PBR VITS — Optimized Layout & Auto-Save */
const UNI = "PBR VITS";
const SUPPORT_NUMBER = "7075881419"; 

let audioCtx;
function beep(freq=700, dur=0.08){ try{
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.type="sine"; o.frequency.value=freq;
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.16, audioCtx.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + dur);
}catch(e){}}

const BRANCHES = ["AIML","AI","CSE","ECE","EEE","MECH","CIVIL"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year"];

const EVENTS = {
  Technical: [
    { id:"hack",  name:"Hackathon",  emoji:"💻", price:300, tag: "🔥 Trending" },
    { id:"robo",  name:"Robo Race",  emoji:"🤖", price:250, tag: "Filling Fast" },
    { id:"quiz",  name:"Tech Quiz",  emoji:"❓", price:150, tag: "" }
  ],
  Cultural: [
    { id:"dance", name:"Group Dance", emoji:"💃", price:200, tag: "Popular" },
    { id:"sing",  name:"Solo Singing",emoji:"🎤", price:120, tag: "" },
    { id:"art",   name:"Art Jam",     emoji:"🎨", price:150, tag: "✨ New" }
  ]
};

function $(s, r=document){ return r.querySelector(s); }
function $all(s, r=document){ return Array.from(r.querySelectorAll(s)); }

function hydrate(){
  const bSel = $("#branch");
  BRANCHES.forEach(b => bSel.innerHTML += `<option value="${b}">${b}</option>`);
  
  const ySel = $("#year");
  YEARS.forEach(y => ySel.innerHTML += `<option value="${y}">${y}</option>`);

  const list = $("#eventList");
  for(const cat in EVENTS){
    const section = document.createElement("div");
    section.innerHTML = `<h3 style="margin: 15px 0 10px 0; color:var(--accent); font-size:1rem;">${cat}</h3>`;
    EVENTS[cat].forEach(ev => {
      const tagHtml = ev.tag ? `<span style="font-size:0.55rem; background:var(--accent); color:var(--bg); padding:2px 5px; border-radius:4px; margin-left:5px; font-weight:bold;">${ev.tag}</span>` : '';
      const div = document.createElement("div");
      div.className = "glass";
      // Fixed: Made card height smaller and more compact
      div.style = "padding:10px; margin-bottom:8px; display:flex; align-items:center; gap:10px; cursor:pointer; border:1px solid var(--border); border-radius:10px;";
      div.innerHTML = `
        <input type="checkbox" id="${ev.id}" value="${ev.id}" data-name="${ev.name}" data-price="${ev.price}" data-emoji="${ev.emoji}" style="width:18px; height:18px; cursor:pointer;" />
        <label for="${ev.id}" style="flex:1; cursor:pointer; font-size:0.9rem;">
          <strong>${ev.emoji} ${ev.name}</strong> ${tagHtml}
          <div style="font-size:0.75rem; color:var(--muted)">Registration: ₹${ev.price}</div>
        </label>
      `;
      div.onclick = (e) => { if(e.target.tagName!=='INPUT') { const ck=$("#"+ev.id); ck.checked=!ck.checked; updateCart(); beep(600,0.05); } };
      section.appendChild(div);
    });
    list.appendChild(section);
  }
  
  $all("#eventList input").forEach(i => i.addEventListener("change", () => { updateCart(); beep(600,0.05); }));

  // Persistence logic
  ['name', 'roll', 'branch', 'year', 'gender'].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    const saved = sessionStorage.getItem('draft_'+id);
    if(saved) el.value = saved;
    el.addEventListener('input', () => sessionStorage.setItem('draft_'+id, el.value));
  });
}

function getSelected(){
  const items = $all("#eventList input:checked").map(i => ({
    id: i.value, name: i.dataset.name, price: parseInt(i.dataset.price), emoji: i.dataset.emoji
  }));
  return { items, total: items.reduce((sum, i) => sum + i.price, 0) };
}

function updateCart(){
  const {items, total} = getSelected();
  $("#cartItems").innerHTML = items.length ? items.map(i => `<li>${i.emoji} ${i.name} — ₹${i.price}</li>`).join('') : "<li>None selected</li>";
  $("#cartTotal").textContent = "₹" + total;
  $("#proceedPay").disabled = items.length === 0;
}

function setStep(idx){
  $all("[data-step]").forEach(s => s.style.display = "none");
  $(`[data-step="${idx}"]`).style.display = "block";
  $all(".stepper .step").forEach((d, i) => d.classList.toggle("active", i <= idx));
  window.scrollTo({top:0, behavior:'smooth'});
}

async function showLoader(ms=600, emo="⏳"){
  const l = $("#loader");
  l.querySelector(".bubble").textContent = emo;
  l.classList.add("active");
  return new Promise(r => setTimeout(()=>{ l.classList.remove("active"); r(); }, ms));
}

function start(){
  hydrate(); setStep(0); updateCart();

  $("#next1").addEventListener("click", async ()=>{
    if(!$("#name").value.trim() || !$("#roll").value.trim()){ alert("Enter name and roll"); return; }
    beep(); await showLoader(500,"💜"); setStep(1);
  });

  $("#next2").addEventListener("click", async ()=>{
    if(!$("#branch").value){ alert("Select branch"); return; }
    beep(760,.07); await showLoader(500,"✨"); setStep(2);
  });

  $("#proceedPay").addEventListener("click", async ()=>{
    const {items, total} = getSelected();
    const payload = {
      name: $("#name").value.trim(), roll: $("#roll").value.trim(),
      gender: $("#gender").value, year: $("#year").value, branch: $("#branch").value,
      items, total, ts: new Date().toISOString()
    };
    localStorage.setItem("pendingPayment", JSON.stringify(payload));
    beep(900, 0.1); await showLoader(800, "💸");
    window.location.href = "payment.html";
  });
}
document.addEventListener("DOMContentLoaded", start);