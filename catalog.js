const settings = { childShirtPrice: 10, adultShirtPrice: 13, rectangularTray: 70, roundTray: 80, childPhotoPrice: 5, shippingSet: 5.95, shippingWithShirts: 8.95, whatsapp: "447742444493" };

const categoryStyle=document.createElement("style");
categoryStyle.textContent=`
.category-section{padding-top:34px!important;padding-bottom:54px!important}
.category-section .section-heading{display:block!important;margin-bottom:24px!important}
.category-section .section-heading .eyebrow{color:#7b3f4b}
.category-section .section-heading h2{font-size:31px!important;margin-bottom:6px!important}
.category-section .section-heading>p:last-child{font-size:13px}
.category-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:20px!important}
.category-card{padding:0!important;min-height:0!important;display:block!important;overflow:hidden;background:#fff!important;border:1px solid #eadbd5!important;border-radius:18px!important;box-shadow:0 8px 25px rgba(105,61,67,.07)!important;transform:none!important;text-align:left!important}
.category-card:hover{border-color:#d99ba7!important;box-shadow:0 14px 34px rgba(105,61,67,.13)!important;transform:translateY(-4px)!important}
.category-card:first-child{border-color:#eadbd5!important;box-shadow:0 8px 25px rgba(105,61,67,.07)!important;transform:none!important}
.category-card:first-child:hover{border-color:#d99ba7!important;box-shadow:0 14px 34px rgba(105,61,67,.13)!important;transform:translateY(-4px)!important}
.category-visual{height:205px;position:relative;overflow:hidden;background:linear-gradient(135deg,#f7e5df 0%,#fff8f4 48%,#ead5c8 100%);display:flex;align-items:center;justify-content:center}
.category-visual::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(255,255,255,.85),transparent 22%),radial-gradient(circle at 84% 25%,rgba(201,130,145,.18),transparent 27%),radial-gradient(circle at 62% 92%,rgba(220,199,175,.42),transparent 32%)}
.category-art-main{position:relative;z-index:2;width:112px;height:112px;border-radius:16px;background:rgba(255,255,255,.88);border:1px solid rgba(216,194,180,.8);box-shadow:0 10px 24px rgba(95,55,60,.12);display:grid;place-items:center;font-size:58px;transform:rotate(-2deg)}
.category-art-mini{position:absolute;z-index:1;width:78px;height:96px;border-radius:11px;background:linear-gradient(145deg,#fff,#f3dfd8);border:1px solid rgba(216,194,180,.75);box-shadow:0 7px 17px rgba(95,55,60,.10)}
.category-art-mini::after{content:"";position:absolute;left:13px;right:13px;top:14px;height:5px;border-radius:4px;background:rgba(123,63,75,.13);box-shadow:0 12px 0 rgba(123,63,75,.08),0 24px 0 rgba(123,63,75,.06)}
.mini-one{left:17%;top:27px;transform:rotate(-9deg)}.mini-two{right:15%;top:31px;transform:rotate(8deg)}.mini-three{right:25%;bottom:17px;transform:rotate(3deg);opacity:.78}
.category-mot .category-art-main,.category-mot .category-art-mini,.category-mot .category-arrow{display:none!important}
.category-mot{background:#f8eee9!important}
.category-real-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;display:block!important;z-index:2!important}
.category-botez .category-art-main{background:linear-gradient(145deg,#fff,#eee9f5)}
.category-nunta .category-art-main{background:linear-gradient(145deg,#fff,#f4e7df)}
.category-toppers .category-art-main{background:linear-gradient(145deg,#fff,#f9e3dc)}
.category-tricouri .category-art-main{background:linear-gradient(145deg,#fff,#e9f2ed)}
.category-ecusoane .category-art-main{background:linear-gradient(145deg,#fff,#f6ead7)}
.category-cadouri .category-art-main{background:linear-gradient(145deg,#fff,#f4dfe4)}
.category-arrow{position:absolute;z-index:3;right:12px;bottom:12px;width:31px;height:31px;border-radius:50%;background:#fff;color:#7b3f4b;display:grid;place-items:center;border:1px solid #ead3d1;font-size:16px;box-shadow:0 4px 12px rgba(80,50,50,.10)}
.category-card-body{position:relative;padding:16px 17px 15px;background:linear-gradient(180deg,#fffaf8 0%,#f9ece9 100%)}
.category-card-body::after{content:"";position:absolute;right:24px;top:14px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,130,145,.35);opacity:.6}
.category-card-body h3{font:500 21px/1.2 Georgia,serif!important;margin:0 0 5px!important;color:#68434a!important}
.category-card-body p{display:block!important;margin:0 0 8px!important;color:#806f70!important;font:400 11px/1.35 Arial,sans-serif!important}
.category-models{display:block;color:#9a7479;font:700 9px/1 Arial,sans-serif;letter-spacing:.9px;text-transform:uppercase}
@media(max-width:1050px){.category-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:700px){.category-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:11px!important}.category-visual{height:155px}.category-art-main{width:82px;height:82px;font-size:43px}.category-art-mini{width:55px;height:72px}.category-card-body{padding:12px}.category-card-body h3{font-size:17px!important}.category-card-body p{font-size:10px!important}}
`;
document.head.appendChild(categoryStyle);

