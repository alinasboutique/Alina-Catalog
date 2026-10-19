const settings = { childShirtPrice: 10, adultShirtPrice: 13, rectangularTray: 70, roundTray: 80, childPhotoPrice: 5, shippingSet: 5.95, shippingWithShirts: 8.95, whatsapp: "447742444493" };

const demoModels = [
  {id:"f1",gender:"fata",name:"Model fetiță 01",image:""},
  {id:"f2",gender:"fata",name:"Model fetiță 02",image:""},
  {id:"f3",gender:"fata",name:"Model fetiță 03",image:""},
  {id:"b1",gender:"baiat",name:"Model băiat 01",image:""},
  {id:"b2",gender:"baiat",name:"Model băiat 02",image:""},
  {id:"b3",gender:"baiat",name:"Model băiat 03",image:""}
];

const categories = [
  {id:"mot",icon:"🎀",name:"Seturi pentru moț",description:"Fetiță și băiat — modele, tăvi și personalizare."},
  {id:"tricouri",icon:"👕",name:"Tricouri personalizate",description:"Tricouri tematice pentru copii și adulți."},
  {id:"ecusoane",icon:"🏅",name:"Ecusoane",description:"Ecusoane și accesorii personalizate."},
  {id:"toppers",icon:"🎂",name:"Cake Toppers",description:"Toppers pentru aniversări și evenimente."},
  {id:"nunta",icon:"💍",name:"Nuntă",description:"Papetărie și produse personalizate pentru nuntă."},
  {id:"botez",icon:"🕊️",name:"Botez",description:"Produse pentru botez și mărturii."},
  {id:"cadouri",icon:"🎁",name:"Cadouri personalizate",description:"Cadouri create special pentru fiecare ocazie."}
];

const categoryGrid=document.getElementById("category-grid");
if(categoryGrid) categoryGrid.innerHTML=categories.map(c=>`<a class="category-card" href="#${c.id}"><div class="category-icon">${c.icon}</div><div><h3>${c.name}</h3><p>${c.description}</p></div></a>`).join("");

let gender="fata", selected=null, invoice="nu", childPhoto="nu", shirts=[];
const $=id=>document.getElementById(id);
const money=n=>`£${Number(n).toFixed(2)}`;

function renderModels(){
  const list=demoModels.filter(m=>m.gender===gender);
  $("modelGrid").innerHTML=list.map(m=>`<article class="model-card ${selected?.id===m.id?"selected":""}" data-id="${m.id}"><div class="model-photo">${m.image?`<img src="${m.image}" alt="${m.name}">`:`<span>📷<br>Fotografia modelului<br>va fi adăugată din manager</span>`}</div><h3>${m.name}</h3><p>Selectează acest model</p></article>`).join("");
  document.querySelectorAll(".model-card").forEach(card=>card.onclick=()=>{selected=demoModels.find(m=>m.id===card.dataset.id);$("modelChoice").value=selected.name;renderModels();renderSummary();$("personalizare").scrollIntoView({behavior:"smooth"})});
}

document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{gender=btn.dataset.gender;document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderModels()});

document.querySelectorAll(".photo-choice-btn").forEach(btn=>btn.onclick=()=>{childPhoto=btn.dataset.photo;document.querySelectorAll(".photo-choice-btn").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderSummary()});

function shirtOptions(type){
  if(type==="copil") return ["Body 0–3 luni","Body 3–6 luni","Body 6–9 luni","Body 9–12 luni","Body 12–18 luni","Body 18–24 luni","Tricou 2 ani","Tricou 3 ani","Tricou 4 ani","Tricou 5 ani","Tricou 6 ani","Tricou 7 ani","Tricou 8 ani","Tricou 9 ani","Tricou 10 ani","Tricou 11 ani","Tricou 12 ani","Tricou 13 ani"];
  if(type==="dama") return ["Damă XS","Damă S","Damă M","Damă L","Damă XL","Damă XXL"];
  return ["Bărbat S","Bărbat M","Bărbat L","Bărbat XL","Bărbat XXL","Bărbat 3XL"];
}

function shirtRow(i){const s=shirts[i];return `<div class="shirt-row"><label>Categorie<select data-i="${i}" data-field="type"><option value="copil" ${s.type==="copil"?"selected":""}>👶 Copil</option><option value="dama" ${s.type==="dama"?"selected":""}>👩 Damă</option><option value="barbat" ${s.type==="barbat"?"selected":""}>👨 Bărbat</option></select></label><label>Mărime<select data-i="${i}" data-field="size">${shirtOptions(s.type).map(o=>`<option ${s.size===o?"selected":""}>${o}</option>`).join("")}</select></label><label>Pentru cine este?<input data-i="${i}" data-field="person" value="${s.person||""}" placeholder="Ex. Mama"></label><label>Cant.<input type="number" min="1" data-i="${i}" data-field="qty" value="${s.qty||1}"></label><button class="remove-shirt" data-remove="${i}" title="Șterge">×</button><label class="fullish">Mesaj personalizat (opțional)<input data-i="${i}" data-field="message" value="${s.message||""}" placeholder="Ex. Mama lui Sofia ❤️"></label></div>`}

function renderShirts(){ $("shirtRows").innerHTML=shirts.map((_,i)=>shirtRow(i)).join(""); document.querySelectorAll("[data-field]").forEach(el=>el.oninput=el.onchange=()=>{shirts[+el.dataset.i][el.dataset.field]=el.value;if(el.dataset.field==="type")shirts[+el.dataset.i].size=shirtOptions(el.value)[0];renderShirts();renderSummary()});document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{shirts.splice(+b.dataset.remove,1);renderShirts();renderSummary()}); }

