const API_URL = 'http://localhost:3003';

async function register() {
  const form = document.getElementById('fr');

  if (!form) {
    console.error("Formulário de registro 'fr' não encontrado.");
    return;
  }

  const registerError = document.querySelector('.register-error');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');

  // limpar erros anteriores
  if (registerError) registerError.textContent = '';
  [nameInput, emailInput, senhaInput].forEach((el) => { if (el) el.classList.remove('input-error'); });

  // validação simples: campos obrigatórios
  const invalidInputs = [];
  if (!nameInput || !nameInput.value.trim()) invalidInputs.push(nameInput);
  if (!emailInput || !emailInput.value.trim()) invalidInputs.push(emailInput);
  if (!senhaInput || !senhaInput.value.trim()) invalidInputs.push(senhaInput);

  if (invalidInputs.length > 0) {
    if (registerError) registerError.textContent = 'Preencha todos os campos.';
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
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valores),
    });

    const resultado = await res.json();

    if (res.status === 201) {
      window.location.href = 'login.html';
      return;
    }

    if (registerError) {
      registerError.textContent = resultado.message || resultado.error || 'Nao foi possivel registrar.';

      // destacar inputs como inválidos (mesma lógica do login: marcar todos e remover ao digitar)
      [nameInput, emailInput, senhaInput].forEach((el) => {
        if (!el) return;
        el.classList.add('input-error');
        const handler = () => el.classList.remove('input-error');
        el.addEventListener('input', handler, { once: true });
      });
    }
  } catch (error) {
    console.error('Erro na requisicao de registro:', error);
    alert('Ocorreu um erro ao tentar registrar. Tente novamente mais tarde.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('fr');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      register();
    });
  }
});
