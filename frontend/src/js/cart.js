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
  const cartFooter = document.getElementById('cartFooter');
  if (!carrinhoItems || !cartFooter) {
    return;
  }

  // Se não há itens, mostra mensagem e um footer simples
  if (!items || items.length === 0) {
    if (getStatus()) {
      carrinhoItems.innerHTML = `<div class="empty-cart">
          <p>Seu carrinho está vazio.</p>
          <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
        </div>`;

      cartFooter.innerHTML = `<div class="cart-footer">
          <div class="cart-summary">Total de produtos: 0</div>
          <div class="cart-actions">
            <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
          </div>
        </div>`;
    } else {
      carrinhoItems.innerHTML = `<div class="empty-cart">
          <p>Seu carrinho está vazio.</p>
          <p>Faça login para salvar seus itens.</p>
          <button type="button" onclick="window.location.href='login.html'">Fazer login</button>
        </div>`;

      cartFooter.innerHTML = `<div class="cart-footer">
          <div class="cart-summary">Total de produtos: 0</div>
          <div class="cart-actions">
            <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
          </div>
        </div>`;
    }
    return;
  }

  // Renderiza os itens
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

  // Calcula totais e renderiza footer com ações
  const totalItems = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  const totalPrice = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.original_price || it.unit_value || 0), 0).toFixed(2);

  cartFooter.innerHTML = `<div class="cart-footer">
      <div class="cart-summary">
        <span>Total de produtos: ${totalItems}</span>
        <span>Total: R$ ${totalPrice}</span>
      </div>
      <div class="cart-actions">
        <button type="button" onclick="window.location.href='index.html'">Continuar comprando</button>
        ${getStatus() ? `<button type="button" id="finalizePurchaseBtn">Finalizar compra</button>` : `<button type="button" onclick="window.location.href='login.html'">Entrar para finalizar</button>`}
      </div>
    </div>`;

  // Anexa listener ao botão de finalizar (se existir)
  if (getStatus()) {
    const btn = document.getElementById('finalizePurchaseBtn');
    if (btn) {
      btn.removeEventListener('click', finalizePurchase);
      btn.addEventListener('click', finalizePurchase);
    }
  }
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

async function finalizePurchase() {
  if (!getStatus()) {
    alert('Você precisa estar logado para finalizar a compra.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // TODO: ajustar para permitir escolha de método de pagamento na UI
    const payment_method_id = 1; // Pix por padrão

    const res = await fetch(`${API_URL}/purchase/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_method_id })
    });

    if (res.status === 401) {
      logout();
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = 'login.html';
      return;
    }

    const json = await res.json().catch(() => ({}));

    if (res.status === 400) {
      alert(json.message || 'Não foi possível finalizar.');
      return;
    }

    if (!res.ok) throw new Error('Erro ao finalizar compra: ' + res.status);

    alert(json.message || 'Compra finalizada com sucesso.');
    await getPurchase();
  } catch (err) {
    console.error('Erro ao finalizar compra:', err);
    alert('Erro ao finalizar compra. Tente novamente.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getPurchase();
});
