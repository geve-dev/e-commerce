async function register() {
  const form = document.getElementById('fr');
  const registerError = document.querySelector('.register-error');

  if (!form) {
    return;
  }

  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());

  try {
    const res = await fetch('http://localhost:3003/auth/register', {
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

      // destacar inputs como inválidos
      const inputs = form.querySelectorAll('input');
      inputs.forEach((i) => i.classList.add('input-error'));

      // remover destaque quando o usuário começar a digitar
      inputs.forEach((i) => {
        const handler = () => i.classList.remove('input-error');
        i.addEventListener('input', handler, { once: true });
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
