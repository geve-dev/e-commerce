const API_URL = 'http://localhost:3003';

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function getStatus() {
  return !!localStorage.getItem('token');
}

function setupImageUpload(inputId, previewId, clearId, urlInputId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const clear = document.getElementById(clearId);
  const area = input?.closest('.image-upload-area');
  const urlInput = document.getElementById(urlInputId);

  if (!input) return;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      preview.src = dataUrl;
      preview.style.display = 'block';
      area?.classList.add('has-image');
      document.querySelectorAll(`[data-upload-icon="${inputId}"]`).forEach(el => el.style.display = 'none');
      if (clear) clear.style.display = 'flex';
      if (urlInput) urlInput.value = dataUrl;
    };
    reader.readAsDataURL(file);
  });

  urlInput?.addEventListener('input', () => {
    if (urlInput.value) {
      preview.src = urlInput.value;
      preview.style.display = 'block';
      area?.classList.add('has-image');
      input.value = '';
      document.querySelectorAll(`[data-upload-icon="${inputId}"]`).forEach(el => el.style.display = 'none');
      if (clear) clear.style.display = 'flex';
    } else {
      if (!input.files?.length) {
        preview.style.display = 'none';
        preview.src = '';
        area?.classList.remove('has-image');
        document.querySelectorAll(`[data-upload-icon="${inputId}"]`).forEach(el => el.style.display = '');
        if (clear) clear.style.display = 'none';
      }
    }
  });

  clear?.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    preview.style.display = 'none';
    preview.src = '';
    area?.classList.remove('has-image');
    document.querySelectorAll(`[data-upload-icon="${inputId}"]`).forEach(el => el.style.display = '');
    clear.style.display = 'none';
    if (urlInput) urlInput.value = '';
  });
}

function setupSlugAutoFill() {
  const nameInput = document.getElementById('name');
  const slugInput = document.getElementById('slug');
  const slugPreview = document.getElementById('slug-preview-value');

  if (!nameInput || !slugInput) return;

  let slugManuallyEdited = false;

  slugInput.addEventListener('input', () => {
    slugManuallyEdited = true;
    if (slugPreview) slugPreview.textContent = slugInput.value;
  });

  nameInput.addEventListener('input', () => {
    if (slugManuallyEdited) return;
    const slug = nameInput.value
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    slugInput.value = slug;
    if (slugPreview) slugPreview.textContent = slug || '...';
  });
}

async function loadProduct() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) return;

  try {
    const res = await fetch(`${API_URL}/product/${slug}`);
    const product = await res.json();
    if (!product) return;

    const data = Array.isArray(product) ? product[0] : product;
    console.log(product);

    document.getElementById('name').value = data.name;
    document.getElementById('price').value = data.price;
    document.getElementById('stock').value = data.stock;
    document.getElementById('description').value = data.description;
    document.getElementById('category').value = data.category;
    document.getElementById('slug').value = data.slug;
    document.getElementById('status').value = data.status;

    if (data.image) {
      const preview = document.getElementById('image-preview');
      preview.src = data.image;
      preview.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
  }
  
}

async function updateProduct() {
  event.preventDefault();

  const btn = document.querySelector('.btn-update-product');
  const msg = document.getElementById('form-message');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
  
  try {
    const form = document.getElementById('product-edit-form');
    const id = new URLSearchParams(window.location.search).get('product-id');
    const id_store = new URLSearchParams(window.location.search).get('store-id');
    
    const formData = new FormData();
    formData.append('name', form.name.value.trim());
    formData.append('description', form.description.value.trim());
    formData.append('price', parseFloat(form.price.value) || 0);
    formData.append('stock', parseInt(form.stock.value, 10) || 0);
    formData.append('category', form.category.value);
    formData.append('slug', form.slug.value.trim());
    formData.append('id_store', parseInt(id_store, 10));

    const file = form['image-input'].files[0];
    if (file) formData.append('image', file);

    console.log(formData);

    const res = await fetch(`${API_URL}/product/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });

    const product = await res.json();

    if (!res.ok) {
      const errors = product.errors || [{ message: product.error || 'Erro ao atualizar produto' }];
      msg.innerHTML = errors.map(e => `<div>${e.message || e.path?.[0] + ': ' + e.message}</div>`).join('');
      msg.className = 'message error';
      return;
    }

    msg.textContent = 'Produto atualizado com sucesso!';
    msg.className = 'message success';
    form.reset();
    ['image'].forEach(id => {
      const p = document.getElementById(id + '-preview');
      if (p) { p.style.display = 'none'; p.src = ''; }
      const c = document.getElementById('clear-' + id);
      if (c) c.style.display = 'none';
      const a = document.getElementById(id + '-area');
      if (a) a.classList.remove('has-image');
      document.querySelectorAll(`[data-upload-icon="${id}-input"]`).forEach(el => el.style.display = '');
    });
    const sp = document.getElementById('slug-preview-value');
    if (sp) sp.textContent = '...';

    setTimeout(() => {
      window.location.href = `seller-dashboard.html?id=${id_store}`;
    }, 2000);
  } catch (error) {
    msg.textContent = 'Erro de conexão. Verifique o servidor.';
     msg.className = 'message error';
     console.error(error);
   } finally {
     btn.disabled = false;
     btn.innerHTML = '<i class="fa-solid fa-check"></i> Atualizar Produto';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getStatus()) {
    window.location.href = 'login.html';
    return;
  }

  setupImageUpload('image-input', 'image-preview', 'clear-image', 'image');

  loadProduct();
  
  const form = document.getElementById('product-edit-form');
  form?.addEventListener('submit', updateProduct);
});