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

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.id;
}

// ===== Navigation =====
function navigateTo(section) {
  document.querySelectorAll('.seller-nav a').forEach(el => el.classList.remove('active'));
  const link = document.querySelector(`.seller-nav a[data-section="${section}"]`);
  if (link) link.classList.add('active');
  document.getElementById('seller-dashboard-content').innerHTML = '';

  switch (section) {
    case 'dashboard': renderDashboard(); break;
    case 'produtos': renderProdutos(); break;
    case 'pedidos': renderPedidos(); break;
  }
}

async function renderDashboard() {
  if (!getStatus()) {
    window.location.href = 'index.html';
    return;
  }
  
  const container = document.getElementById('seller-dashboard-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const id = new URLSearchParams(window.location.search).get('id');
    const res = await fetch(`${API_URL}/seller/dashboard/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();


    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 24px;">Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
          ${[
            { label: 'Produtos', value: data.totalProducts, icon: 'fa-box', color: '#ecc94b' },
            { label: 'Pedidos', value: data.totalPurchases, icon: 'fa-shopping-cart', color: '#fc8181' },
            { label: 'Faturamento', value: data.totalFaturamento, icon: 'fa-sack-dollar', color: '#68d391' },
          ].map(card => `
            <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;padding:24px;text-align:center;">
              <i class="fa-solid ${card.icon}" style="font-size:2rem;color:${card.color};margin-bottom:8px;"></i>
              <p style="color:#a0aec0;font-size:14px;margin:0 0 4px;">${card.label}</p>
              <p style="color:#e0e0e0;font-size:2rem;font-weight:700;margin:0;">${card.value}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }  catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar dashboard.</p>';
  }
  
}

async function renderProdutos() {
  if (!getStatus()) {
    window.location.href = 'index.html';
    return;
  }
  
  const container = document.getElementById('seller-dashboard-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      document.getElementById('seller-dashboard-content').innerHTML = '<p class="st-empty">Id não informado.</p>';
      return;
    }
    
    const res = await fetch(`${API_URL}/product/store/${id}`, { headers: getAuthHeaders() });
    const products = res.ok ? await res.json() : [];
    
    container.innerHTML = `
      <p class="">Produtos:</p>
      <div class="st-products-grid" id="products-grid">
        ${products.length > 0
          ? products.map(prod => `
              <div class="st-card">
                <div class="st-card-img">
                  <img src="${prod.image || 'assets/placeholder.png'}" alt="${prod.name}">
                  <button class="st-add-btn"  onclick="window.location.href = 'product-edit-form.html'" title="Editar produto">
                    <i class="fa-solid fa-edit"></i>
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
        <button type="button" class="add-address-btn" onclick="window.location.href='product-form.html?id_store=${id}'">
          <i class="fa-solid fa-plus"></i> Adicionar novo produto
        </button>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#4a5568;">Erro ao carregar produtos.</p>';
    console.error(error);
  }
}

async function renderPedidos() {
  if (!getStatus()) {
    window.location.href = 'index.html';
    return;
  }
  
  const container = document.getElementById('seller-dashboard-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      document.getElementById('seller-dashboard-content').innerHTML = '<p class="st-empty">Id não informado.</p>';
      return;
    }
    
    const res = await fetch(`${API_URL}/purchase/store/${id}`, { headers: getAuthHeaders() });
    const pedidos = res.ok ? await res.json() : [];

    // ===== AGRUPAMENTO =====
    const grouped = Object.values(pedidos.reduce((acc, item) => {
      if (!acc[item.purchase_id]) {
        acc[item.purchase_id] = {
          purchase_id: item.purchase_id,
          user_name: item.user_name,
          datahora: item.datahora,
          all_price: item.all_price,
          status: item.status,
          items: []
        };
      }
      acc[item.purchase_id].items.push({
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        unit_value: item.unit_value
      });
      return acc;
    }, {}));
    // ========================

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 20px;">Pedidos (${grouped.length})</h2>
        ${grouped.length === 0
          ? '<p style="text-align:center;color:#4a5568;padding:40px 0;">Nenhum pedido.</p>'
          : grouped.map(p => `
              <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <strong style="color:#e0e0e0;">Pedido #${p.purchase_id}</strong>
                      <span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;
                        ${p.status === 'fechado' ? 'background:rgba(72,187,120,0.15);color:#68d391;border:1px solid rgba(72,187,120,0.3);' : ''}
                        ${p.status === 'aberto' ? 'background:rgba(236,201,75,0.15);color:#ecc94b;border:1px solid rgba(236,201,75,0.3);' : ''}
                      </span>
                    </div>
                    <div style="font-size:13px;color:#4a5568;margin-top:4px;">
                      📅 ${new Date(p.datahora).toLocaleString('pt-BR')} | 👤 ${p.user_name}
                    </div>
                    <div style="margin-top:10px;">
                      ${p.items.map(item => `
                        <div style="display:flex;justify-content:space-between;font-size:15px;color:#fff;padding:6px 0;border-top:1px solid #2d323d;">
                          <span>${item.quantity}x ${item.name}</span>
                          <span>R$ ${(item.unit_value * item.quantity).toFixed(2)}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-shrink:0;flex-direction:column;align-items:flex-end;">
                    <span style="color:#68d391;font-size:16px;font-weight:700;">R$ ${parseFloat(p.all_price).toFixed(2)}</span>
                    ${p.status === 'fechado' ? `
                      <button onclick="updateproductstatus(${p.purchase_id},'cancelado')" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Cancelar</button>
                    ` : ''}
                    ${p.status === 'aberto' ? `
                      <button onclick="updateproductstatus(${p.purchase_id},'cancelado')" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Cancelar</button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')
        }
      </div>
    `;
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});