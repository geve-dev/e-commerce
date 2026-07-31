const API_URL = 'http://localhost:3003';

function getStatus() {
    const token = localStorage.getItem('token');
    return !!token;
}

async function login() {
  const form = document.getElementById("fl");
  if (!form) {
    console.error("Formulário de login 'fl' não encontrado.");
    return;
  }

  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const loginError = document.querySelector('.login-error');

  const email = emailInput ? emailInput.value.trim() : '';
  const senha = senhaInput ? senhaInput.value.trim() : '';

  // limpar erros anteriores
  if (loginError) loginError.innerHTML = '';
  if (emailInput) emailInput.classList.remove('input-error');
  if (senhaInput) senhaInput.classList.remove('input-error');

  // validação simples: campos obrigatórios
  const invalidInputs = [];
  if (!email) invalidInputs.push(emailInput);
  if (!senha) invalidInputs.push(senhaInput);

  if (invalidInputs.length > 0) {
    if (loginError) loginError.innerHTML = 'Preencha todos os campos.';
    invalidInputs.forEach((el) => {
      if (!el) return;
      el.classList.add('input-error');
      const handler = () => el.classList.remove('input-error');
      el.addEventListener('input', handler, { once: true });
    });
    return;
  }

  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valores),
    });

    const resultado = await res.json();

    if (res.status === 200) {
      localStorage.setItem("token", resultado.token);
      localStorage.setItem("userName", resultado.name);
      localStorage.setItem("role", resultado.role);

      if (resultado.role === 'adm') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html'; // Redireciona para a página principal para usuários comuns
      }
    } else {
      if (loginError) loginError.innerHTML = `Não foi possível fazer login. Verifique suas credenciais.`;

      // marcar inputs como inválidos
      if (emailInput) emailInput.classList.add('input-error');
      if (senhaInput) senhaInput.classList.add('input-error');

      // remover classe de erro ao digitar
      [emailInput, senhaInput].forEach((el) => {
        if (!el) return;
        const handler = () => el.classList.remove('input-error');
        el.addEventListener('input', handler, { once: true });
      });

      return;
    }
  } catch (error) {
    console.error("Erro na requisição de login:", error);
    alert("Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.");
  }
}

// Event listener para o formulário de login.
// Assuma que a página de login tem um formulário com id="fl"
// e que o usuário irá interagir com ele para fazer o login.
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("fl");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Impede o recarregamento da página
      login();
    });
  }
});