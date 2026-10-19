const categories = [
  { id: "mot", icon: "🎀", name: "Seturi pentru moț", description: "Seturi personalizate pentru fetițe și băieți." },
  { id: "tricouri", icon: "👕", name: "Tricouri personalizate", description: "Modele personalizate pentru copii și adulți." },
  { id: "ecusoane", icon: "🏅", name: "Ecusoane", description: "Ecusoane și accesorii personalizate." },
  { id: "toppers", icon: "🎂", name: "Cake Toppers", description: "Toppers pentru aniversări și evenimente." },
  { id: "nunta", icon: "💍", name: "Nuntă", description: "Papetărie și produse personalizate pentru nuntă." },
  { id: "botez", icon: "🕊️", name: "Botez", description: "Produse pentru botez și mărturii." },
  { id: "cadouri", icon: "🎁", name: "Cadouri personalizate", description: "Cadouri create special pentru fiecare ocazie." }
];

const grid = document.getElementById("category-grid");

grid.innerHTML = categories.map(category => `
  <a class="category-card" href="#${category.id}">
    <div class="category-icon">${category.icon}</div>
    <div>
      <h3>${category.name}</h3>
      <p>${category.description}</p>
    </div>
  </a>
`).join("");