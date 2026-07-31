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
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function getProfile() {
  if (!getStatus()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/user/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      logout();
      return;
    }

    if (res.status === 404) {
      renderProfile();
      return;
    }

    if (!res.ok) {
      throw new Error(`Erro ao buscar perfil: ${res.status}`);
    }

    const resultado = await res.json();
    renderProfile(resultado);
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    renderProfile();
  }
}

function renderProfile(dados) {
  const profile = document.querySelector('.profile');
  if (!profile) return;

  if (!getStatus() || !dados) {
    profile.innerHTML = `
      <div class="profile-empty">
        <p>Não foi possível carregar o perfil.</p>
        <button class="btn-secondary" onclick="window.location.href='login.html'">Fazer login</button>
      </div>
    `;
    return;
  }

  const name = dados.name || 'Usuário';
  const email = dados.email || '—';
  const role = dados.role || 'user';
  const initials = getInitials(name);

  profile.innerHTML = `
    <aside class="profile-sidebar">
      <p class="sidebar-title">Conta</p>
      <nav>
        <ul>
          <li><a href="profile.html" class="active"><i class="fa-solid fa-user"></i> Perfil</a></li>
          <li><a href="addresses.html"><i class="fa-solid fa-location-dot"></i> Endereços</a></li>
          <li><a href="my-stores.html"><i class="fa-solid fa-store"></i>Minha Loja</a></li>
        </ul>
      </nav>
    </aside>

    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar" aria-hidden="true">${initials}</div>
        <div class="profile-header-text">
          <h2>${name}</h2>
          <p class="profile-subtitle">Gerencie suas informações da conta</p>
          <span class="profile-badge"><i class="fa-solid fa-shield"></i> ${role}</span>
        </div>
      </div>

      <div class="profile-info">
        <div class="row">
          <span class="label">Nome</span>
          <span class="value">${name}</span>
        </div>
        <div class="row">
          <span class="label">E-mail</span>
          <span class="value">${email}</span>
        </div>
        <div class="row">
          <span class="label">Tipo de conta</span>
          <span class="value">${role}</span>
        </div>
        <div class="row">
          <span class="label">Status</span>
          <span class="value">Conectado</span>
        </div>
      </div>

      <div class="profile-actions">
        <button type="button" class="btn-secondary" onclick="window.location.href='index.html'">
          <i class="fa-solid fa-arrow-left"></i> Voltar à loja
        </button>
        <button type="button" class="btn-danger" onclick="logout()">
          <i class="fa-solid fa-right-from-bracket"></i> Sair
        </button>
      </div>
    </div>
  `;

  const profileActions = document.querySelector('.profile-actions');
  if (dados.role === 'adm') {
    profileActions.innerHTML = `
      <button type="button" class="btn-secondary" onclick="window.location.href='index.html'">
        <i class="fa-solid fa-arrow-left"></i> Voltar à loja
      </button>
      <button type="button" class="btn-secondary" onclick="window.location.href='admin.html'">
        <i class="fa-solid fa-shield"></i> Painel Adimin
      </button>
        <button type="button" class="btn-danger" onclick="logout()">
          <i class="fa-solid fa-right-from-bracket"></i> Sair
        </button>
      </div>
      `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getProfile();
});
