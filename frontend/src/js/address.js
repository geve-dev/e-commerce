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

const cepInput = document.getElementById('cep');

cepInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
});

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
  console.log(valores)

  try {
    const res = await fetch(`${API_URL}/address`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(valores),
    });
    const data = await res.json();
    
    if (res.ok) {
      alert('Endereço cadastrado com sucesso!');
    } else {
      alert(data.message || 'Erro ao cadastrar endereço.');
    }
  } catch (error) {
    console.error(error);
  }
}

async function searchCep() {
  try {
    const cep = document.getElementById('cep').value;
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    console.log(data);
    if (data.erro) {
      alert('CEP não encontrado.');
      return;
    }
  } catch (error) {
    console.error(error);
    alert('Erro ao buscar CEP.');
  }
}

