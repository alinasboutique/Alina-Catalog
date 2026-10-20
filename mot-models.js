/* SETURI PENTRU MOT — folosim catalogul actual.
   Nu modificam designul paginii principale.
   Modelele sunt citite din catalog_products, iar fotografiile din catalog_product_photos.
*/
(() => {
  const SB_URL = 'https://zbfqhmiqjcvicqlidswo.supabase.co';
  const SB_KEY = 'sb_publishable_d81c4EtU4mkkqgBnVQi9HQ_nf7M2zFb';
  const API = SB_URL + '/rest/v1';
  const HEADERS = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
  const BUCKET = 'catalog';
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
    clean = clean.replace(/^catalog\//i, '');
    clean = clean.replace(/^mot-models\//i, '');
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${clean}`;
  }

  function gender(product) {
    const text = norm([
      product.gender,
      product.sex,
      product.subcategory,
      product.sub_category,
      product.product_gender,
      product.audience,
      product.category,
      product.name,
      product.description
    ].filter(Boolean).join(' '));
    if (/fetit|fetita|fetite|girl|fata/.test(text)) return 'fata';
    if (/baiat|baietel|baieti|boy/.test(text)) return 'baiat';
    return '';
  }

  let products = [];
  let photos = [];
  let genderFilter = 'fata';
  let selectedModel = null;
  let selectedTray = '70';
  let selectedChildPhoto = 'nu';

  function productPhotoRows(product) {
    if (!product) return [];
    const ids = new Set([
      String(product.id ?? ''),
      String(product.product_id ?? ''),
      String(product.model_id ?? '')
    ].filter(Boolean));
    return photos.filter(p => {
      const photoIds = [p.product_id, p.model_id, p.catalog_product_id, p.catalog_product].filter(v => v !== undefined && v !== null).map(String);
      return photoIds.some(id => ids.has(id));
    });
  }

  function getProductPhotos(product) {
    return productPhotoRows(product)
      .sort((a,b) => Number(a.display_order || a.sort_order || 0) - Number(b.display_order || b.sort_order || 0))
      .map(p => p.image_url || p.url || p.path || p.file_path || p.photo_url || p.image || p.src)
      .filter(Boolean)
      .map(photoUrl);
  }

  function photoGallery(product) {
    const urls = getProductPhotos(product);
    if (!urls.length) return `<div class="mot-no-photo">Fotografiile acestui model nu sunt disponibile.</div>`;
    return `<div class="mot-gallery">${urls.slice(0,12).map((u,i) => `
      <button type="button" class="mot-photo" data-full="${esc(u)}" aria-label="Vezi fotografia ${i+1}">
        <img src="${esc(u)}" alt="${esc(product.name || 'Model set moț')}" loading="lazy" onerror="this.closest('.mot-photo').style.display='none'">
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
      if ($('modelChoice')) $('modelChoice').value = selectedModel?.name || '';
      render();
      renderSummarySafe();
      $('personalizare')?.scrollIntoView({behavior:'smooth', block:'start'});
    });

    grid.querySelectorAll('.mot-photo').forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      const card = btn.closest('[data-model-id]');
      const model = products.find(p => String(p.id) === String(card?.dataset.modelId));
      openLightbox(btn.dataset.full, model?.name || 'Model set moț');
    });
  }

  function openLightbox(url, title) {
    let box = $('motLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motLightbox';
      box.className = 'mot-lightbox';
      box.innerHTML = '<button type="button" class="mot-lightbox-close" aria-label="Închide">×</button><div class="mot-lightbox-inner"><img alt="Fotografie model"><h3></h3><button type="button" class="mot-lightbox-select">Alege această fotografie</button></div>';
      document.body.appendChild(box);
      box.addEventListener('click', e => {
        if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open');
      });
      box.querySelector('.mot-lightbox-select').onclick = e => {
        e.stopPropagation();
        const urlNow = box.querySelector('img').src;
        if (selectedModel) {
          selectedModel.selectedPhotoUrl = urlNow;
          box.classList.remove('open');
          renderSummarySafe();
        }
      };
    }
    box.querySelector('img').src = url;
    box.querySelector('h3').textContent = title;
    box.classList.add('open');
  }

  function installCustomOptions() {
    const custom = $('personalizare');
    if (!custom) return;

    const form = custom.querySelector('.form-grid');
    if (!form) return;

    const oldTray = $('tray');
    if (oldTray) {
      const wrap = oldTray.closest('label');
      if (wrap) wrap.remove();
    }

    let trayBox = $('motCustomTrayBox');
    if (!trayBox) {
      trayBox = document.createElement('div');
      trayBox.id = 'motCustomTrayBox';
      trayBox.className = 'mot-custom-options';
      trayBox.innerHTML = `
        <h3>Dacă nu găsești tematica dorită</h3>
        <p class="mot-custom-note">Scrie tema dorită și alege tipul de tavă.</p>
        <div class="mot-choice-row">
          <button type="button" class="mot-choice active" data-tray="70">Tavă dreptunghiulară £70</button>
          <button type="button" class="mot-choice" data-tray="80">Tavă rotundă £80</button>
        </div>`;
      form.insertAdjacentElement('afterend', trayBox);
    }

    trayBox.querySelectorAll('[data-tray]').forEach(btn => btn.onclick = () => {
      selectedTray = btn.dataset.tray;
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
      try { window.renderSummary(); } catch(e) { console.warn(e); }
    }
    updateCustomSummary();
  }

  function updateCustomSummary() {
    const box = $('motCustomTrayBox');
    if (box) box.querySelectorAll('[data-tray]').forEach(b => b.classList.toggle('active', b.dataset.tray === selectedTray));
    const total = $('total');
    if (total) {
      const shipping = 5.95;
      const photo = selectedChildPhoto === 'da' ? 5 : 0;
      total.textContent = `£${(Number(selectedTray) + photo + shipping).toFixed(2)}`;
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
      const modelPhoto = selectedModel?.selectedPhotoUrl || getProductPhotos(selectedModel)[0] || '';
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
    try {
      /* Nu mai filtrăm printr-un nume exact de categorie. Asta era cauza principală
         pentru care lista putea rămâne goală atunci când baza folosea o altă formă
         a denumirii (cu/fără diacritice sau alt separator). Luăm toate produsele
         publice și selectăm local strict modelele de moț după câmpurile lor. */
      const [allProducts, photoRows] = await Promise.all([
        api('/catalog_products?select=*&order=display_order.asc,created_at.desc'),
        api('/catalog_product_photos?select=*&order=display_order.asc')
      ]);

      products = (Array.isArray(allProducts) ? allProducts : []).filter(p => {
        const text = norm([
          p.category, p.subcategory, p.sub_category, p.product_category,
          p.name, p.description
        ].filter(Boolean).join(' '));
        return text.includes('mot') || text.includes('motul') || text.includes('mot ');
      });
      photos = Array.isArray(photoRows) ? photoRows : [];

      render();
      installCustomOptions();
      installWhatsAppOrder();
    } catch (err) {
      console.error('Seturi pentru moț:', err);
      const grid = $('modelGrid');
      if (grid) grid.innerHTML = '<div class="mot-empty">Modelele și fotografiile nu au putut fi încărcate momentan. Reîncarcă pagina.</div>';
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
    .mot-model-info{padding:5px 3px 3px}.mot-model-info h3{font:500 22px/1.2 Georgia,serif!important;color:#68434a!important;margin:10px 0 5px!important}
    .mot-price{font-weight:800;color:#7b3f4b;margin:0 0 8px}.mot-description{font-size:12px;line-height:1.5;color:#806f70;margin:0 0 10px}
    .mot-select{width:100%;border:1px solid #c98a98;border-radius:10px;background:#fff;color:#7b3f4b;padding:10px;font-weight:800;cursor:pointer}
    .mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}.mot-selected .mot-select{background:#c4778b;color:#fff}
    .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
    .mot-custom-options{margin:18px 0;padding:14px;border:1px solid #eadbd5;border-radius:14px;background:#fbf3f0}
    .mot-custom-options h3{margin:0 0 5px;font:600 17px Georgia,serif;color:#68434a}.mot-custom-note{margin:0 0 10px;color:#806f70;font-size:12px}
    .mot-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mot-choice{border:1px solid #e3cfd0;background:#fff;color:#7b3f4b;border-radius:10px;padding:11px 8px;font-weight:800;cursor:pointer}.mot-choice.active{background:#7b3f4b;color:#fff;border-color:#7b3f4b}
    .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:25px;z-index:9999}.mot-lightbox.open{display:flex}
    .mot-lightbox-inner{position:relative;max-width:min(1000px,94vw);max-height:92vh;background:#fffaf7;border-radius:16px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px}.mot-lightbox img{max-width:90vw;max-height:75vh;object-fit:contain;border-radius:10px}.mot-lightbox-inner h3{margin:0;color:#68434a;font:500 21px Georgia,serif}.mot-lightbox-select{border:0;background:#7b3f4b;color:#fff;border-radius:20px;padding:10px 20px;font-weight:800;cursor:pointer}.mot-lightbox-close{position:absolute;top:18px;right:20px;width:42px;height:42px;border:0;border-radius:50%;background:#fff;color:#7b3f4b;font-size:28px;cursor:pointer;z-index:10000}
    @media(max-width:700px){.mot-choice-row{grid-template-columns:1fr}.mot-gallery{grid-template-columns:repeat(3,1fr)}.mot-model-info h3{font-size:18px!important}}
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    genderFilter = tab.dataset.gender;
    selectedModel = null;
    render();
  }));

  load();
})();