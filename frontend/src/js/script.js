const logar = document.getElementById('logar')
const deslogar = document.getElementById('deslogar');
const fecharLogin = document.getElementById('fecharLogin');
const popup = document.getElementById('popupOverlay')
const popup2 = document.getElementById('popupOverlay2')
const carrinho = document.getElementById('carrinho');
const fecharCarrinho = document.getElementById('fecharCarrinho');

getProducts()
getPurchase()
renderPerfil()

fecharLogin.addEventListener('click', () => {
  popup.classList.remove('active');
})

document.querySelector('header').addEventListener('click', (event) => {
    if (event.target.id === 'logar') {
        popup.classList.add('active');
    }
    if (event.target.id === 'deslogar') {
        logout();
    }

    if (event.target.id === 'carrinho') {
        popup2.classList.add('active');
    }

});

fecharCarrinho.addEventListener('click', () => {
  popup2.classList.remove('active');
})

async function getPurchase() {
  const res = await fetch(`http://localhost:3003/item`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify()
  })

  let resultado = await res.json();
  console.log(resultado)

  renderPurchase(resultado.items || [])
}

async function renderPurchase(items) {
  const carrinhoItems = document.getElementById('carrinhoItems');

  let html = '';

  if (!items || items.length === 0) {
    carrinhoItems.innerHTML = '<p>Carrinho vazio</p>';
    return;
  }
  
  for (let i = 0; i < items.length; i++) {
    
    const price    = items[i].original_price;
    const quantity = items[i].quantity;
    let all = price * quantity;
    
      html += `
      <div class="card">
        <img src="${items[i].image}" alt="">
        <div class="infos-prod">
        <div class="name">${items[i].name}</div>
        <div class="price">R$ ${items[i].original_price}</div>
        </div>
        <div class="acoes">
          <button class="delete" data-id="${items[i].id}"><i class="fas fa-trash"></i></button>
          <div class="quantity">
            <button class="remove" data-id="${items[i].id}">-</button>
            <span class="quantity">${items[i].quantity}</span>
            <button class="add" data-id="${items[i].id}">+</button>
          </div>
        </div>
        <span>R$ ${all}</span>
      </div>
      `;
    }
    carrinhoItems.innerHTML = html;
}

async function getProducts() {
  let url = 'http://localhost:3003/product';

  const res = await fetch(url);

  let response = await res.json();
  
  // renderProducts(JSON.stringify(response));
  renderProducts(response);
}

async function renderProducts(dados) {
  console.log(dados);
  const produtos = document.querySelector('.produtos');
  let html = '';

  for (let i = 0; i < dados.length; i++){

    const id_product  = dados[i].id;
    const name        = dados[i].name;
    const description = dados[i].description;
    const price       = dados[i].price;
    const image       = dados[i].image;
    
    html += `
    <div class="produto">
      <div class="produto-header">
            <img src="${image}" alt="">
      </div>
        
        <div class="produto-main">
            <p>${name}</p>
            <span>${description}</span>
            <p>R$ ${price}</p>
        </div>
  
        <button onClick="addToItems(${id_product})">+</button>
    </div>
    `;
  }

  produtos.innerHTML = html;
}

async function addToItems(id_product) {
  
  const res = await fetch(`http://localhost:3003/item`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ id_product, quantity: 1 })
  })
  

  const resultado = await res.json();
  console.log(resultado.message);
}

async function login() {
  const form = document.getElementById('fl');
  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());
  console.log(valores)

  
  const res = await fetch(`http://localhost:3003/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(valores)
  })
  
  const resultado = await res.json();
    
  if (res.status == 200) {
    localStorage.setItem('token', resultado.token);
    localStorage.setItem('userName', resultado.name);
    console.log(resultado);
    console.log('Logado com sucesso!');
  }
  
  popup.classList.remove('active');

  renderPerfil();
}

async function renderPerfil() {
  const btns = document.querySelector('.btns');

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
  localStorage.removeItem('token');
  localStorage.removeItem('userName');

  const form = document.getElementById('fl');
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
