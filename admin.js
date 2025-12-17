
const ADMIN_PASSWORD = "yashu@123";
const ADMIN_PASSWORD = "chetan@123";

function $(s, r=document){ return r.querySelector(s); }
function $all(s, r=document){ return Array.from(r.querySelectorAll(s)); }
function regs(){ return JSON.parse(localStorage.getItem("registrations")||"[]"); }
function setRegs(a){ localStorage.setItem("registrations", JSON.stringify(a)); }

const BRANCHES = ["AIML","AI","CSE","ECE","EEE","MECH","CIVIL"];

function toCSV(rows){
  const header = ["Reg ID","Name","Roll","Gender","Year","Branch","Events","Total","UTR","Date"];
  const lines = [header.join(",")].concat(rows.map(r=>[
    r.id, r.name, r.roll, r.gender, r.year, r.branch, (r.events||[]).join("|"), r.total, r.utr, new Date(r.ts).toLocaleString()
  ].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")));
  return lines.join("\n");
}

function render(){
  const tbody = $("#tab tbody"); tbody.innerHTML="";
  const q = $("#q").value.toLowerCase();
  const bf = $("#bf").value;
  const rows = regs().filter(r=>{
    const hit = [r.id,r.name,r.roll,r.gender,r.year,r.branch,(r.events||[]).join(" "),r.utr].join(" ").toLowerCase().includes(q);
    const branchOk = bf ? r.branch===bf : true;
    return hit && branchOk;
  });
  rows.forEach((r,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.roll}</td>
      <td>${r.gender}</td>
      <td>${r.year}</td>
      <td>${r.branch}</td>
      <td>${(r.events||[]).join(", ")}</td>
      <td>₹${r.total||0}</td>
      <td>${r.utr}</td>
      <td>${new Date(r.ts).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
  $("#count").textContent = `${rows.length} result(s)`;
}

function start(){
  BRANCHES.forEach(b=>{ const o=document.createElement("option"); o.value=b; o.textContent=b; $("#bf").appendChild(o); });
  $("#loginBtn").addEventListener("click", ()=>{
    if($("#pass").value===ADMIN_PASSWORD){ $("#login").style.display="none"; $("#panel").style.display="block"; render(); }
    else alert("Incorrect password");
  });
  $("#q").addEventListener("input", render);
  $("#bf").addEventListener("change", render);
  $("#print").addEventListener("click", ()=> window.print());
  $("#export").addEventListener("click", ()=>{
    const blob = new Blob([toCSV(regs())], {type:"text/csv"});
    const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="pbr-vits-registrations.csv"; a.click(); URL.revokeObjectURL(url);
  });
  $("#clear").addEventListener("click", ()=>{
    if(confirm("Clear ALL registrations?")){ setRegs([]); render(); }
  });
}
document.addEventListener("DOMContentLoaded", start);
