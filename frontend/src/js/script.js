const btnAbrir = document.getElementById('btnAbrir')
const btnCancel = document.getElementById('btnCancel');
const popup     = document.getElementById('popupOverlay')

btnCancel.addEventListener('click', () => {
  popup.classList.remove('active');
})

document.querySelector('header').addEventListener('click', (event) => {
    if (event.target.id === 'btnAbrir') {
        popup.classList.add('active');
    }
});

getProducts()

async function getProducts() {
  let url = 'http://localhost:3003/product';

  const res = await fetch(url);

  let response = await res.json();

  // renderProducts(JSON.stringify(response));
  renderProducts(response);
}

async function renderProducts(dados) {
  console.log(dados);
  const produtos = document.querySelector('.produtos');
  let html = '';

  for (let i = 0; i < dados.length; i++){

    const id_product = dados[i].id_product;
    const name       = dados[i].name;
    const price      = dados[i].price;
    const image      = dados[i].image;
    
    html += `
    <div class="produto">
      <div class="produto-header">>
            <img src="${image}" alt="">
      </div>
        
        <div class="produto-main">>
            <p>${name}</p>
            <span>${price}</span>
        </div>
  
        <button onClick="addToItems(${id_product})">+</button>
    </div>
    `;
  }

  produtos.innerHTML = html;
}

async function addToItems(id_product) {
  const res = await fetch(`http://localhost:3003/item`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_product, quantity: 1 }),
    
  })

  const data = await res.json();
  alert(data.message);
}

async function login() {
  const form = document.getElementById('fl');
  const dados = new FormData(form);
  const valores = Object.fromEntries(dados.entries());
  console.log(valores)

  
  const res = await fetch(`http://localhost:3003/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(valores)
  })
  
  const data = await res.json();
    
  if (data.token) {
    localStorage.setItem('token', data.token);
    alert('Logado com sucesso!');
  }
}