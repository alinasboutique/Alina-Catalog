/* Seturi pentru Moț — preia produsele și fotografiile deja existente în catalogul vechi.
   Nu schimbăm designul catalogului actual; folosim doar datele/fotografiile existente. */
(() => {
  const SB_URL = 'https://zbfqhmiqjcvicqlidswo.supabase.co';
  const SB_KEY = 'sb_publishable_d81c4EtU4mkkqgBnVQi9HQ_nf7M2zFb';
  const API = SB_URL + '/rest/v1';
  const HEADERS = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
  // IMPORTANT: fotografiile seturilor de moț din catalogul vechi sunt în acest bucket.
  const BUCKET = 'mot-models';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  async function api(path) {
    const r = await fetch(API + path, { headers: HEADERS });
    const text = await r.text();
    if (!r.ok) throw new Error(text || ('HTTP ' + r.status));
    return text ? JSON.parse(text) : [];
  }

  function photoUrl(value) {
    if (!value) return '';
    const raw = String(value).trim();
    if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw)) return raw;
    let clean = raw.replace(/^\/+/, '');
    clean = clean.replace(/^storage\/v1\/object\/public\/[^/]+\//i, '');
    clean = clean.replace(/^mot-models\//i, '');
    clean = clean.replace(/^catalog\//i, '');
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${clean}`;
  }

  function gender(product) {
    const text = norm([
      product.gender, product.sex, product.subcategory, product.sub_category,
      product.product_gender, product.audience, product.category, product.name,
      product.description, product.personalization_options
    ].filter(Boolean).join(' '));
    if (/fetit|fetita|fetite|girl|fata/.test(text)) return 'fata';
    if (/baiat|baietel|baieti|boy/.test(text)) return 'baiat';
    return '';
  }

  let products = [];
  let photos = [];
  let genderFilter = 'fata';
  let selectedModel = null;

  function photoGallery(product) {
    const list = photos
      .filter(p => String(p.product_id) === String(product.id))
      .sort((a,b) => (Number(a.display_order||0) - Number(b.display_order||0)));
    const urls = list.map(p => p.image_url || p.url || p.path || p.file_path || p.photo_url).filter(Boolean).map(photoUrl);
    if (!urls.length) return `<div class="mot-no-photo">Fotografia modelului nu este disponibilă.</div>`;
    return `<div class="mot-gallery">${urls.slice(0, 12).map((u,i) => `<button type="button" class="mot-photo" data-full="${esc(u)}" aria-label="Vezi fotografia ${i+1}"><img src="${esc(u)}" alt="${esc(product.name || 'Model set moț')}" loading="lazy" onerror="this.closest('.mot-photo').classList.add('mot-image-error');this.style.display='none'"></button>`).join('')}</div>`;
  }

  function render() {
    const grid = $('modelGrid');
    if (!grid) return;
    const list = products.filter(p => gender(p) === genderFilter);
    grid.innerHTML = list.length ? list.map(p => `
      <article class="mot-model-card ${selectedModel?.id === p.id ? 'mot-selected' : ''}" data-model-id="${esc(p.id)}">
        ${photoGallery(p)}
        <div class="mot-model-info">
          <h3>${esc(p.name || 'Model set moț')}</h3>
          <p class="mot-price">Tavă dreptunghiulară £70 · Tavă rotundă £80</p>
          ${p.description ? `<p class="mot-description">${esc(p.description)}</p>` : ''}
          <button type="button" class="mot-select">${selectedModel?.id === p.id ? '✓ Model ales' : 'Alege modelul acesta'}</button>
        </div>
      </article>
    `).join('') : '<div class="mot-empty">Nu am găsit încă modele pentru această categorie.</div>';

    grid.querySelectorAll('.mot-select').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const card = btn.closest('[data-model-id]');
      selectedModel = products.find(p => String(p.id) === String(card.dataset.modelId)) || null;
      if ($('modelChoice')) $('modelChoice').value = selectedModel?.name || '';
      render();
      $('personalizare')?.scrollIntoView({behavior:'smooth', block:'start'});
    });

    grid.querySelectorAll('.mot-photo').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      if (btn.dataset.full) openLightbox(btn.dataset.full);
    });
  }

  function openLightbox(url) {
    let box = $('motLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motLightbox';
      box.className = 'mot-lightbox';
      box.innerHTML = '<button type="button" class="mot-lightbox-close" aria-label="Închide">×</button><img alt="Fotografie model">';
      document.body.appendChild(box);
      box.onclick = e => { if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open'); };
    }
    box.querySelector('img').src = url;
    box.classList.add('open');
  }

  async function load() {
    try {
      const category = encodeURIComponent('Seturi pentru Moț');
      products = await api(`/catalog_products?select=*&category=eq.${category}&order=display_order.asc,created_at.desc`);
      photos = await api('/catalog_product_photos?select=*&order=display_order.asc');
      render();
    } catch (err) {
      console.error('Seturi pentru moț:', err);
      const grid = $('modelGrid');
      if (grid) grid.innerHTML = '<div class="mot-empty">Fotografiile modelelor nu au putut fi încărcate momentan.</div>';
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .mot-model-card{background:#fff;border:1px solid #eadbd5;border-radius:18px;padding:10px;overflow:hidden;box-shadow:0 8px 24px rgba(105,61,67,.06)}
    .mot-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#f8eee9;border-radius:13px;padding:5px;overflow:hidden}
    .mot-photo{border:0;padding:0;background:transparent;cursor:zoom-in;overflow:hidden;border-radius:8px;display:block}
    .mot-photo:first-child{grid-column:span 2;grid-row:span 2}
    .mot-photo img{display:block;width:100%;aspect-ratio:1;object-fit:cover;transition:transform .2s ease}
    .mot-photo:hover img{transform:scale(1.035)}
    .mot-photo.mot-image-error{background:#f3e5e1;min-height:80px}
    .mot-model-info{padding:5px 3px 3px}.mot-model-info h3{font:500 22px/1.2 Georgia,serif!important;color:#68434a!important;margin:10px 0 5px!important}
    .mot-price{font-weight:800;color:#7b3f4b;margin:0 0 8px}.mot-description{font-size:12px;line-height:1.5;color:#806f70;margin:0 0 10px}
    .mot-select{width:100%;border:1px solid #c98a98;border-radius:10px;background:#fff;color:#7b3f4b;padding:10px;font-weight:800;cursor:pointer}
    .mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}.mot-selected .mot-select{background:#c4778b;color:#fff}
    .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
    .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:25px;z-index:9999}
    .mot-lightbox.open{display:flex}.mot-lightbox img{max-width:min(92vw,1100px);max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 15px 50px rgba(0,0,0,.35)}
    .mot-lightbox-close{position:absolute;top:18px;right:22px;width:42px;height:42px;border:0;border-radius:50%;background:#fff;color:#7b3f4b;font-size:28px;cursor:pointer}
    @media(max-width:700px){.mot-gallery{grid-template-columns:repeat(3,1fr)}.mot-model-info h3{font-size:18px!important}.mot-select{font-size:12px;padding:9px 6px}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    genderFilter = tab.dataset.gender;
    selectedModel = null;
    render();
  }));

  load();
})();
