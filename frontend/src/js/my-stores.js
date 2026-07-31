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

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.id;
}

async function getUserStores() {
  const container = document.getElementById('my-stores');
  if (!container) return;

  if (!getStatus()) {
    container.innerHTML = '<p class="st-empty">Você precisa estar logado para ver as lojas.</p>';
    return;
  }

  try {
    const id = getUserIdFromToken();
    const res = await fetch(`${API_URL}/user/${id}/stores`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    renderUserStores(data);
  } catch (error) {
    console.error('Erro ao carregar lojas:', error);
  }
}

function renderUserStores(data) {
  const container = document.getElementById('my-stores');
  if (!container) return;

  const stores = Array.isArray(data) ? data : [];

  if (stores.length === 0) {
    container.innerHTML = `
      <div class="my-stores-empty">
        <i class="fa-solid fa-store"></i>
        <p>Você ainda não possui nenhuma loja</p>
        <a href="store-form.html" class="btn-create-store">
          <i class="fa-solid fa-plus"></i> Criar minha loja
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="my-stores-header">
      <h1>Minhas Lojas</h1>
      <a href="store-form.html" class="btn-create-store">
        <i class="fa-solid fa-plus"></i> Nova Loja
      </a>
    </div>
    <div class="my-stores-grid">
      ${stores.map(renderStoreCard).join('')}
    </div>
  `;
}

function renderStoreCard(store) {
  const statusClass = store.status || 'pending';
  const initials = store.store_name?.charAt(0).toUpperCase() || '?';

  return `
    <div class="my-store-card">
      <div class="my-store-banner">
        ${store.banner
          ? `<img src="${store.banner}" alt="">`
          : '<div class="banner-placeholder"></div>'
        }
      </div>

      <div class="my-store-logo">
        ${store.logo
          ? `<img src="${store.logo}" alt="${store.store_name}">`
          : `<div class="logo-placeholder">${initials}</div>`
        }
      </div>

      <div class="my-store-body">
        <h2 class="st-title">${store.store_name}</h2>
        <span class="st-badge">${store.niche}</span>
        <span class="status-badge ${statusClass}">
          <i class="fa-solid fa-circle" style="font-size: 0.4rem;"></i>
          ${statusClass}
        </span>

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
          ${store.cnpj
            ? `<span class="my-store-meta-item"><i class="fa-solid fa-file-invoice"></i>${store.cnpj}</span>`
            : ''
          }
        </div>

        ${store.status === 'active' ? `
          <div class="my-store-actions">
            <a href="store-details.html?slug=${store.slug}" class="btn btn-primary">
              <i class="fa-solid fa-eye"></i> Visualizar
            </a>
            <button class="btn btn-secondary" onclick="window.location.href='seller-dashboard.html?id=${store.id}'">
              <i class="fa-solid fa-gear"></i> Configurações
            </button>
          </div>
          ` : ''}
          ${store.status === 'pending' ? `
            <div class="my-store-actions">
              <button class="btn btn-secondary">
                <i class="fa-solid fa-spinner"></i> Aguardando aprovação
              </button>
            </div>
          ` : ''}
          ${store.status === 'rejected' ? `
            <div class="my-store-actions">
              <button class="btn btn-secondary">
                <i class="fa-solid fa-bad"></i> Sua loja foi rejeitada
              </button>
            </div>
          ` : ''}
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  getUserStores();
});
