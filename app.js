/* App for PBR VITS — Fully Optimized */
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
    section.innerHTML = `<h3 style="margin: 15px 0 8px 0; color:var(--accent); font-size:1rem; border-left:3px solid var(--accent); padding-left:10px;">${cat}</h3>`;
    
    EVENTS[cat].forEach(ev => {
      const tagHtml = ev.tag ? `<span style="font-size:0.55rem; background:var(--accent); color:var(--bg); padding:2px 5px; border-radius:4px; margin-left:8px; font-weight:bold;">${ev.tag}</span>` : '';
      
      const card = document.createElement("div");
      card.className = "glass";
      // Layout Fix: Compact and Flex-row
      card.style = "padding:10px; margin-bottom:8px; display:flex; align-items:center; gap:12px; cursor:pointer; border:1px solid var(--border); border-radius:12px; transition:0.2s;";
      
      card.innerHTML = `
        <input type="checkbox" id="${ev.id}" value="${ev.id}" data-name="${ev.name}" data-price="${ev.price}" data-emoji="${ev.emoji}" style="width:18px; height:18px; pointer-events:none;" />
        <div style="flex:1;">
          <div style="display:flex; align-items:center;">
            <strong style="font-size:0.9rem;">${ev.emoji} ${ev.name}</strong> 
            ${tagHtml}
          </div>
          <div style="font-size:0.75rem; color:var(--muted)">Price: ₹${ev.price}</div>
        </div>
      `;

      // FIX: CLICK ANYWHERE ON CARD
      card.onclick = () => {
        const checkbox = card.querySelector('input');
        checkbox.checked = !checkbox.checked;
        card.style.borderColor = checkbox.checked ? "var(--accent)" : "var(--border)";
        card.style.background = checkbox.checked ? "rgba(176,123,255,0.08)" : "var(--glass)";
        updateCart();
        beep(600, 0.05);
      };

      section.appendChild(card);
    });
    list.appendChild(section);
  }
  
  ['name', 'roll', 'branch', 'year', 'gender'].forEach(id => {
    const el = document.getElementById(id);
    if(el && sessionStorage.getItem('draft_'+id)) el.value = sessionStorage.getItem('draft_'+id);
    if(el) el.addEventListener('input', () => sessionStorage.setItem('draft_'+id, el.value));
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
  $("#cartItems").innerHTML = items.length ? items.map(i => `<li style="font-size:0.85rem; margin-bottom:4px;">${i.emoji} ${i.name}</li>`).join('') : "<li>No items</li>";
  $("#cartTotal").textContent = "₹" + total;
  $("#proceedPay").disabled = items.length === 0;
}

function setStep(idx){
  $all("[data-step]").forEach(s => s.style.display = "none");
  $(`[data-step="${idx}"]`).style.display = "block";
  $all(".stepper .step").forEach((d, i) => d.classList.toggle("active", i <= idx));
  window.scrollTo({top:0, behavior:'smooth'});
}

async function showLoader(ms=500, emo="⏳"){
  const l = $("#loader");
  l.querySelector(".bubble").textContent = emo;
  l.classList.add("active");
  return new Promise(r => setTimeout(()=>{ l.classList.remove("active"); r(); }, ms));
}

function start(){
  hydrate(); setStep(0); updateCart();
  $("#next1").onclick = async () => { if($("#name").value && $("#roll").value){ beep(); await showLoader(); setStep(1); } else alert("Fill details"); };
  $("#next2").onclick = async () => { if($("#branch").value){ beep(); await showLoader(); setStep(2); } else alert("Select branch"); };
  $("#proceedPay").onclick = async () => {
    const {items, total} = getSelected();
    localStorage.setItem("pendingPayment", JSON.stringify({
      name: $("#name").value, roll: $("#roll").value, branch: $("#branch").value,
      year: $("#year").value, gender: $("#gender").value, items, total
    }));
    beep(); await showLoader(800, "💸"); window.location.href = "payment.html";
  };
}
document.addEventListener("DOMContentLoaded", start);