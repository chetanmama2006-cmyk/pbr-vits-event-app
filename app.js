/* App for PBR VITS — PC Optimized */
const BRANCHES = ["AIML","AI","CSE","ECE","EEE","MECH","CIVIL"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year"];
const EVENTS = {
  Technical: [{id:"hack",name:"Hackathon",emoji:"💻",price:300},{id:"robo",name:"Robo Race",emoji:"🤖",price:250},{id:"quiz",name:"Tech Quiz",emoji:"❓",price:150}],
  Cultural: [{id:"dance",name:"Group Dance",emoji:"💃",price:200},{id:"sing",name:"Solo Singing",emoji:"🎤",price:120},{id:"art",name:"Art Jam",emoji:"🎨",price:150}]
};

function $(s){ return document.querySelector(s); }
function $all(s){ return Array.from(document.querySelectorAll(s)); }

function hydrate(){
  BRANCHES.forEach(b => $("#branch").innerHTML += `<option value="${b}">${b}</option>`);
  YEARS.forEach(y => $("#year").innerHTML += `<option value="${y}">${y}</option>`);

  for(const cat in EVENTS){
    const sec = document.createElement("div");
    sec.innerHTML = `<h3 style="margin:15px 0 10px 0; color:var(--accent); font-size:1rem;">${cat}</h3>`;
    EVENTS[cat].forEach(ev => {
      const card = document.createElement("div");
      card.className = "glass";
      card.style = "padding:12px; margin-bottom:8px; display:flex; align-items:center; gap:12px; cursor:pointer; border:1px solid var(--border); border-radius:12px;";
      card.innerHTML = `<input type="checkbox" id="${ev.id}" data-name="${ev.name}" data-price="${ev.price}" style="pointer-events:none; width:18px; height:18px;">
                        <div style="flex:1"><strong>${ev.emoji} ${ev.name}</strong><br><small style="color:var(--muted)">₹${ev.price}</small></div>`;
      card.onclick = () => {
        const ck = card.querySelector('input');
        ck.checked = !ck.checked;
        card.style.borderColor = ck.checked ? "var(--accent)" : "var(--border)";
        
        // Cart Glow Animation
        const cart = $("#cartSection");
        cart.classList.remove("cart-bump");
        void cart.offsetWidth;
        cart.classList.add("cart-bump");
        
        updateCart();
      };
      sec.appendChild(card);
    });
    $("#eventList").appendChild(sec);
  }
}

function updateCart(){
  const selected = $all("#eventList input:checked").map(i => ({name: i.dataset.name, price: parseInt(i.dataset.price)}));
  $("#cartItems").innerHTML = selected.length ? selected.map(s => `<li style="margin-bottom:5px;">✅ ${s.name}</li>`).join('') : "<li style='color:var(--muted)'>No events selected</li>";
  const total = selected.reduce((a,b) => a + b.price, 0);
  $("#cartTotal").textContent = "₹" + total;
  $("#proceedPay").disabled = selected.length === 0;
}

function setStep(idx){
  $all("[data-step]").forEach((s, i) => s.style.display = i == idx ? "block" : "none");
}

async function showLoader(){
  $("#loader").classList.add("active");
  await new Promise(r => setTimeout(r, 600));
  $("#loader").classList.remove("active");
}

window.onload = () => {
  hydrate();
  $("#next1").onclick = async () => { if($("#name").value && $("#roll").value) { await showLoader(); setStep(1); } else alert("Fill details"); };
  $("#next2").onclick = async () => { if($("#branch").value) { await showLoader(); setStep(2); } else alert("Select branch"); };
  $("#proceedPay").onclick = () => {
    const items = $all("#eventList input:checked").map(i => ({name: i.dataset.name, price: i.dataset.price}));
    localStorage.setItem("pendingPayment", JSON.stringify({
      name: $("#name").value, roll: $("#roll").value, branch: $("#branch").value,
      year: $("#year").value, total: $("#cartTotal").textContent.replace("₹",""), items
    }));
    window.location.href = "payment.html";
  };
};