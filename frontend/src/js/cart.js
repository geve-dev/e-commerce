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
}

async function getPurchase() {
  if (!getStatus()) {
    renderPurchase([]);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      logout();
      renderPurchase([]);
      return;
    }

    if (res.status === 404) {
      renderPurchase([]);
      return;
    }

    if (!res.ok) {
      throw new Error(`Erro ao buscar carrinho: ${res.status}`);
    }

    const resultado = await res.json();
    renderPurchase(resultado.items || []);
  } catch (error) {
    console.error('Erro ao obter itens do carrinho:', error);
    renderPurchase([]);
  }
}

function renderPurchase(items) {
  const carrinhoItems = document.getElementById('carrinhoItems');
  if (!carrinhoItems) {
    return;
  }

  if (!items || items.length === 0) {
    carrinhoItems.innerHTML = getStatus()
      ? `<div class="empty-cart">
          <p>Seu carrinho esta vazio.</p>
          <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
        </div>`
      : `<div class="empty-cart">
          <p>Seu carrinho esta vazio.</p>
          <p>Faca login para salvar seus itens.</p>
          <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
        </div>`;
    return;
  }

  carrinhoItems.innerHTML = items.map((item) => {
    const price = Number(item.original_price || item.unit_value || 0);
    const quantity = Number(item.quantity || 0);
    const total = (price * quantity).toFixed(2);

    return `
      <div class="card">
        <img src="${item.image}" alt="${item.name}">
        <div class="infos-prod">
          <div class="name">${item.name}</div>
          <div class="price">R$ ${price.toFixed(2)}</div>
        </div>
        <div class="acoes">
          <div class="quantity">
            <button class="remove" type="button" onclick="removeItem(${item.id_product})">-</button>
            <span class="quantity-display">${quantity}</span>
            <button class="add" type="button" onclick="addToItems(${item.id_product})">+</button>
          </div>
        </div>
        <span>R$ ${total}</span>
      </div>
    `;
  }).join('');
}

async function removeItem(id_product) {
  if (!getStatus()) {
    alert('Voce precisa estar logado para remover itens do carrinho.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/item`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_product, quantity: 1 }),
    });

    if (res.status === 401) {
      logout();
      window.location.href = 'login.html';
      return;
    }

    if (!res.ok) {
      throw new Error(`Falha ao remover item do carrinho: ${res.status}`);
    }

    await getPurchase();
  } catch (error) {
    console.error('Erro ao remover item:', error);
    alert('Ocorreu um erro ao remover o item. Tente novamente.');
  }
}

async function addToItems(id_product) {
  if (!getStatus()) {
    alert('Voce precisa estar logado para adicionar itens ao carrinho.');
    window.location.href = 'login.html';
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

    await getPurchase();
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    alert('Ocorreu um erro ao adicionar o item. Tente novamente.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getPurchase();
});
