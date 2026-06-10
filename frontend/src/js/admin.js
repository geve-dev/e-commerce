getPendingStores()

const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');        
  if (!token || role !== 'adm') {
      alert('Acesso negado!');
      window.location.href = 'index.html';
  }

function logout() {
     localStorage.removeItem('token');
     localStorage.removeItem('role');
     localStorage.removeItem('userName');
     window.location.href = 'index.html';
 }

 async function getPendingStores() {
   const res = await fetch('http://localhost:3003/store/pending', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`,
     },
   });
   const pendingStores = await res.json();
   console.log(pendingStores);

   renderPendingStores(pendingStores)
 }

 async function renderPendingStores(dados) {
   const pending = document.getElementById('pending');
   let html = "";

   for (let i = 0; i < dados.length; i++){
     html += `
       <div>
         <h3>${dados[i].name}</h3>
         <p>${dados[i].description}</p>
         <button onclick="approveStore(${dados[i].id})">Aprovar</button>
       </div>
     `;
   }
   
   pending.innerHTML = html;
 }