const API_URL = 'http://localhost:3003';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'adm') {
  alert('Acesso negado!');
  window.location.href = 'index.html';
}

function authHeaders() {
  return { Authorization: `Bearer ${token}` };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  window.location.href = 'index.html';
}

// ===== Navigation =====
function navigateTo(section) {
  document.querySelectorAll('.admin-nav a').forEach(el => el.classList.remove('active'));
  const link = document.querySelector(`.admin-nav a[data-section="${section}"]`);
  if (link) link.classList.add('active');
  document.getElementById('admin-content').innerHTML = '';

  switch (section) {
    case 'dashboard': renderDashboard(); break;
    case 'stores': renderStores(); break;
    case 'users': renderUsers(); break;
    case 'products': renderProducts(); break;
    case 'purchases': renderPurchases(); break;
  }
}

// ===== Dashboard =====
async function renderDashboard() {
  const container = document.getElementById('admin-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const res = await fetch(`${API_URL}/admin/dashboard`, { headers: authHeaders() });
    const data = await res.json();

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 24px;">Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
          ${[
            { label: 'Lojas', value: data.totalStores, icon: 'fa-store', color: '#63b3ed' },
            { label: 'Usuários', value: data.totalUsers, icon: 'fa-users', color: '#68d391' },
            { label: 'Produtos', value: data.totalProducts, icon: 'fa-box', color: '#ecc94b' },
            { label: 'Pedidos', value: data.totalPurchases, icon: 'fa-shopping-cart', color: '#fc8181' },
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
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar dashboard.</p>';
  }
}

// ===== Stores =====
let currentStoreFilter = 'pending';

async function renderStores() {
  const container = document.getElementById('admin-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const res = await fetch(`${API_URL}/store/all`);

    if (!res.ok) {
      container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar lojas.</p>';
      return;
    }

    const allStores = await res.json();

    const counts = {
      all: allStores.length,
      active: allStores.filter(s => s.status === 'active').length,
      pending: allStores.filter(s => s.status === 'pending').length,
      rejected: allStores.filter(s => s.status === 'rejected').length,
    };

    const filtered = currentStoreFilter === 'all'
      ? allStores
      : allStores.filter(s => s.status === currentStoreFilter);

    const tabs = [
      { key: 'all', label: 'Todas', count: counts.all },
      { key: 'active', label: 'Ativas', count: counts.active },
      { key: 'pending', label: 'Pendentes', count: counts.pending },
      { key: 'rejected', label: 'Rejeitadas', count: counts.rejected },
    ];

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 20px;">Gerenciar Lojas</h2>
        <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
          ${tabs.map(tab => `
            <button onclick="currentStoreFilter='${tab.key}';renderStores()"
              style="padding:10px 18px;border-radius:10px;border:1px solid ${currentStoreFilter === tab.key ? '#fff' : '#2d323d'};
              background:${currentStoreFilter === tab.key ? '#fff' : 'transparent'};
              color:${currentStoreFilter === tab.key ? '#111' : '#a0aec0'};
              font-weight:600;font-size:14px;cursor:pointer;">
              ${tab.label} (${tab.count})
            </button>
          `).join('')}
        </div>
        ${filtered.length === 0
          ? '<p style="text-align:center;color:#4a5568;padding:40px 0;">Nenhuma loja encontrada.</p>'
          : filtered.map(store => `
              <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;padding:20px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                      <h3 style="color:#e0e0e0;margin:0;">${store.store_name}</h3>
                      <span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;
                        ${store.status === 'active' ? 'background:rgba(72,187,120,0.15);color:#68d391;border:1px solid rgba(72,187,120,0.3);' : ''}
                        ${store.status === 'pending' ? 'background:rgba(236,201,75,0.15);color:#ecc94b;border:1px solid rgba(236,201,75,0.3);' : ''}
                        ${store.status === 'rejected' ? 'background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);' : ''}">
                        ${store.status === 'active' ? '✓ Ativa' : store.status === 'pending' ? '⏳ Pendente' : '✕ Rejeitada'}
                      </span>
                    </div>
                    <span style="background:#343a46;color:#a0aec0;padding:4px 10px;border-radius:6px;font-size:12px;">${store.niche}</span>
                    ${store.description ? `<p style="color:#718096;font-size:14px;margin:10px 0 0;">${store.description}</p>` : ''}
                    <div style="display:flex;gap:12px;margin-top:8px;font-size:13px;color:#4a5568;flex-wrap:wrap;">
                      <span>📧 ${store.contact_email || '-'}</span>
                      <span>📞 ${store.contact_phone || '-'}</span>
                      <span>Store 🆔${store.id}</span>
                      <span>User 🆔${store.id_owner}</span>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
                    ${store.status === 'pending' ? `
                      <button onclick="approveStore(${store.id});  renderStores()" style="background:#68d391;color:#111;border:none;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">✓ Aprovar</button>
                      <button onclick="reproveStore(${store.id});  renderStores()" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">✕ Rejeitar</button>
                    ` : ''} 
                    ${store.status === 'active' ? `
                      <button onclick="reproveStore(${store.id}); renderStores()" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">✕ Desativar</button>
                    ` : ''}
                    ${store.status === 'rejected' ? `
                      <button onclick="approveStore(${store.id}); renderStores()" style="background:#68d391;color:#111;border:none;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">✓ Aprovar</button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')
        }
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro de conexão.</p>';
  }
}

async function approveStore(id) {
  try {
    const res = await fetch(`${API_URL}/store/${id}/approve`, { method: 'PUT', headers: authHeaders() });
    if (res.ok) { alert('Loja aprovada!'); renderStores(); }
    else alert('Erro ao aprovar loja.');
  } catch (error) { alert('Erro de conexão.'); }
}

async function reproveStore(id) {
  try {
    const res = await fetch(`${API_URL}/store/${id}/reprove`, { method: 'POST', headers: authHeaders() });
    if (res.ok) { alert('Loja rejeitada.'); renderStores(); }
    else alert('Erro ao rejeitar loja.');
  } catch (error) { alert('Erro de conexão.'); }
}

// ===== Users =====
async function renderUsers() {
  const container = document.getElementById('admin-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const res = await fetch(`${API_URL}/user`, { headers: authHeaders() });
    const users = await res.json();

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 20px;">Gerenciar Usuários (${users.length})</h2>
        ${users.map(user => `
          <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <strong style="color:#e0e0e0;">${user.name}</strong>
                  <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;
                    ${user.role === 'adm' ? 'background:rgba(99,179,237,0.15);color:#63b3ed;border:1px solid rgba(99,179,237,0.3);' : ''}
                    ${user.role === 'mod' ? 'background:rgba(236,201,75,0.15);color:#ecc94b;border:1px solid rgba(236,201,75,0.3);' : ''}
                    ${user.role === 'user' ? 'background:rgba(160,174,192,0.15);color:#a0aec0;border:1px solid rgba(160,174,192,0.3);' : ''}">
                    ${user.role}
                  </span>
                </div>
                <div style="font-size:13px;color:#4a5568;margin-top:4px;">
                  📧 ${user.email} | 🆔 ID ${user.id}
                </div>
              </div>
              <div style="display:flex;gap:8px;flex-shrink:0;">
                ${user.role !== 'adm' ? `
                  <select onchange="updateUserRole(${user.id}, this.value)" style="background:#242933;color:#e0e0e0;border:1px solid #2d323d;padding:8px;border-radius:8px;font-size:13px;">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
                    <option value="mod" ${user.role === 'mod' ? 'selected' : ''}>mod</option>
                  </select>
                ` : ''}
                <button onclick="deleteUser(${user.id})" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">✕</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar usuários.</p>';
  }
}

async function updateUserRole(id, role) {
  try {
    const res = await fetch(`${API_URL}/user/${id}`, { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    if (res.ok) alert('Cargo atualizado!');
    else alert('Erro ao atualizar cargo.');
  } catch (error) { alert('Erro de conexão.'); }
}

async function deleteUser(id) {
  if (!confirm('Tem certeza?')) return;
  try {
    const res = await fetch(`${API_URL}/user/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { alert('Usuário deletado.'); renderUsers(); }
    else alert('Erro ao deletar.');
  } catch (error) { alert('Erro de conexão.'); }
}

// ===== Products =====
async function renderProducts() {
  const container = document.getElementById('admin-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const res = await fetch(`${API_URL}/product`);
    const products = await res.json();

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 20px;">Gerenciar Produtos (${products.length})</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
          ${products.map(prod => `
            <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;overflow:hidden;">
              <div style="height:140px;background:#242933;">
                ${prod.image ? `<img src="${prod.image}" style="width:100%;height:100%;object-fit:cover;">` : ''}
              </div>
              <div style="padding:14px;">
              <h3 style="color:#e0e0e0;margin:0 0 4px;font-size:15px;">${prod.name}</h3>
                <p style="color:#4a5568;font-size:13px;margin:0;">Categoria: ${prod.category}</p>
                <p style="color:#4a5568;font-size:13px;margin:6;">R$ ${parseFloat(prod.price).toFixed(2)} | Estoque: ${prod.stock}</p>
                <p style="color:#4a5568;font-size:12px;margin:6px 0 0;">Produto 🆔 ${prod.id}</p>
                <p style="color:#4a5568;font-size:12px;margin:6px 0 0;">Store 🆔 ${prod.id_store}</p>
                <button onclick="deleteProduct(${prod.id})" style="margin-top:10px;background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Excluir</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar produtos.</p>';
  }
}

async function deleteProduct(id) {
  if (!confirm('Excluir este produto?')) return;
  try {
    const res = await fetch(`${API_URL}/product/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { alert('Produto excluído.'); renderProducts(); }
    else alert('Erro ao excluir.');
  } catch (error) { alert('Erro de conexão.'); }
}

// ===== Purchases =====
async function renderPurchases() {
  const container = document.getElementById('admin-content');
  container.innerHTML = '<p style="text-align:center;color:#4a5568;">Carregando...</p>';

  try {
    const res = await fetch(`${API_URL}/purchase/all`, { headers: authHeaders() });
    const purchases = await res.json();

    container.innerHTML = `
      <div style="max-width:900px;margin:100px auto 0;padding:0 20px;">
        <h2 style="color:#e0e0e0;margin:0 0 20px;">Pedidos (${purchases.length})</h2>
        ${purchases.length === 0
          ? '<p style="text-align:center;color:#4a5568;padding:40px 0;">Nenhum pedido.</p>'
          : purchases.map(p => `
              <div style="background:#1c1f26;border:1px solid #2d323d;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <strong style="color:#e0e0e0;">Pedido #${p.id}</strong>
                      <span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;
                        ${p.status === 'fechado' ? 'background:rgba(72,187,120,0.15);color:#68d391;border:1px solid rgba(72,187,120,0.3);' : ''}
                        ${p.status === 'aberto' ? 'background:rgba(236,201,75,0.15);color:#ecc94b;border:1px solid rgba(236,201,75,0.3);' : ''}
                        ${p.status === 'cancelado' ? 'background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);' : ''}">
                        ${p.status === 'fechado' ? '✓ Fechado' : p.status === 'aberto' ? '⏳ Aberto' : '✕ Cancelado'}
                      </span>
                    </div>
                    <div style="font-size:13px;color:#4a5568;margin-top:4px;">
                      👤 ${p.user_name} (${p.user_email}) | 📅 ${new Date(p.datahora).toLocaleString('pt-BR')}
                      ${p.all_price ? `| 💰 R$ ${parseFloat(p.all_price).toFixed(2)}` : ''}
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;flex-shrink:0;">
                    ${p.status === 'fechado' ? `
                      <button onclick="updatePurchaseStatus(${p.id},'cancelado')" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Cancelar</button>
                    ` : ''}
                    ${p.status === 'aberto' ? `
                      <button onclick="updatePurchaseStatus(${p.id},'cancelado')" style="background:rgba(245,101,101,0.15);color:#fc8181;border:1px solid rgba(245,101,101,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">Cancelar</button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')
        }
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<p style="text-align:center;color:#fc8181;">Erro ao carregar pedidos.</p>';
  }
}

async function updatePurchaseStatus(id, status) {
  try {
    const res = await fetch(`${API_URL}/purchase/${id}/status`, { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { alert('Status atualizado!'); renderPurchases(); }
    else alert('Erro ao atualizar status.');
  } catch (error) { alert('Erro de conexão.'); }
}

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});