$("showShirts").onclick=()=>{$("shirts").hidden=false;if(!shirts.length)shirts.push({type:"copil",size:"Body 0–3 luni",person:"",message:"",qty:1});renderShirts();renderSummary();$("shirts").scrollIntoView({behavior:"smooth"})};
$("addShirt").onclick=()=>{shirts.push({type:"copil",size:"Body 0–3 luni",person:"",message:"",qty:1});renderShirts()};

["modelChoice","tray","childName","childDate","trayMessage","deliveryName","phone","address","postcode","invoiceEmail"].forEach(id=>$(id).addEventListener("input",renderSummary));
document.querySelectorAll(".invoice-choice").forEach(b=>b.onclick=()=>{invoice=b.dataset.invoice;document.querySelectorAll(".invoice-choice").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("invoiceEmailWrap").hidden=invoice!=="da";renderSummary()});

function shirtTotal(){return shirts.reduce((sum,s)=>sum+(Number(s.qty)||0)*(s.type==="copil"?settings.childShirtPrice:settings.adultShirtPrice),0)}
function total(){const tray=Number($("tray").value||70);return tray+(childPhoto==="da"?settings.childPhotoPrice:0)+shirtTotal()+(shirts.length?settings.shippingWithShirts:settings.shippingSet)}
function renderSummary(){let tray=Number($("tray").value||70), html=`<div class="summary-block"><b>🎀 Set Moț</b><div class="summary-line"><span>${$("modelChoice").value||"Model nespecificat"}</span><strong>${money(tray)}</strong></div><div>Copil: ${$("childName").value||"—"} · Data: ${$("childDate").value||"—"}</div><div>Mesaj tavă: ${$("trayMessage").value||"—"}</div><div>Fotografie copil: ${childPhoto==="da"?"DA (+£5)":"NU"}</div></div>`;if(shirts.length){html+=`<div class="summary-block"><b>👕 Tricouri tematice</b>`+shirts.map(s=>`<div class="summary-line"><span>${s.qty} × ${s.size} — Pentru: ${s.person||"nespecificat"}${s.message?` — Mesaj: ${s.message}`:""}</span><strong>${money((s.type==="copil"?settings.childShirtPrice:settings.adultShirtPrice)*s.qty)}</strong></div>`).join("")+`</div>`}html+=`<div class="summary-line"><span>Livrare</span><strong>${money(shirts.length?settings.shippingWithShirts:settings.shippingSet)}</strong></div>`;$("summary").innerHTML=html;$("total").textContent=`Total: ${money(total())}`}

function validate(){const req=[["modelChoice","modelul"],["childName","numele copilului"],["deliveryName","numele pentru livrare"],["phone","telefonul"],["address","adresa"],["postcode","postcode-ul"]];for(const [id,label] of req)if(!$(id).value.trim()){alert(`Te rugăm să completezi ${label}.`);$(id).focus();return false}if(invoice==="da"&&!$("invoiceEmail").value.trim()){alert("Te rugăm să introduci emailul pentru factură.");$("invoiceEmail").focus();return false}for(const s of shirts)if(!s.person.trim()){alert("Completează pentru cine este fiecare tricou.");return false}return true}

$("whatsapp").onclick=()=>{if(!validate())return;let lines=["🛍️ COMANDĂ NOUĂ — ALINA'S HANDMADE BOUTIQUE","","🎀 SET PENTRU MOȚ",`Model: ${$("modelChoice").value}`,`Tavă: ${$("tray").value==70?"Dreptunghiulară":"Rotundă"} — ${money($("tray").value)}`,`Nume copil: ${$("childName").value}`,`Data: ${$("childDate").value||"—"}`,`Mesaj tavă: ${$("trayMessage").value||"—"}`,`Fotografie copil: ${childPhoto==="da"?"DA — +£5. Fotografia va fi trimisă după confirmarea comenzii, direct pe WhatsApp.":"NU"}`];if(shirts.length){lines.push("","👕 TRICOURI TEMATICE");shirts.forEach(s=>lines.push(`${s.qty} × ${s.size} — Pentru: ${s.person}`,`Mesaj: ${s.message||"—"}`))}lines.push("",`🚚 Livrare: ${money(shirts.length?settings.shippingWithShirts:settings.shippingSet)}`,`💷 TOTAL: ${money(total())}`,"","📦 DATE LIVRARE",`Nume: ${$("deliveryName").value}`,`Adresă: ${$("address").value}`,`Postcode: ${$("postcode").value}`,`Telefon: ${$("phone").value}`,"",`🧾 Factură: ${invoice==="da"?"DA":"NU"}`);if(invoice==="da")lines.push(`Email factură: ${$("invoiceEmail").value}`);window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank")};

const searchToggle=$("searchToggle"), searchPanel=$("searchPanel"), catalogSearch=$("catalogSearch");
searchToggle.onclick=()=>{searchPanel.hidden=!searchPanel.hidden;if(!searchPanel.hidden)catalogSearch.focus()};
catalogSearch.addEventListener("input",()=>{const q=catalogSearch.value.trim().toLowerCase();document.querySelectorAll(".model-card").forEach(card=>{card.hidden=!!q&&!card.textContent.toLowerCase().includes(q)});});
$("favoritesBtn").onclick=()=>alert("Zona de favorite va fi activată împreună cu managerul produselor.");
$("cartBtn").onclick=()=>$("cos").scrollIntoView({behavior:"smooth"});

renderModels();renderSummary();