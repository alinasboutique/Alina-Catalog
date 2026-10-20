/* SETURI PENTRU MOȚ — sursa reală a modelelor este Supabase.
   Acest fișier controlează exclusiv galeria și opțiunile pentru Seturi pentru Moț.
   Nu schimbă designul paginii principale. */
(() => {
  const SB_URL = 'https://zbfqhmiqjcvicqlidswo.supabase.co';
  const SB_KEY = 'sb_publishable_d81c4EtU4mkkqgBnVQi9HQ_nf7M2zFb';
  const API = SB_URL + '/rest/v1';
  const HEADERS = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
  const BUCKET = 'mot-models';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));

  let models = [];
  let modelPhotos = [];
  let genderFilter = 'fetita';
  let selectedModel = null;
  let selectedPhotoUrl = '';
  let selectedTray = '70';
  let selectedChildPhoto = 'nu';

  async function get(path) {
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
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${clean}`;
  }

  function photosFor(model) {
    if (!model) return [];
    return modelPhotos
      .filter(p => String(p.model_id) === String(model.id))
      .sort((a,b) => Number(a.display_order ?? 999999) - Number(b.display_order ?? 999999))
      .map(p => p.image_url || p.url || p.path || p.file_path || p.photo_url || p.image || p.src)
      .filter(Boolean)
      .map(photoUrl);
  }

  function renderModels() {
    const grid = $('modelGrid');
    if (!grid) return;
    const list = models.filter(m => {
      const c = String(m.category || m.gender || '').toLowerCase();
      return genderFilter === 'fetita' ? (c === 'fetita' || c === 'fata') : c === 'baiat';
    });

    if (!list.length) {
      grid.innerHTML = '<div class="mot-empty">Nu am găsit încă modele pentru această categorie.</div>';
      return;
    }

    grid.innerHTML = list.map(model => {
      const urls = photosFor(model);
      const gallery = urls.length
        ? `<div class="mot-gallery">${urls.slice(0,12).map((u,i) => `<button type="button" class="mot-photo" data-model-id="${esc(model.id)}" data-full="${esc(u)}" aria-label="Vezi fotografia ${i + 1}"><img src="${esc(u)}" alt="${esc(model.name || 'Model set moț')}" loading="lazy"></button>`).join('')}</div>`
        : '<div class="mot-no-photo">Fotografiile acestui model nu sunt disponibile.</div>';
      return `<article class="mot-model-card ${selectedModel && String(selectedModel.id) === String(model.id) ? 'mot-selected' : ''}" data-model-id="${esc(model.id)}">
        ${gallery}
        <div class="mot-model-info">
          <h3>${esc(model.name || 'Model set moț')}</h3>
          <p class="mot-price">Tavă dreptunghiulară £70 · Tavă rotundă £80</p>
          <button type="button" class="mot-select">${selectedModel && String(selectedModel.id) === String(model.id) ? '✓ Model ales' : 'Alege modelul acesta'}</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.mot-select').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const model = models.find(m => String(m.id) === String(button.closest('[data-model-id]').dataset.modelId));
        selectModel(model, '');
      });
    });
    grid.querySelectorAll('.mot-photo').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const model = models.find(m => String(m.id) === String(button.dataset.modelId));
        openLightbox(button.dataset.full, model);
      });
    });
  }

  function selectModel(model, photo) {
    if (!model) return;
    selectedModel = model;
    selectedPhotoUrl = photo || '';
    if ($('modelChoice')) $('modelChoice').value = model.name || '';
    renderModels();
    renderSummarySafe();
    $('personalizare')?.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function openLightbox(url, model) {
    let box = $('motLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motLightbox'; box.className = 'mot-lightbox';
      box.innerHTML = `<div class="mot-lightbox-inner"><button type="button" class="mot-lightbox-close" aria-label="Închide">×</button><img alt="Fotografie model"><h3></h3><button type="button" class="mot-lightbox-select">Alege această fotografie</button></div>`;
      document.body.appendChild(box);
      box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open'); });
      box.querySelector('.mot-lightbox-select').addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const img = box.querySelector('img');
        const currentModel = models.find(m => String(m.id) === String(box.dataset.modelId));
        selectModel(currentModel, img.src);
        box.classList.remove('open');
      });
    }
    box.dataset.modelId = model?.id ?? '';
    box.querySelector('img').src = url;
    box.querySelector('img').alt = model?.name || 'Fotografie model';
    box.querySelector('h3').textContent = model?.name || 'Model set moț';
    box.classList.add('open');
  }

  /* catalog.js avea un al doilea sistem de modele demo. Îl scoatem doar de pe tab-uri,
     fără să modificăm restul catalogului, ca galeria reală să rămână singura sursă. */
  function takeOverTabs() {
    document.querySelectorAll('.tab').forEach(oldTab => {
      const tab = oldTab.cloneNode(true);
      oldTab.replaceWith(tab);
      tab.addEventListener('click', () => {
        genderFilter = tab.dataset.gender === 'baiat' ? 'baiat' : 'fetita';
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        tab.classList.add('active');
        renderModels();
      });
    });
  }

  function installCustomOptions() {
    const custom = $('personalizare');
    const form = custom?.querySelector('.form-grid');
    if (!form) return;
    const trayInput = $('tray');
    if (trayInput) trayInput.type = 'hidden';

    let box = $('motCustomTrayBox');
    if (!box) {
      box = document.createElement('div'); box.id = 'motCustomTrayBox'; box.className = 'mot-custom-options';
      box.innerHTML = `<h3>Dacă nu găsești tematica dorită</h3><p>Scrie tema dorită în câmpul „Tema dorită”, apoi alege tipul de tavă.</p><div class="mot-choice-row"><button type="button" class="mot-choice active" data-tray="70">Tavă dreptunghiulară £70</button><button type="button" class="mot-choice" data-tray="80">Tavă rotundă £80</button></div>`;
      form.insertAdjacentElement('afterend', box);
    }
    box.querySelectorAll('[data-tray]').forEach(btn => btn.onclick = () => {
      selectedTray = btn.dataset.tray;
      if (trayInput) trayInput.value = selectedTray;
      box.querySelectorAll('[data-tray]').forEach(x => x.classList.toggle('active', x === btn));
      renderSummarySafe();
    });

    const dateInput = $('childDate');
    const dateLabel = dateInput?.closest('label');
    if (dateLabel) {
      const textNode = Array.from(dateLabel.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = 'Data (opțional)';
    }

    const photoBox = custom.querySelector('.photo-option');
    if (photoBox) photoBox.querySelectorAll('.photo-choice-btn').forEach(btn => btn.onclick = () => {
      selectedChildPhoto = btn.dataset.photo === 'da' ? 'da' : 'nu';
      photoBox.querySelectorAll('.photo-choice-btn').forEach(x => x.classList.toggle('active', x === btn));
      renderSummarySafe();
    });
  }

  function renderSummarySafe() {
    if (typeof window.renderSummary === 'function') { try { window.renderSummary(); } catch(e) { console.warn(e); } }
    const total = $('total');
    if (total) {
      const photo = selectedChildPhoto === 'da' ? 5 : 0;
      const shirts = document.querySelectorAll('#shirtRows .shirt-row').length;
      const shipping = shirts ? 8.95 : 5.95;
      total.textContent = `Total: £${(Number(selectedTray) + photo + shipping).toFixed(2)}`;
    }
  }

  function installWhatsApp() {
    const button = $('orderWhatsApp');
    if (!button || button.dataset.motWhatsappInstalled === '1') return;
    button.dataset.motWhatsappInstalled = '1';
    button.addEventListener('click', e => {
      e.preventDefault(); e.stopImmediatePropagation();
      const name = $('childName')?.value?.trim() || '';
      const date = $('childDate')?.value?.trim() || '';
      const theme = $('theme')?.value?.trim() || '';
      const message = $('trayMessage')?.value?.trim() || '';
      const deliveryName = $('deliveryName')?.value?.trim() || '';
      const phone = $('phone')?.value?.trim() || '';
      const address = $('address')?.value?.trim() || '';
      const postcode = $('postcode')?.value?.trim() || '';
      const modelName = selectedModel?.name || $('modelChoice')?.value?.trim() || 'Tematică la alegere';
      const modelPhoto = selectedPhotoUrl || (selectedModel ? photosFor(selectedModel)[0] : '');
      const lines = [
        'Bună! Doresc să comand un set pentru moț.',
        `Model ales: ${modelName}`,
        `Tavă: ${selectedTray === '80' ? 'rotundă £80' : 'dreptunghiulară £70'}`,
        name ? `Numele copilului: ${name}` : '',
        date ? `Data: ${date}` : '',
        theme ? `Tema dorită: ${theme}` : '',
        message ? `Mesaj pentru tăviță: ${message}` : '',
        `Fotografie copil: ${selectedChildPhoto === 'da' ? 'Da (+£5)' : 'Nu'}`,
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
    const grid = $('modelGrid'); if (!grid) return;
    installCustomOptions(); installWhatsApp(); takeOverTabs();
    try {
      /* Acestea sunt exact tabelele folosite de catalogul vechi pentru modelele de moț și fotografiile lor. */
      const [loadedModels, loadedPhotos] = await Promise.all([
        get('/mot_models?select=*&is_active=eq.true&order=display_order.asc,name.asc'),
        get('/mot_model_photos?select=*&order=display_order.asc')
      ]);
      models = Array.isArray(loadedModels) ? loadedModels : [];
      modelPhotos = Array.isArray(loadedPhotos) ? loadedPhotos : [];
      renderModels();
    } catch (err) {
      console.error('Seturi pentru moț:', err);
      grid.innerHTML = '<div class="mot-empty">Modelele și fotografiile nu au putut fi încărcate momentan. Reîncarcă pagina.</div>';
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
    .mot-model-info{padding:5px 3px 3px}.mot-model-info h3{font:500 22px/1.2 Georgia,serif!important;color:#68434a!important;margin:10px 0 5px!important}.mot-price{font-weight:800;color:#7b3f4b;margin:0 0 10px}.mot-select{width:100%;border:1px solid #c98a98;border-radius:10px;background:#fff;color:#7b3f4b;padding:10px;font-weight:800;cursor:pointer}.mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}.mot-selected .mot-select{background:#c4778b;color:#fff}
    .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
    .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:20px;z-index:9999}.mot-lightbox.open{display:flex}.mot-lightbox-inner{position:relative;max-width:94vw;max-height:94vh;background:#fffaf7;border-radius:16px;padding:14px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)}.mot-lightbox img{display:block;max-width:90vw;max-height:78vh;object-fit:contain;border-radius:10px;margin:auto}.mot-lightbox h3{font:500 20px Georgia,serif;color:#68434a;margin:9px 50px 8px}.mot-lightbox-close{position:absolute;right:8px;top:8px;width:38px;height:38px;border:1px solid #dfc4c7;background:#fff;border-radius:50%;color:#7b3f4b;font-size:23px;cursor:pointer;z-index:2}.mot-lightbox-select{border:0;border-radius:10px;background:#7b3f4b;color:#fff;padding:11px 18px;font-weight:800;cursor:pointer}
    .mot-custom-options{margin-top:18px;padding:16px;border:1px solid #eadbd5;border-radius:14px;background:#fffaf8}.mot-custom-options h3{margin:0 0 5px;color:#68434a;font:500 19px Georgia,serif}.mot-custom-options p{margin:0 0 10px;color:#806f70;font-size:12px}.mot-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mot-choice{border:1px solid #d8aeb6;border-radius:9px;background:#fff;color:#7b3f4b;padding:11px 8px;font-weight:800;cursor:pointer}.mot-choice.active{background:#7b3f4b;color:#fff;border-color:#7b3f4b}
    @media(max-width:700px){.mot-gallery{grid-template-columns:repeat(3,1fr)}.mot-model-info h3{font-size:18px!important}.mot-select{font-size:12px;padding:9px 6px}.mot-choice-row{grid-template-columns:1fr}.mot-lightbox{padding:10px}.mot-lightbox-inner{padding:9px}.mot-lightbox img{max-width:92vw;max-height:74vh}}
  `;
  document.head.appendChild(style);
  load();
})();
