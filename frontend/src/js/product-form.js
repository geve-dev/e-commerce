const API_URL = 'http://localhost:3003';

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
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


async function createProduct() {
  event.preventDefault();

  const btn = document.querySelector('.btn-create-product');
  const msg = document.getElementById('form-message');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
  
  try {
    const form = document.getElementById('product-form');
    const id_store = new URLSearchParams(window.location.search).get('id_store');
    const data = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      price: parseFloat(form.price.value) || 0,
      stock: parseInt(form.stock.value, 10) || 0,
      image: form.image.value || null,
      category: form.category.value,
      slug: form.slug.value.trim(),
      status: form.status.value ,
      id_store: parseInt(id_store, 0),
    }

    const res = await fetch(`${API_URL}/product`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const product = await res.json();

    if (!res.ok) {
      const errors = product.errors || [{ message: product.error || 'Erro ao criar produto' }];
      msg.innerHTML = errors.map(e => `<div>${e.message || e.path?.[0] + ': ' + e.message}</div>`).join('');
      msg.className = 'message error';
      return;
    }

    msg.textContent = 'Produto criado com sucesso!';
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
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getStatus()) {
    window.location.href = 'login.html';
    return;
  }

  setupImageUpload('image-input', 'image-preview', 'clear-image', 'image_url');
  setupSlugAutoFill();

  const form = document.getElementById('product-form');
  form?.addEventListener('submit', createProduct);
});