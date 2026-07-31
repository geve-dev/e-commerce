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

async function loadStorePage() {
  try {
    const [resStores, resProducts] = await Promise.all([
      fetch(`${API_URL}/store`),
      fetch(`${API_URL}/store/products`)
    ]);

    const stores = resStores.ok ? await resStores.json() : [];
    const allProducts = resProducts.ok ? await resProducts.json() : [];


    if (stores.length === 0 && !getStatus()) {
            renderStoresAndProducts([{id: 0, store_name: "Destaques da Plataforma", niche: "Global"}], allProducts);
        } else {
            renderStoresAndProducts(stores, allProducts);
        }
  } catch (error) {
    console.error("Erro ao carregar página de lojas:", error);
  }
}

function renderStoresAndProducts(storesArray, productsArray) {
  const container = document.querySelector('#stores') || document.querySelector('section#stores') || document.querySelector('main section');
  if (!container) return;

  container.innerHTML = '';

  // Garante que storesArray seja uma lista
  const storesList = Array.isArray(storesArray) ? storesArray : [storesArray];

  storesList.forEach(store => {
    // Filtra os produtos desta loja específica (limita a 4 para o preview)
    const storeProducts = productsArray.filter(p => p.id_store === store.id).slice(0, 4);

    const storeSection = document.createElement('section');
    storeSection.className = 'st-container';

    storeSection.innerHTML = `
      <div class="st-header">
        <div class="st-info">
          <h2 class="st-title">${store.store_name}</h2>
          <span class="st-badge">${store.niche}</span>
        </div>
        <a href="store-details.html?slug=${store.slug}" class="st-view-more">Ver loja completa →</a>
      </div>

      <div class="st-products-grid">
        ${storeProducts.length > 0 ? storeProducts.map(prod => `
          <div class="st-card">
            <div class="st-card-img">
              <img src="${prod.image || 'assets/placeholder.png'}" alt="${prod.name}">
              <button class="st-add-btn" onclick="addToItems(${prod.id})" title="Adicionar ao carrinho">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
            <div class="st-card-body">
              <span class="st-category">Destaque</span>
              <h3 class="st-product-name">${prod.name}</h3>
              <p class="st-price">R$ ${parseFloat(prod.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        `).join('') : '<p class="st-empty">Nenhum produto em destaque nesta loja.</p>'}
      </div>
    `;
    
    container.appendChild(storeSection);
  });
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
      <button id="userProfile" onClick="window.location.href='profile.html'"><i class="fas fa-user"></i></button>
    `;
  } else {
    btns.innerHTML = `
      <button id="carrinho" type="button" aria-label="Carrinho">
      <i class="fa-solid fa-cart-shopping"></i>
      </button>
      <button id="userProfile" onClick="window.location.href='login.html'"><i class="fas fa-user"></i></button>
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
  loadStorePage();
  renderPerfil();

  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('click', handleHeaderClick);
  }
});
