const BRANCHES = ["AIML","AI","CSE","ECE","EEE","MECH","CIVIL"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year"];
const EVENTS = {
  Technical: [{id:"hack",name:"Hackathon",emoji:"💻",price:300},{id:"robo",name:"Robo Race",emoji:"🤖",price:250}],
  Cultural: [{id:"dance",name:"Group Dance",emoji:"💃",price:200},{id:"sing",name:"Solo Singing",emoji:"🎤",price:120}]
};

function $(s){ return document.querySelector(s); }

function hydrate(){
  BRANCHES.forEach(b => $("#branch").innerHTML += `<option value="${b}">${b}</option>`);
  YEARS.forEach(y => $("#year").innerHTML += `<option value="${y}">${y}</option>`);

  for(const cat in EVENTS){
    const h = document.createElement("h4");
    h.textContent = cat; h.style.color = "var(--accent)";
    $("#eventList").appendChild(h);

    EVENTS[cat].forEach(ev => {
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <div style="font-size:1.5rem">${ev.emoji}</div>
        <div style="flex:1"><strong>${ev.name}</strong><br><small style="color:var(--muted)">₹${ev.price}</small></div>
        <input type="checkbox" id="ck-${ev.id}" style="width:20px; height:20px; accent-color:var(--accent);">
      `;
      row.onclick = () => {
        const ck = row.querySelector('input');
        ck.checked = !ck.checked;
        row.classList.toggle('selected', ck.checked);
        
        // POP ANIMATION
        $("#cart").classList.remove("cart-bump");
        void $("#cart").offsetWidth;
        $("#cart").classList.add("cart-bump");
        
        updateCart();
      };
      $("#eventList").appendChild(row);
    });
  }
}

function updateCart(){
  const checked = Array.from(document.querySelectorAll('#eventList input:checked'));
  const total = checked.reduce((sum, input) => {
    const id = input.id.replace('ck-','');
    const ev = Object.values(EVENTS).flat().find(e => e.id === id);
    return sum + ev.price;
  }, 0);

  $("#cartItems").innerHTML = checked.length ? 
    checked.map(c => `• ${Object.values(EVENTS).flat().find(e=>e.id===c.id.replace('ck-','')).name}`).join('<br>') : 
    "No events selected yet...";
    
  $("#cartTotal").textContent = "₹" + total;
  $("#proceedPay").disabled = checked.length === 0;
}

function setStep(idx){
  document.querySelectorAll('[data-step]').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

window.onload = () => {
  hydrate();
  $("#next1").onclick = () => { if($("#name").value && $("#roll").value) setStep(1); else alert("Please enter name and roll"); };
  $("#next2").onclick = () => { if($("#branch").value) setStep(2); else alert("Please select branch"); };
  $("#proceedPay").onclick = () => {
    const total = $("#cartTotal").textContent.replace("₹","");
    localStorage.setItem("pendingPayment", JSON.stringify({
      name: $("#name").value, roll: $("#roll").value, branch: $("#branch").value, total
    }));
    window.location.href = "payment.html";
  };
};