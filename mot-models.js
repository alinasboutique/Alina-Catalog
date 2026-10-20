/* SETURI PENTRU MOȚ — funcționalitățile sunt izolate aici.
   Nu modificăm designul paginii principale.
   Modelele și fotografiile sunt încărcate din catalogul existent. */
(() => {
  const SB_URL = 'https://zbfqhmiqjcvicqlidswo.supabase.co';
  const SB_KEY = 'sb_publishable_d81c4EtU4mkkqgBnVQi9HQ_nf7M2zFb';
  const API = SB_URL + '/rest/v1';
  const HEADERS = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
  const BUCKET = 'mot-models';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  async function api(path) {
    const r = await fetch(API + path, { headers: HEADERS, cache: 'no-store' });
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
  let selectedPhotoUrl = '';
  let selectedTray = '70';
  let selectedChildPhoto = 'nu';

  function sortRows(rows) {
    return [...rows].sort((a, b) => {
      const ao = Number(a.display_order ?? a.sort_order ?? 999999);
      const bo = Number(b.display_order ?? b.sort_order ?? 999999);
      return ao - bo;
    });
  }

  function getProductPhotos(product) {
    if (!product) return [];
    const ids = new Set([
      product.id, product.product_id, product.model_id, product.catalog_product_id
    ].filter(v => v !== undefined && v !== null && String(v) !== '').map(String));

    return sortRows(photos.filter(p => {
      const pids = [p.product_id, p.model_id, p.catalog_product_id, p.catalog_product]
        .filter(v => v !== undefined && v !== null && String(v) !== '')
        .map(String);
      return pids.some(id => ids.has(id));
    }))
      .map(p => p.image_url || p.url || p.path || p.file_path || p.photo_url || p.image || p.src)
      .filter(Boolean)
      .map(photoUrl);
  }

  function photoGallery(product) {
    const urls = getProductPhotos(product);
    if (!urls.length) return `<div class="mot-no-photo">Fotografiile acestui model nu sunt disponibile.</div>`;
    return `<div class="mot-gallery">${urls.slice(0, 12).map((u, i) => `
      <button type="button" class="mot-photo" data-full="${esc(u)}" aria-label="Vezi fotografia ${i + 1}">
        <img src="${esc(u)}" alt="${esc(product.name || 'Model set moț')}" loading="lazy" onerror="this.closest('.mot-photo').classList.add('mot-image-error')">
      </button>`).join('')}</div>`;
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
      selectedPhotoUrl = '';
      if ($('modelChoice')) $('modelChoice').value = selectedModel?.name || '';
      render();
      renderSummarySafe();
      $('personalizare')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    grid.querySelectorAll('.mot-photo').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const card = btn.closest('[data-model-id]');
      const model = products.find(p => String(p.id) === String(card?.dataset.modelId));
      openLightbox(btn.dataset.full, model);
    });
  }

  function openLightbox(url, model) {
    let box = $('motLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motLightbox';
      box.className = 'mot-lightbox';
      box.innerHTML = `<button type="button" class="mot-lightbox-close" aria-label="Închide">×</button>
        <div class="mot-lightbox-inner">
          <img alt="Fotografie model">
          <h3></h3>
          <button type="button" class="mot-lightbox-select">Alege această fotografie</button>
        </div>`;
      document.body.appendChild(box);
      box.addEventListener('click', e => {
        if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open');
      });
      box.querySelector('.mot-lightbox-select').onclick = e => {
        e.stopPropagation();
        const img = box.querySelector('img');
        selectedModel = products.find(p => String(p.id) === String(box.dataset.modelId)) || selectedModel;
        selectedPhotoUrl = img.src;
        if ($('modelChoice')) $('modelChoice').value = selectedModel?.name || '';
        box.classList.remove('open');
        render();
        renderSummarySafe();
        $('personalizare')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    }
    box.dataset.modelId = model?.id ?? '';
    box.querySelector('img').src = url;
    box.querySelector('img').alt = model?.name || 'Fotografie model';
    box.querySelector('h3').textContent = model?.name || 'Model set moț';
    box.classList.add('open');
  }

  function installCustomOptions() {
    const custom = $('personalizare');
    if (!custom) return;
    const form = custom.querySelector('.form-grid');
    if (!form) return;

    /* Nu ștergem label-ul "Tema dorită". În codul anterior era șters împreună
       cu inputul ascuns #tray, ceea ce elimina și câmpul în care clienta scrie tema. */
    const oldTray = $('tray');
    if (oldTray) oldTray.type = 'hidden';

    let trayBox = $('motCustomTrayBox');
    if (!trayBox) {
      trayBox = document.createElement('div');
      trayBox.id = 'motCustomTrayBox';
      trayBox.className = 'mot-custom-options';
      trayBox.innerHTML = `
        <h3>Dacă nu găsești tematica dorită</h3>
        <p class="mot-custom-note">Scrie tema dorită în câmpul de mai sus și alege tipul de tavă.</p>
        <div class="mot-choice-row">
          <button type="button" class="mot-choice active" data-tray="70">Tavă dreptunghiulară £70</button>
          <button type="button" class="mot-choice" data-tray="80">Tavă rotundă £80</button>
        </div>`;
      form.insertAdjacentElement('afterend', trayBox);
    }

    trayBox.querySelectorAll('[data-tray]').forEach(btn => btn.onclick = () => {
      selectedTray = btn.dataset.tray;
      if (oldTray) oldTray.value = selectedTray;
      trayBox.querySelectorAll('[data-tray]').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      renderSummarySafe();
    });

    const photoBox = custom.querySelector('.photo-option');
    if (photoBox) {
      photoBox.querySelectorAll('.photo-choice-btn').forEach(btn => btn.onclick = () => {
        selectedChildPhoto = btn.dataset.photo === 'da' ? 'da' : 'nu';
        photoBox.querySelectorAll('.photo-choice-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        renderSummarySafe();
      });
    }

    const dateInput = $('childDate');
    const dateLabel = dateInput?.closest('label');
    if (dateLabel) {
      const firstText = Array.from(dateLabel.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
      if (firstText) firstText.textContent = 'Data (opțional)';
    }

    renderSummarySafe();
  }

  function renderSummarySafe() {
    if (typeof window.renderSummary === 'function') {
      try { window.renderSummary(); } catch (e) { console.warn(e); }
    }
    updateCustomSummary();
  }

  function updateCustomSummary() {
    const box = $('motCustomTrayBox');
    if (box) box.querySelectorAll('[data-tray]').forEach(b => b.classList.toggle('active', b.dataset.tray === selectedTray));
    const total = $('total');
    if (total) {
      const photo = selectedChildPhoto === 'da' ? 5 : 0;
      const shirts = document.querySelectorAll('#shirtRows .shirt-row').length;
      const shipping = shirts ? 8.95 : 5.95;
      total.textContent = `Total: £${(Number(selectedTray) + photo + shipping).toFixed(2)}`;
    }
  }

  function installWhatsAppOrder() {
    const button = $('orderWhatsApp');
    if (!button || button.dataset.motWhatsappInstalled === '1') return;
    button.dataset.motWhatsappInstalled = '1';

    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const name = $('childName')?.value?.trim() || '';
      const date = $('childDate')?.value?.trim() || '';
      const theme = $('theme')?.value?.trim() || '';
      const message = $('trayMessage')?.value?.trim() || '';
      const deliveryName = $('deliveryName')?.value?.trim() || '';
      const phone = $('phone')?.value?.trim() || '';
      const address = $('address')?.value?.trim() || '';
      const postcode = $('postcode')?.value?.trim() || '';
      const modelName = selectedModel?.name || $('modelChoice')?.value?.trim() || 'Tematică la alegere';
      const modelPhoto = selectedPhotoUrl || getProductPhotos(selectedModel)[0] || '';
      const photoChoice = selectedChildPhoto === 'da' ? 'Da, fotografie copil +£5' : 'Fără fotografie';

      const lines = [
        'Bună! Doresc să comand un set pentru moț.',
        `Model: ${modelName}`,
        `Tavă: ${selectedTray === '80' ? 'rotundă £80' : 'dreptunghiulară £70'}`,
        name ? `Numele copilului: ${name}` : '',
        date ? `Data: ${date}` : '',
        theme ? `Tema: ${theme}` : '',
        message ? `Mesaj pentru tăviță: ${message}` : '',
        `Fotografie copil: ${photoChoice}`,
        deliveryName ? `Nume livrare: ${deliveryName}` : '',
        phone ? `Telefon: ${phone}` : '',
        address ? `Adresă: ${address}` : '',
        postcode ? `Cod poștal: ${postcode}` : '',
        modelPhoto ? `Fotografia modelului ales: ${modelPhoto}` : ''
      ].filter(Boolean).join('\n');

      window.open('https://wa.me/447742444493?text=' + encodeURIComponent(lines), '_blank', 'noopener');
    }, true);
  }

  async function load() {
    const grid = $('modelGrid');
    if (!grid) return;

    /* Instalăm opțiunile înainte de orice request. Astfel un eșec temporar al
       bazei de date nu poate șterge controalele din formular. */
    installCustomOptions();
    installWhatsAppOrder();

    try {
      /* Folosim filtrul de categorie folosit de catalogul existent: "Seturi pentru Moț".
         Nu presupunem că există categorii separate în baza de date pentru Fetiță/Băiat. */
      let allProducts = await api(`/catalog_products?select=*&category=eq.${encodeURIComponent('Seturi pentru Moț')}`);
      if (!Array.isArray(allProducts) || !allProducts.length) {
        allProducts = await api('/catalog_products?select=*');
      }
      products = sortRows((Array.isArray(allProducts) ? allProducts : []).filter(p => {
        const text = norm([p.category, p.subcategory, p.sub_category, p.product_category, p.name, p.description].filter(Boolean).join(' '));
        return text.includes('seturi pentru mot') || text.includes('set pentru mot') || /\bmot\b/.test(text);
      }));

      try {
        photos = await api('/catalog_product_photos?select=*');
      } catch (photoErr) {
        console.error('Fotografiile seturilor de moț:', photoErr);
        photos = [];
      }

      render();
      installCustomOptions();
      installWhatsAppOrder();
    } catch (err) {
      console.error('Seturi pentru moț:', err);
      products = [];
      photos = [];
      render();
      installCustomOptions();
      installWhatsAppOrder();
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .mot-model-card{background:#fff;border:1px solid #eadbd5;border-radius:18px;padding:10px;overflow:hidden;box-shadow:0 8px 24px rgba(105,61,67,.06)}
    .mot-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#f8eee9;border-radius:13px;padding:5px;overflow:hidden}
    .mot-photo{border:0;padding:0;background:transparent;cursor:zoom-in;overflow:hidden;border-radius:8px;display:block;min-width:0}
    .mot-photo:first-child{grid-column:span 2;grid-row:span 2}
    .mot-photo img{display:block;width:100%;aspect-ratio:1;object-fit:cover;transition:transform .2s ease}
    .mot-photo:hover img{transform:scale(1.035)}
    .mot-photo.mot-image-error{background:#f3e5e1;min-height:80px}
    .mot-model-info{padding:5px 3px 3px}.mot-model-info h3{font:500 22px/1.2 Georgia,serif!important;color:#68434a!important;margin:10px 0 5px!important}
    .mot-price{font-weight:800;color:#7b3f4b;margin:0 0 8px}.mot-description{font-size:12px;line-height:1.5;color:#806f70;margin:0 0 10px}
    .mot-select{width:100%;border:1px solid #c98a98;border-radius:10px;background:#fff;color:#7b3f4b;padding:10px;font-weight:800;cursor:pointer}
    .mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}.mot-selected .mot-select{background:#c4778b;color:#fff}
    .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
    .mot-custom-options{margin:18px 0;padding:16px;border:1px solid #eadbd5;border-radius:14px;background:#fffaf8}
    .mot-custom-options h3{margin:0 0 5px;color:#68434a;font:500 20px Georgia,serif}
    .mot-custom-note{margin:0 0 12px;color:#806f70;font-size:12px}
    .mot-choice-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .mot-choice{border:1px solid #d8aeb6;border-radius:10px;background:#fff;color:#7b3f4b;padding:11px 10px;font-weight:800;cursor:pointer}
    .mot-choice.active{background:#7b3f4b;color:#fff;border-color:#7b3f4b}
    .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:25px;z-index:9999}
    .mot-lightbox.open{display:flex}.mot-lightbox-inner{position:relative;max-width:min(1100px,94vw);max-height:94vh;background:#fffaf7;border-radius:18px;padding:16px;box-shadow:0 15px 50px rgba(0,0,0,.35);text-align:center}
    .mot-lightbox img{display:block;max-width:min(88vw,1000px);max-height:78vh;object-fit:contain;border-radius:12px;margin:auto}
    .mot-lightbox h3{margin:10px 0;color:#68434a;font:500 21px Georgia,serif}
    .mot-lightbox-select{border:1px solid #c98a98;border-radius:10px;background:#7b3f4b;color:#fff;padding:10px 18px;font-weight:800;cursor:pointer}
    .mot-lightbox-close{position:absolute;top:10px;right:10px;width:40px;height:40px;border:1px solid #dfc4c7;border-radius:50%;background:#fff;color:#7b3f4b;font-size:26px;cursor:pointer;z-index:2}
    @media(max-width:700px){.mot-gallery{grid-template-columns:repeat(3,1fr)}.mot-model-info h3{font-size:18px!important}.mot-select{font-size:12px;padding:9px 6px}.mot-choice-row{grid-template-columns:1fr}.mot-lightbox{padding:10px}.mot-lightbox-inner{padding:10px}.mot-lightbox img{max-width:92vw;max-height:72vh}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    genderFilter = tab.dataset.gender;
    selectedModel = null;
    selectedPhotoUrl = '';
    render();
  }));

  load();
})();
