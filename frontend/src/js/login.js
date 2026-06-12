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
  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());

  try {
    const res = await fetch(`http://localhost:3003/auth/login`, {
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
      const loginError = document.querySelector('.login-error');
      loginError.innerHTML = `Não foi possível fazer login. Verifique suas credenciais.`;

          // marcar inputs como inválidos
          const emailInput = document.getElementById('email');
          const senhaInput = document.getElementById('senha');
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