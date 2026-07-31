const API_URL = 'http://localhost:3003';

function getStatus() {
  return !!localStorage.getItem('token');
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

async function getStoreBySlug() {
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
      document.getElementById('store-details-content').innerHTML = '<p class="st-empty">Slug não informado.</p>';
      return;
    }

    const [resStore, resProducts] = await Promise.all([
      fetch(`${API_URL}/store/${slug}`),
      fetch(`${API_URL}/store/products`)
    ]);

    if (!resStore.ok) {
      document.getElementById('store-details-content').innerHTML = '<p class="st-empty">Loja não encontrada.</p>';
      return;
    }

    const store = await resStore.json();
    const products = resProducts.ok ? await resProducts.json() : [];

    renderStore(store, products);
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
  }
}

  function renderStore(store, products) {
  const container = document.getElementById('store-details-content');
  if (!container) return;

  const initials = store.store_name?.charAt(0).toUpperCase() || '?';
  const storeProducts = products.filter(p => p.id_store === store.id);

  container.innerHTML = `
    <div class="store-details-header">
      <div class="my-store-banner">
        ${store.banner
          ? `<img src="${store.banner}" alt="">`
          : '<div class="banner-placeholder"></div>'
        }
      </div>

      <div class="my-store-logo" style="margin-bottom:16px;">
        ${store.logo
          ? `<img src="${store.logo}" alt="${store.store_name}">`
          : `<div class="logo-placeholder">${initials}</div>`
        }
      </div>

      <div class="my-store-body" style="padding-top:0;">
        <h2 class="st-title">${store.store_name}</h2>
        <span class="st-badge">${store.niche}</span>

        ${store.description
          ? `<p class="my-store-description">${store.description}</p>`
          : ''
        }

        <div class="my-store-meta">
          ${store.contact_email
            ? `<span class="my-store-meta-item"><i class="fa-solid fa-envelope"></i>${store.contact_email}</span>`
            : ''
          }
          ${store.contact_phone
            ? `<span class="my-store-meta-item"><i class="fa-solid fa-phone"></i>${store.contact_phone}</span>`
            : ''
          }
        </div>
      </div>
    </div>

    <p class="">Produtos:</p>
    <div class="st-products-grid" id="products-grid">
      ${storeProducts.length > 0
        ? storeProducts.map(prod => `
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
          `).join('')
        : '<p class="st-empty">Nenhum produto disponível nesta loja.</p>'
      }
    </div>
  `;
}

async function addToItems(id_product) {
  if (!getStatus()) {
    const popup = document.getElementById('needLoginPopup');
    if (popup) popup.classList.add('active');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_product, quantity: 1 }),
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    if (!res.ok) throw new Error(`Falha ao adicionar item: ${res.status}`);
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
  }
}

document.addEventListener('DOMContentLoaded', getStoreBySlug);
