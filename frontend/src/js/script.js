const popup2 = document.getElementById("popupOverlay2");
const fecharCarrinho = document.getElementById("fecharCarrinho");

// Funções utilitárias de estado de login
function getStatus() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Funções para renderizar o perfil e lidar com o logout
async function renderPerfil() {
  const btns = document.querySelector(".btns");
  if (!btns) {
      console.warn("Elemento '.btns' não encontrado. Não é possível renderizar o perfil.");
      return;
  }

  if (window.location.pathname.endsWith("/cart.html")) {
      return;
  }

  if (getStatus()) {
    btns.innerHTML = `
      <button id="carrinho">🛒</button>
      <button id="deslogar">Logout</button>
    `;
  } else {
    btns.innerHTML = `
      <button id="carrinho">🛒</button>
      <button id="logar" onClick="window.location.href='login.html'">Login</button>
    `;
  }
  // Após a renderização, re-anexar os event listeners
  attachHeaderEventListeners();
}

async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");

  // O formulário "fl" só existe na página de login, então verificamos antes de usar.
  const form = document.getElementById("fl");
  if (form) {
      form.reset();
  }

  await renderPerfil(); // Atualiza a UI para mostrar "Login"
  // Opcional: Recarregar a página ou limpar o carrinho na UI
  // window.location.reload();
  renderPurchase([]); // Limpa o carrinho exibido na UI
}

// Funções relacionadas ao carrinho de compras
async function getPurchase() {
  if (!getStatus()) { // Só tenta buscar compras se o usuário estiver logado
      renderPurchase([]); // Exibe carrinho vazio se não logado
      return;
  }
  try {
    const res = await fetch(`http://localhost:3003/item`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      // Body não é necessário em requisições GET
    });

    if (res.status === 401) { // Token inválido ou expirado
        console.warn("Sessão expirada. Redirecionando para login.");
        logout(); // Limpa o localStorage e atualiza a UI
        return;
    }

    const resultado = await res.json();
    renderPurchase(resultado.items || []);
  } catch (error) {
    console.error("Erro ao obter itens do carrinho:", error);
    renderPurchase([]); // Garante que o carrinho esteja vazio em caso de erro
  }
}

async function renderPurchase(items) {
  const carrinhoItems = document.getElementById("carrinhoItems");
  if (!carrinhoItems) {
      console.warn("Elemento 'carrinhoItems' não encontrado. Não é possível renderizar o carrinho.");
      return;
  }

  if (!items || items.length === 0) {
    const isLogged = getStatus();
    carrinhoItems.innerHTML = isLogged
      ? `<div class="empty-cart">
            <p>Seu carrinho está vazio.</p>
            <button onClick="window.location.href='index.html'">Continuar comprando</button>
          </div>`
      : `<div class="empty-cart">
            <p>Seu carrinho está vazio.</p>
            <p>Faça login para salvar seus itens!</p>
            <button onClick="window.location.href='index.html'">Continuar comprando</button>
          </div>`;
    return;
  }

  let html = "";
  for (let i = 0; i < items.length; i++) {
    const price    = items[i].original_price;
    const quantity = items[i].quantity;
    let all = (price * quantity).toFixed(2);

    html += `
      <div class="card">
        <img src="${items[i].image}" alt="">
        <div class="infos-prod">
        <div class="name">${items[i].name}</div>
        <div class="price">R$ ${items[i].original_price}</div>
        </div>
        <div class="acoes">
          <div class="quantity">
            <button class="remove" onClick="removeItem(${items[i].id_product})">-</button>
            <span class="quantity-display">${items[i].quantity}</span>
            <button class="add" onClick="addToItems(${items[i].id_product})">+</button>
          </div>
        </div>
        <span>R$ ${all}</span>
      </div>
      `;
  }
  carrinhoItems.innerHTML = html;
}

async function removeItem(id) {
  if (!getStatus()) {
    alert('Você precisa estar logado para remover itens do carrinho.');
    return;
  }
  try {
    const res = await fetch(`http://localhost:3003/item`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id_product: id, quantity: 1 }), // Remover 1 item
    });
    
    if (!res.ok) {
        throw new Error('Falha ao remover item do carrinho');
    }
    
    await getPurchase();
  } catch (error) {
    console.error("Erro ao remover item:", error);
    alert("Ocorreu um erro ao remover o item. Tente novamente.");
  }
}

async function addToItems(id_product) {
  if (!getStatus()) {
    alert('Você precisa estar logado para adicionar itens ao carrinho.');
    return;
  }
  try {
    const res = await fetch(`http://localhost:3003/item`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id_product, quantity: 1 })
    });

    if (!res.ok) {
        throw new Error('Falha ao adicionar item ao carrinho');
    }

    const resultado = await res.json();
    await getPurchase(); // Atualiza o carrinho após adicionar
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    alert("Ocorreu um erro ao adicionar o item. Tente novamente.");
  }
}

// Funções para carregar e renderizar produtos
async function getProducts() {
  let url = 'http://localhost:3003/product';
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
        throw new Error('Falha ao obter produtos');
    }
    
    let response = await res.json();
    renderProducts(response);
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    // Poderia exibir uma mensagem de erro na UI
  }
}

async function renderProducts(dados) {
  const produtos = document.querySelector(".produtos-section");
  if (!produtos) {
      console.warn("Elemento '.produtos-section' não encontrado. Não é possível renderizar os produtos.");
      return;
  }
  let html = "";

  if (!dados || dados.length === 0) {
      produtos.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
  }

  for (let i = 0; i < dados.length; i++){
    const id_product  = dados[i].id;
    const name        = dados[i].name;
    const price = dados[i].price;
    const image = dados[i].image;

    html += `
    <div class="produto">
        <div class="produto-header">
            <img src="${image}" alt="${name}">
        </div>

        <div class="produto-main">
            <p>Nova Coleção</p>
            <span>${name}</span>
            <p>R$ ${price}</p>
        </div>

        <button onClick="addToItems(${id_product})">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    `;
  }
  produtos.innerHTML = html;
}

// Event Listeners
function attachHeaderEventListeners() {
    const header = document.querySelector("header");
    if (!header) {
        console.warn("Elemento 'header' não encontrado. Event listeners de header não serão anexados.");
        return;
    }

    // Remove listeners existentes para evitar duplicação após renderPerfil
    header.removeEventListener("click", handleHeaderClick);
    header.addEventListener("click", handleHeaderClick);

    // Event listener para fechar o carrinho
    if (fecharCarrinho) {
        fecharCarrinho.removeEventListener("click", handleFecharCarrinhoClick);
        fecharCarrinho.addEventListener("click", handleFecharCarrinhoClick);
    }
}

function handleHeaderClick(event) {
    if (event.target.id === "logar") { // Mudança para corresponder ao ID no renderPerfil
        window.location.href = "login.html";
    }
    if (event.target.id === "deslogar") {
        logout();
    }
    if (event.target.id === "carrinho") {
        if (popup2) {
            popup2.classList.add("active");
        }
    }
}

function handleFecharCarrinhoClick() {
    if (popup2) {
        popup2.classList.remove("active");
    }
}


// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    getProducts();
    getPurchase();
    renderPerfil();
    attachHeaderEventListeners(); // Anexa os listeners inicialmente
});
