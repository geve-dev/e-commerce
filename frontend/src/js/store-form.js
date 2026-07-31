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

// === Image upload handlers ===
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

// === Slug auto-generate ===
function setupSlugAutoFill() {
  const nameInput = document.getElementById('store_name');
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

// === Submit ===
async function handleSubmit(event) {
  event.preventDefault();

  const btn = document.querySelector('.btn-save-store');
  const msg = document.getElementById('form-message');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

  try {
    const form = document.getElementById('store-form');
    const data = {
      store_name: form.store_name.value.trim(),
      slug: form.slug.value.trim(),
      niche: form.niche.value,
      description: form.description.value.trim(),
      contact_email: form.contact_email.value.trim(),
      contact_phone: form.contact_phone.value.trim(),
      cnpj: form.cnpj.value.trim(),
      logo: form.logo_url.value || null,
      banner: form.banner_url.value || null,
    };

    const res = await fetch(`${API_URL}/store`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const errors = result.errors || [{ message: result.error || 'Erro ao criar loja' }];
      msg.innerHTML = errors.map(e => `<div>${e.message || e.path?.[0] + ': ' + e.message}</div>`).join('');
      msg.className = 'message error';
      return;
    }

    msg.textContent = 'Loja criada com sucesso! Aguarde aprovação.';
    msg.className = 'message success';
    form.reset();
    ['logo', 'banner'].forEach(id => {
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
      window.location.href = 'my-stores.html';
    }, 2000);
  } catch (error) {
    msg.textContent = 'Erro de conexão. Verifique o servidor.';
    msg.className = 'message error';
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Criar Loja';
  }
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  if (!getStatus()) {
    window.location.href = 'login.html';
    return;
  }

  setupImageUpload('logo-input', 'logo-preview', 'clear-logo', 'logo_url');
  setupImageUpload('banner-input', 'banner-preview', 'clear-banner', 'banner_url');
  setupSlugAutoFill();

  const form = document.getElementById('store-form');
  form?.addEventListener('submit', handleSubmit);
});
