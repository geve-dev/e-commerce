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

async function postAddress() {
  if (!getStatus()) {
    alert('Você precisa estar logado para cadastrar um endereço.');
    return;
  }
  
  const form = document.getElementById("fa");
  if (!form) {
    console.error("Formulário de endereço 'fa' não encontrado.");
    return;
  }
  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());

  try {
    const res = await fetch(`${API_URL}/address`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(valores),
    });
    const data = await res.json();
    
    if (res.ok) {
      alert('Endereço cadastrado com sucesso!');
      if (document.querySelector('.addressFormContent') && !document.querySelector('.addressContent')) {
        window.location.href = 'addresses.html';
        return;
      }
      getAddresses();
    } else {
      alert(data.message || 'Erro ao cadastrar endereço.');
    }
  } catch (error) {
    console.error(error);
  }
}

async function getAddresses() {
  if (!getStatus()) {
    renderAdress([]);
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/address`, {
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      renderAdress([]);
      return;
    }

    if (res.status === 404) {
      renderAdress([]);
      return;
    }
    
    if (!res.ok) {
      throw new Error(`Erro ao buscar endereço: ${res.status}`);
    }
    
    const data = await res.json();
    
    renderAdress(data);
    
  } catch (error) {
    console.error(error);
  }
}

function renderAdress(data) {
  const addressContent = document.querySelector('.addressContent');
  if (!addressContent) {
    // Na página do formulário não substitui o conteúdo
    return;
  }

  if (data.length === 0) {
    if (!getStatus()) {
      addressContent.innerHTML = `
        <p>Você precisa estar logado para ver seus endereços.</p>
        `;
    } else {
      const fieldsHtml = typeof getAddressFormFieldsHtml === 'function'
        ? getAddressFormFieldsHtml()
        : `
          <div class="form-group">
            <label for="state">Estado:</label>
            <select id="state" name="state" required>
              <option value="">-- Selecione um estado --</option>
            </select>
          </div>
          <div class="form-group">
            <label for="city">Cidade:</label>
            <input type="text" id="city" name="city" placeholder="Digite a cidade" required>
          </div>
          <div class="form-group">
            <label for="cep">CEP:</label>
            <input type="text" id="cep" name="cep" placeholder="Digite seu CEP (8 dígitos)" required maxlength="8">
          </div>
          <div class="form-group">
            <label for="neighborhood">Bairro:</label>
            <input type="text" id="neighborhood" name="neighborhood" placeholder="Bairro" required>
          </div>
          <div class="form-group">
            <label for="street">Rua:</label>
            <input type="text" id="street" name="street" placeholder="Nome da Rua" required>
          </div>
          <div class="form-group">
            <label for="number">Número:</label>
            <input type="text" id="number" name="number" placeholder="Número" required>
          </div>
          <div class="form-group">
            <label for="complement">Complemento:</label>
            <input type="text" id="complement" name="complement" placeholder="Apto, Bloco, etc. (Opcional)">
          </div>
          <div class="form-group">
            <label for="full_name">Nome Completo:</label>
            <input type="text" id="full_name" name="full_name" placeholder="Nome Completo" required>
          </div>
          <div class="form-group">
            <label for="phone_number">Telefone:</label>
            <input type="text" id="phone_number" name="phone_number" placeholder="Telefone" required>
          </div>
        `;

      addressContent.innerHTML = `
        <section class="address-form-section">
            <h2>Adicione um endereço</h2>
            <p class="form-lead">Preencha os dados abaixo para cadastrar um novo endereço de entrega.</p>
            <form id="fa" class="address-form">
                ${fieldsHtml}
                <div class="form-actions">
                  <button type="button" class="btn-save-address" onclick="postAddress()">
                    <i class="fa-solid fa-check"></i> Salvar endereço
                  </button>
                </div>
            </form>

            <div id="message" class="message"></div>
        </section>
        `;

      if (typeof initAddressOptions === 'function') {
        initAddressOptions();
      }
    }
    return;
  } else {
    addressContent.innerHTML = `
      <section class="address-list">
        ${data.map(address => `
          <div class="address-item">
            <p>${address.address_name ? `<strong>${address.address_name}</strong> - ` : ''}${address.street} ${address.number}</p>
            <span>CEP: ${address.cep} - ${address.city}, ${address.state}</span>
            <div class="address-meta">${address.full_name} • ${address.phone_number}</div>
            <button onclick="editAdress(${address.id})"><i class="fas fa-edit"></i></button>
            <button onclick="deleteAddress(${address.id})"><i class="fas fa-trash"></i></button>
          </div>
        `).join('')}
      </section>

      <button type="button" class="add-address-btn" onclick="window.location.href = 'address-form.html'">
        <i class="fa-solid fa-plus"></i> Cadastrar novo endereço
      </button>
    `;
  }
}

async function updateAddress(id) {
  if (!getStatus()) {
    alert('Voce precisa estar logado para adicionar itens ao carrinho.');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/address`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    body: JSON.stringify({ id })
    });
    
    if (!res.ok) {
      throw new Error(`Falha ao remover endereço: ${res.status}`);
    }
    
    await getAddresses();
  } catch (error) {
    console.error(error);
  }
}

async function deleteAddress(id) {
  if (!getStatus()) {
    alert('Voce precisa estar logado para adicionar itens ao carrinho.');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/address`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    body: JSON.stringify({ id })
    });
    
    if (!res.ok) {
      throw new Error(`Falha ao remover endereço: ${res.status}`);
    }
    
    await getAddresses();
  } catch (error) {
    console.error(error);
  }
}

async function searchCep() {
  try {
    const cep = document.getElementById('cep').value;
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) {
      alert('CEP não encontrado.');
      return;
    }
  } catch (error) {
    console.error(error);
    alert('Erro ao buscar CEP.');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector('.addressContent')) {
    getAddresses();
  }
});
