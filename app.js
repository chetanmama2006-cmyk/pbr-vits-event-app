
/* App for PBR VITS flow with sound, loader, steps, cart, payment handoff */
const UNI = "PBR VITS";
const SUPPORT_NUMBER = "7075881419"; // WhatsApp & support
const BANK = { acc: "1234567890", holder: "tulluru chetan" };

// WebAudio blips
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
    { id:"hack",  name:"Hackathon",  emoji:"💻", price:300, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%236b43a8'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>💻</text></svg>" },
    { id:"robot", name:"Robo Race",  emoji:"🤖", price:250, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%237a4fc7'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>🤖</text></svg>" },
    { id:"quiz",  name:"Tech Quiz",  emoji:"🧠", price:150, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%238058d9'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>🧠</text></svg>" }
  ],
  Cultural: [
    { id:"dance", name:"Group Dance", emoji:"💃", price:200, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%23a05bff'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>💃</text></svg>" },
    { id:"music", name:"Solo Singing", emoji:"🎤", price:180, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%23b07bff'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>🎤</text></svg>" },
    { id:"art",   name:"Art Jam",    emoji:"🎨", price:120, img:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect rx='16' width='100%' height='100%' fill='%23c89cff'/><text x='50%' y='55%' text-anchor='middle' font-size='42' fill='white'>🎨</text></svg>" }
  ]
};

function $(s, r=document){ return r.querySelector(s); }
function $all(s, r=document){ return Array.from(r.querySelectorAll(s)); }

// Loader
function showLoader(ms=900, emoji="🎆"){
  const L = $("#loader");
  $(".bubble", L).textContent = emoji;
  L.classList.add("show");
  return new Promise(res=> setTimeout(()=>{ L.classList.remove("show"); res(); }, ms));
}

// Local Storage
function getRegs(){ return JSON.parse(localStorage.getItem("registrations")||"[]"); }
function setRegs(a){ localStorage.setItem("registrations", JSON.stringify(a)); }
function isDupUTR(utr){ return getRegs().some(r=> r.utr.toLowerCase()===utr.toLowerCase()); }

// Stepper
function setStep(i){
  $all(".step").forEach((el,idx)=> el.classList.toggle("active", idx===i));
  $all("[data-step]").forEach(sec=> sec.style.display = (parseInt(sec.dataset.step,10)===i?"block":"none"));
  window.scrollTo({top:0, behavior:"smooth"});
}

// Hydrate selects and events
function hydrate(){
  // Branches
  BRANCHES.forEach(b=>{ const o=document.createElement("option"); o.value=b; o.textContent=b; $("#branch").appendChild(o); });
  // Years
  YEARS.forEach(y=>{ const o=document.createElement("option"); o.value=y; o.textContent=y; $("#year").appendChild(o); });
  // Events
  for(const [cat,list] of Object.entries(EVENTS)){
    const wrap = document.createElement("div");
    wrap.className = "grid";
    wrap.innerHTML = `<h3>${cat} Events</h3>`;
    list.forEach(ev=>{
      const label = document.createElement("label");
      label.className = "pill glass";
      label.innerHTML = `
        <input type="checkbox" name="events" value="${ev.id}" style="width:auto; margin-top:8px;" />
        <img alt="${ev.name}" src="${ev.img}" />
        <div>
          <div><strong>${ev.emoji} ${ev.name}</strong> — <span class="price">₹${ev.price}</span></div>
          <div class="small">“Create. Compete. Celebrate.”</div>
        </div>
      `;
      wrap.appendChild(label);
      label.addEventListener("click", ()=>{ label.classList.toggle("active"); updateCart(); beep(800, .05); });
    });
    $("#eventList").appendChild(wrap);
  }
}

// Cart
function getSelected(){
  const ids = $all('input[name="events"]:checked').map(i=>i.value);
  const map = Object.fromEntries([...EVENTS.Technical, ...EVENTS.Cultural].map(e=>[e.id,e]));
  const items = ids.map(id=> map[id]);
  const total = items.reduce((s,e)=> s+e.price, 0);
  return {items,total};
}
function updateCart(){
  const {items,total} = getSelected();
  const list = items.map(i=> `<li>${i.emoji} ${i.name} — ₹${i.price}</li>`).join("");
  $("#cartItems").innerHTML = list || "<li>No events selected yet.</li>";
  $("#cartTotal").textContent = "₹"+total;
  $("#proceedPay").disabled = total<=0;
}

// Validation
function validateStep0(){
  const name = $("#name").value.trim();
  const roll = $("#roll").value.trim();
  const gender = $("#gender").value;
  const year = $("#year").value;
  if(name.length<2){ alert("Enter a valid name"); return false; }
  if(!/^[A-Za-z0-9\-\/]{4,}$/.test(roll)){ alert("Enter a valid roll number"); return false; }
  if(!gender){ alert("Please select gender"); return false; }
  if(!year){ alert("Please select year"); return false; }
  return true;
}
function validateStep1(){ return !!$("#branch").value || (alert("Select branch"), false); }
function validateStep2(){
  const {items} = getSelected();
  if(items.length===0){ alert("Select at least one event"); return false; }
  return true;
}

// Navigation
function start(){
  hydrate(); setStep(0); updateCart();
  $("#next1").addEventListener("click", async ()=>{
    if(!validateStep0()) return;
    beep(); await showLoader(900,"⏳"); setStep(1);
  });
  $("#next2").addEventListener("click", async ()=>{
    if(!validateStep1()) return;
    beep(760,.07); await showLoader(900,"🎉"); setStep(2);
  });
  $("#proceedPay").addEventListener("click", async ()=>{
    if(!validateStep2()) return;
    const {items,total} = getSelected();
    const payload = {
      name: $("#name").value.trim(),
      roll: $("#roll").value.trim(),
      gender: $("#gender").value,
      year: $("#year").value,
      branch: $("#branch").value,
      items, total, ts: new Date().toISOString()
    };
    localStorage.setItem("pendingPayment", JSON.stringify(payload));
    beep(820,.08);
    await showLoader(800,"💳");
    window.open("payment.html", "_blank"); // new window as requested
  });
}

document.addEventListener("DOMContentLoaded", start);
