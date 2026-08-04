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

async function getProductDetails() {
  try {
    const slug = new URLSearchParams(window.location.search).get('slug')
    if (!slug) {
      document.getElementById('product-details-content').innerHTML = '<p class="st-empty">Slug do produto não informado.</p>';
      return;
    }

    const res = await fetch(`${API_URL}/product/${slug}`)

    if (!res.ok) {
      document.getElementById('product-details-content').innerHTML = '<p class="st-empty">Produto não encontrado.</p>';
      return;
    }
    
    const data = await res.json()

    renderProductDetails(data)
  } catch (error) {
    console.error(error)
  }  
}

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return price;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderProductDetails(data) {
  const productDetailsContent = document.getElementById('product-details-content');
  const stock = Number(data.stock);
  const stockLabel = Number.isNaN(stock)
    ? '—'
    : stock > 0
      ? `${stock} disponíveis`
      : 'Esgotado';

  document.title = `${data.name} | E-Commerce`;

  productDetailsContent.innerHTML = `
    <div class="product-details-header">
      <div class="product-image">
        ${data.image
          ? `<img src="${data.image}" alt="${data.name}">`
          : `<img src="assets/images/image not available.png" alt="Imagem não disponível">`
        }
      </div>
      <div class="product-details-header-infos">
        ${data.category ? `<span class="pd-category">${data.category}</span>` : ''}
        <h2>${data.name}</h2>
        <p class="pd-price"><span>Preço</span>${formatPrice(data.price)}</p>
        <div class="pd-meta">
          <span class="pd-meta-item">Estoque: <strong>${stockLabel}</strong></span>
        </div>
        <div class="pd-actions">
          <button type="button" class="pd-btn-cart" onclick="addToItems(${data.id})">
            <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
          </button>
          <button type="button" class="pd-btn-buy" onclick="checkout(${data.id})">
            Comprar Agora
          </button>
        </div>
      </div>
    </div>
    <div class="product-description">
      <h3>Descrição</h3>
      <p>${data.description || 'Sem descrição.'}</p>
    </div>
  `;
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
  getProductDetails();
  
  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('click', handleHeaderClick);
  }
});
