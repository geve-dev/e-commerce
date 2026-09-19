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
  document.querySelectorAll('.admin-nav a').forEach(el => el.classList.remove('active'));
  const link = document.querySelector(`.admin-nav a[data-section="${section}"]`);
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
    if (!id) {
      document.getElementById('seller-dashboard-content').innerHTML = '<p class="st-empty">Id não informado.</p>';
      return;
    }
    const res = await fetch(`${API_URL}/seller/dashboard/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();


    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 24px;">Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
          ${[
            { label: 'Produtos', value: data.totalProducts, icon: 'fa-box', color: '#ecc94b' },
            { label: 'Pedidos', value: data.totalPurchases, icon: 'fa-shopping-cart', color: '#fc8181' },
            { label: 'Faturamento', value: data.totalFaturamento === null ? 'R$ 0' : `${data.totalFaturamento}`, icon: 'fa-sack-dollar', color: '#68d391' },
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
      container.innerHTML = '<p class="st-empty">Id não informado.</p>';
      return;
    }

    const res = await fetch(`${API_URL}/product/store/${id}`, { headers: getAuthHeaders() });
    const products = res.ok ? await res.json() : [];

    console.log(products);

    container.innerHTML = `
      <div class="seller-page">
        <div class="seller-page-header">
          <div>
            <h2>Produtos</h2>
            <p>${products.length} ${products.length === 1 ? 'item cadastrado' : 'itens cadastrados'}</p>
          </div>
          <button type="button" class="seller-add-btn" onclick="window.location.href='product-form.html?id_store=${id}'">
            <i class="fa-solid fa-plus"></i> Novo produto
          </button>
        </div>

        <div class="seller-products-grid">
          ${products.length > 0
            ? products.map((prod, index) => {
                const stock = Number(prod.stock);
                const stockClass = stock > 0 ? 'stock-ok' : 'stock-out';
                const stockLabel = Number.isNaN(stock)
                  ? '—'
                  : stock > 0
                    ? `${stock} em estoque`
                    : 'Esgotado';
                
                const slug = prod.product_slug || prod.slug;
                const id = prod.product_id;
                const store_id = prod.id;

                return `
                  <div class="seller-product-card" style="animation-delay:${index * 0.04}s"
                       onclick="window.location.href='product-details.html?slug=${slug}'">
                    <div class="seller-product-img">
                      ${prod.image
                        ? `<img src="${prod.image}" alt="${prod.name}">`
                        : `<div class="seller-product-img-placeholder"><i class="fa-solid fa-image"></i></div>`
                      }
                      <button type="button" class="seller-delete-btn"
                              onclick="event.stopPropagation(); deleteProduct(${prod.product_id})"
                              title="Deletar produto">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                      <button type="button" class="seller-edit-btn"
                              onclick="event.stopPropagation(); window.location.href='product-edit-form.html?slug=${prod.product_slug}&product-id=${id}&store-id=${store_id}'"
                              title="Editar produto">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                    </div>
                    <div class="seller-product-body">
                      ${prod.category ? `<span class="seller-product-category">${prod.category}</span>` : ''}
                      <h3 class="seller-product-name">${prod.name}</h3>
                      <p class="seller-product-price">
                        R$ ${parseFloat(prod.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div class="seller-product-meta">
                        <span class="${stockClass}">${stockLabel}</span>
                        ${prod.status ? `<span>${prod.status}</span>` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')
            : `
              <div class="seller-empty">
                <i class="fa-solid fa-box-open"></i>
                Nenhum produto nesta loja ainda.
                <br><br>
                <button type="button" class="seller-add-btn" onclick="window.location.href='product-form.html?id_store=${id}'">
                  <i class="fa-solid fa-plus"></i> Cadastrar primeiro produto
                </button>
              </div>
            `
          }
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar produtos.</p>';
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

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  try {
    const res = await fetch(`${API_URL}/product/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) { alert('Produto excluído.'); renderProdutos(); }
    else alert('Erro ao excluir.');
  } catch (error) {
    console.error(error)
  }
}


document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});