const demoModels = [
  {id:"f1",gender:"fata",name:"Model fetiță 01",image:""},
  {id:"f2",gender:"fata",name:"Model fetiță 02",image:""},
  {id:"f3",gender:"fata",name:"Model fetiță 03",image:""},
  {id:"b1",gender:"baiat",name:"Model băiat 01",image:""},
  {id:"b2",gender:"baiat",name:"Model băiat 02",image:""},
  {id:"b3",gender:"baiat",name:"Model băiat 03",image:""}
];

const categories = [
  {id:"mot",icon:"🎀",name:"Seturi pentru moț",label:"Fetiță • Băiat",visual:"set",hint:"Mai multe modele"},
  {id:"botez",icon:"🕊️",name:"Botez",label:"Invitații • Mărturii • Cadouri",visual:"botez",hint:"Mai multe modele"},
  {id:"nunta",icon:"💍",name:"Nuntă",label:"Papetărie • Mărturii • Accesorii",visual:"nunta",hint:"Mai multe modele"},
  {id:"toppers",icon:"🎂",name:"Cake Toppers",label:"Aniversări • Evenimente",visual:"toppers",hint:"Mai multe modele"},
  {id:"tricouri",icon:"👕",name:"Tricouri personalizate",label:"Copii • Damă • Bărbat",visual:"tricouri",hint:"Mai multe modele"},
  {id:"ecusoane",icon:"🏅",name:"Ecusoane",label:"Modele • Tematici • Personalizare",visual:"ecusoane",hint:"Mai multe modele"},
  {id:"cadouri",icon:"🎁",name:"Cadouri personalizate",label:"Pentru orice ocazie",visual:"cadouri",hint:"Mai multe modele"}
];

const categoryGrid=document.getElementById("category-grid");
if(categoryGrid) categoryGrid.innerHTML=categories.map(c=>`<a class="category-card" href="#${c.id}">
  <div class="category-visual category-${c.visual}">
    ${c.id==="mot"?`<img class="category-real-image" src="hero-mot-small.jpg?v=3" alt="Seturi pentru moț - Alina's Handmade Boutique">`:``}
    <div class="category-art-main">${c.icon}</div>
    <div class="category-art-mini mini-one"></div><div class="category-art-mini mini-two"></div><div class="category-art-mini mini-three"></div>
    <span class="category-arrow">↗</span>
  </div>
  <div class="category-card-body"><h3>${c.name}</h3><p>${c.label}</p><span class="category-models">— &nbsp; ${c.hint}</span></div>
</a>`).join("");

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