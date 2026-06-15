const API_URL = 'http://localhost:3003';

const needLoginPopup = document.getElementById('needLoginPopup');
const closeNeedLoginPopup = document.getElementById('closeNeedLoginPopup');

if (closeNeedLoginPopup) {
  closeNeedLoginPopup.addEventListener('click', (e) => {
    e.stopPropagation();
    if (needLoginPopup) needLoginPopup.classList.remove('active');
  });
}

if (needLoginPopup) {
  needLoginPopup.addEventListener('click', (e) => {
    if (e.target === needLoginPopup) {
      needLoginPopup.classList.remove('active');
    }
  });
}

function getStatus() {
  return !!localStorage.getItem('token');
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

async function getStoresProducts() {
  try {
    const res = await fetch(`${API_URL}/store/products`);

    if (!res.ok) {
      throw new Error(`Erro ao buscar produtos: ${res.status}`);
    }

    const data = await res.json();

    console.log(data);
    renderProducts(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    const produtos = document.querySelector('.home-main');
    if (produtos) {
      produtos.innerHTML = `
        <div class="dot-spinner">
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
        </div>
      `;
    }
  }
}

function renderProducts(dados) {
  const produtos = document.querySelector('.home-main');
  if (!produtos) {
    return;
  }

  if (!dados || dados.length === 0) {
    produtos.innerHTML = `
      <div class="dot-spinner">
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
          <div class="dot-spinner__dot"></div>
      </div>
    `;
    return;
  }

  produtos.innerHTML = dados.map((produto) => `
    <div class="produto">
      <div class="produto-header">
        <img src="${produto.image}" alt="${produto.name}">
      </div>

      <div class="produto-main">
        <p>Nova Colecao</p>
        <span>${produto.name}</span>
        <p>R$ ${produto.price}</p>
      </div>

      <button type="button" onclick="addToItems(${produto.id})">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `).join('');
}

async function addToItems(id_product) {
  if (!getStatus()) {
    needLoginPopup.classList.add('active');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_product, quantity: 1 }),
    });

    if (res.status === 401) {
      logout();
      window.location.href = 'login.html';
      return;
    }

    if (!res.ok) {
      throw new Error(`Falha ao adicionar item ao carrinho: ${res.status}`);
    }

    renderPerfil()
    
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    alert('Ocorreu um erro ao adicionar o item. Tente novamente.');
  }
}

async function renderPerfil() {
  const btns = document.querySelector('.btns');
  if (!btns) {
    return;
  }

  if (getStatus()) {
    btns.innerHTML = `
      <button id="carrinho" type="button" aria-label="Carrinho">
      <i class="fa-solid fa-cart-shopping"></i>
      <span id="badge-carrinho" class="badge" style="display: inline-block;">${await getCartCount()}</span>
      </button>
      <button id="deslogar" type="button">Logout</button>
    `;
  } else {
    btns.innerHTML = `
      <button id="carrinho" type="button" aria-label="Carrinho">
      <i class="fa-solid fa-cart-shopping"></i>
      </button>
      <button id="logar" type="button">Login</button>
    `;
  }
}

async function getCartCount() {
  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await res.json();

    const allQuantities = data.items.reduce((acc, item) => acc + item.quantity, 0);
    
    return allQuantities;
  } catch (error) {
    console.error('Erro ao obter contagem do carrinho:', error);
    return 0;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  renderPerfil();
}

function handleHeaderClick(event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  if (button.id === 'logar') {
    window.location.href = 'login.html';
  }

  if (button.id === 'deslogar') {
    logout();
  }

  if (button.id === 'carrinho') {
    window.location.href = 'cart.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getStoresProducts();
  renderPerfil();

  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('click', handleHeaderClick);
  }
});
