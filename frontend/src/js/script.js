const logar = document.getElementById("logar");
const deslogar = document.getElementById("deslogar");
const fecharLogin = document.getElementById("fecharLogin");
const popup = document.getElementById("popupOverlay");
const popup2 = document.getElementById("popupOverlay2");
const carrinho = document.getElementById("carrinho");
const fecharCarrinho = document.getElementById("fecharCarrinho");

getProducts();
getPurchase();
renderPerfil();

fecharLogin.addEventListener("click", () => {
  popup.classList.remove("active");
});

document.querySelector("header").addEventListener("click", (event) => {
  if (event.target.id === "logar") {
    popup.classList.add("active");
  }
  if (event.target.id === "deslogar") {
    logout();
  }

  if (event.target.id === "carrinho") {
    popup2.classList.add("active");
  }
});

fecharCarrinho.addEventListener("click", () => {
  popup2.classList.remove("active");
});

async function getPurchase() {
  const res = await fetch(`http://localhost:3003/item`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify()
  })

  let resultado = await res.json();

  renderPurchase(resultado.items || [])
}

async function renderPurchase(items) {
  const carrinhoItems = document.getElementById("carrinhoItems");

  if (!items || items.length === 0) {
    const isLogged = getStatus();

    carrinhoItems.innerHTML = isLogged
      ? `<div class="empty-cart">
            <p>Seu carrinho está vazio.</p>
            <button onClick="window.location.href='index.html'">Continuar comprando</button>
          </div>`
      : `<div class="empty-cart">
            <p>Seu carrinho está vazio.</p>
            <p>Faça login para salvar seus itens!</p>
            <button onClick="window.location.href='index.html'">Continuar comprando</button>
          </div>`;
    return;
  }

  let html = "";

  for (let i = 0; i < items.length; i++) {
    
    const price    = items[i].original_price;
    const quantity = items[i].quantity;
    let all = (price * quantity).toFixed(2);

    html += `
      <div class="card">
        <img src="${items[i].image}" alt="">
        <div class="infos-prod">
        <div class="name">${items[i].name}</div>
        <div class="price">R$ ${items[i].original_price}</div>
        </div>
        <div class="acoes">
          <!--<button class="delete" data-id="${items[i].id}"><i class="fas fa-trash"></i></button>-->
          <div class="quantity">
            <button class="remove" onClick="removeItem(${items[i].id_product})" data-id="${items[i].id_product}">-</button>
            <span class="quantity">${items[i].quantity}</span>
            <button class="add" onClick="addToItems(${items[i].id_product})" data-id="${items[i].id}">+</button>
          </div>
        </div>
        <span>R$ ${all}</span>
      </div>
      `;
  }
  carrinhoItems.innerHTML = html;
}

async function removeItem(id) {
  const res = await fetch(`http://localhost:3003/item`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ id_product: id, quantity: 1 }),
  });

  getPurchase();
}

async function getProducts() {
  let url = 'http://localhost:3003/product';

  const res = await fetch(url);

  let response = await res.json();
  
  // renderProducts(JSON.stringify(response));
  renderProducts(response);
}

async function renderProducts(dados) {
  const produtos = document.querySelector(".produtos-section");
  let html = "";

  for (let i = 0; i < dados.length; i++){

    const id_product  = dados[i].id;
    const name        = dados[i].name;
    const description = dados[i].description;
    const price = dados[i].price;
    const image = dados[i].image;

    html += `
    <div class="produto">
        <div class="produto-header">
            <img src="${image}" alt="${name}">
        </div>
        
        <div class="produto-main">
            <p>Nova Coleção</p> <!-- Tag fictícia de categoria -->
            <span>${name}</span>
            <p>R$ ${price}</p>
        </div>
    
        <button onClick="addToItems(${id_product})">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    `;

  }

  produtos.innerHTML = html;
}

async function addToItems(id_product) {
  const res = await fetch(`http://localhost:3003/item`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ id_product, quantity: 1 })
  })

  if (!getStatus()) {
    alert('Você precisa estar logado para adicionar itens ao carrinho.');
    return;
  }

  const resultado = await res.json();
  getPurchase();
}

async function login() {
  const form = document.getElementById("fl");
  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());

  
  const res = await fetch(`http://localhost:3003/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(valores),
  });

  const resultado = await res.json();

  if (res.status == 200) {
    localStorage.setItem("token", resultado.token);
    localStorage.setItem("userName", resultado.name);
    localStorage.setItem("role", resultado.role);
  }

  popup.classList.remove('active');

  if (resultado.role === 'adm') {
    window.location.href = 'admin.html';
  }

  renderPerfil();
  getPurchase();
}

async function renderPerfil() {
  const btns = document.querySelector(".btns");

  if (getStatus() == true) {
    btns.innerHTML = `
      <button id="carrinho">🛒</button>
      <button id="deslogar">Logout</button>
      `;
  } else {
    btns.innerHTML = `
      <button id="carrinho">🛒</button>
      <button id="logar">Login</button>
    `;
  }
}

async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");

  const form = document.getElementById("fl");
  if (form) {
      form.reset();
  }

  renderPerfil();
}

function getStatus() {
    const token = localStorage.getItem('token');

    if (token) {
        return true;
    } else {
        return false;
    }
}
