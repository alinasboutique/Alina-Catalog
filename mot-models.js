/* SETURI PENTRU MOȚ — folosește datele existente ale catalogului.
   IMPORTANT: nu schimbă pagina principală și nu folosește Supabase pentru galerie.
   Modelele/fotografiile existente sunt în IndexedDB, baza folosită de catalogul anterior,
   disponibilă pe același domeniu GitHub Pages.
*/
(() => {
  const DB_NAME = 'AlinaCatalogFixed4';
  const STORE_NAME = 'products';
  const $ = id => document.getElementById(id);

  let products = [];
  let genderFilter = 'fetita';
  let selectedModel = null;
  let selectedPhotoUrl = '';
  let selectedTray = '70';
  let selectedChildPhoto = 'nu';

  const esc = s => String(s ?? '').replace(/[&<>\"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'
  }[m]));

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB error'));
    });
  }

  function getAllProducts(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Nu pot citi modelele existente.'));
    });
  }

  function normalize(v) {
    return String(v || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function isMot(p) {
    const text = normalize([p.category, p.categoryName, p.type, p.collection, p.section, p.name].join(' '));
    return text.includes('mot') || text.includes('moț');
  }

  function isGirl(p) {
    const text = normalize([p.category, p.categoryName, p.gender, p.type, p.collection, p.name].join(' '));
    return text.includes('fetit') || text.includes('fata') || text === 'f' || text.includes('girl');
  }

  function isBoy(p) {
    const text = normalize([p.category, p.categoryName, p.gender, p.type, p.collection, p.name].join(' '));
    return text.includes('baiat') || text.includes('baieti') || text === 'b' || text.includes('boy');
  }

  function productPhotos(p) {
    const source = Array.isArray(p?.photos) ? p.photos : [];
    return source.map(item => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      return item.url || item.src || item.image || item.imageUrl || item.path || item.file || item.data || '';
    }).filter(Boolean);
  }

  function renderModels() {
    const grid = $('modelGrid');
    if (!grid) return;

    const list = products.filter(p => {
      if (!isMot(p)) return false;
      return genderFilter === 'fetita' ? isGirl(p) : isBoy(p);
    });

    if (!list.length) {
      grid.innerHTML = '<div class="mot-empty">Nu am găsit încă modele pentru această categorie.</div>';
      return;
    }

    grid.innerHTML = list.map((model, index) => {
      const photos = productPhotos(model);
      const selected = selectedModel === model;
      const gallery = photos.length
        ? `<div class="mot-gallery">${photos.slice(0,12).map((url,i) => `
            <button type="button" class="mot-photo" data-index="${i}" data-model="${index}" aria-label="Vezi fotografia ${i + 1}">
              <img src="${esc(url)}" alt="${esc(model.name || 'Model set moț')}" loading="lazy">
            </button>`).join('')}</div>`
        : '<div class="mot-no-photo">Acest model nu are fotografii salvate în catalog.</div>';

      return `<article class="mot-model-card ${selected ? 'mot-selected' : ''}" data-index="${index}">
        ${gallery}
        <div class="mot-model-info">
          <h3>${esc(model.name || 'Model set moț')}</h3>
          <p class="mot-description">${esc(model.description || 'Personalizează cu nume, fotografie copil, data și mesaj pentru tăviță.')}</p>
          <p class="mot-price">Tavă dreptunghiulară £70 · Tavă rotundă £80</p>
          <button type="button" class="mot-select">${selected ? '✓ Model ales' : 'Alege modelul acesta'}</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.mot-select').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const model = list[Number(button.closest('[data-index]').dataset.index)];
        selectModel(model, '');
      });
    });

    grid.querySelectorAll('.mot-photo').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const model = list[Number(button.closest('[data-index]').dataset.index)];
        const photos = productPhotos(model);
        openLightbox(model, photos, Number(button.dataset.index));
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

  function openLightbox(model, photos, index) {
    let box = $('motLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motLightbox';
      box.className = 'mot-lightbox';
      box.innerHTML = `
        <div class="mot-lightbox-inner">
          <button type="button" class="mot-lightbox-close" aria-label="Închide">×</button>
          <img class="mot-lightbox-image" alt="Fotografie model">
          <h3 class="mot-lightbox-title"></h3>
          <div class="mot-lightbox-thumbs"></div>
          <button type="button" class="mot-lightbox-select">Alege această fotografie</button>
        </div>`;
      document.body.appendChild(box);

      box.addEventListener('click', e => {
        if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open');
      });

      box.querySelector('.mot-lightbox-select').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const current = box._model;
        const currentIndex = Number(box.dataset.photoIndex || 0);
        const currentUrl = productPhotos(current)[currentIndex] || '';
        selectModel(current, currentUrl);
        box.classList.remove('open');
      });
    }

    box._model = model;
    box.dataset.photoIndex = String(index);
    box.querySelector('.mot-lightbox-title').textContent = model.name || 'Model set moț';

    const main = box.querySelector('.mot-lightbox-image');
    const thumbs = box.querySelector('.mot-lightbox-thumbs');

    function showPhoto(i) {
      if (!photos[i]) return;
      box.dataset.photoIndex = String(i);
      main.src = photos[i];
      main.alt = model.name || 'Fotografie model';
      thumbs.querySelectorAll('button').forEach((b,n) => b.classList.toggle('active', n === i));
    }

    thumbs.innerHTML = photos.map((url,i) => `<button type="button" aria-label="Fotografia ${i+1}"><img src="${esc(url)}" alt=""></button>`).join('');
    thumbs.querySelectorAll('button').forEach((button,i) => button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      showPhoto(i);
    }));
    showPhoto(Math.min(index, Math.max(photos.length - 1, 0)));
    box.classList.add('open');
  }

  function installTabs() {
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
      box = document.createElement('div');
      box.id = 'motCustomTrayBox';
      box.className = 'mot-custom-options';
      box.innerHTML = `
        <h3>Dacă nu găsești tematica dorită</h3>
        <p>Scrie tema dorită în câmpul „Tema dorită”, apoi alege tipul de tavă.</p>
        <div class="mot-choice-row">
          <button type="button" class="mot-choice active" data-tray="70">Tavă dreptunghiulară £70</button>
          <button type="button" class="mot-choice" data-tray="80">Tavă rotundă £80</button>
        </div>`;
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
    if (typeof window.renderSummary === 'function') {
      try { window.renderSummary(); } catch(e) { console.warn(e); }
    }
  }

  function installWhatsApp() {
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
      const modelPhoto = selectedPhotoUrl || (selectedModel ? productPhotos(selectedModel)[0] : '');

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

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .mot-model-card{background:#fff;border:1px solid #eadbd5;border-radius:18px;padding:10px;overflow:hidden;box-shadow:0 8px 24px rgba(105,61,67,.06)}
      .mot-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:#f8eee9;border-radius:13px;padding:5px;overflow:hidden}
      .mot-photo{border:0;padding:0;background:transparent;cursor:zoom-in;overflow:hidden;border-radius:8px;display:block;min-width:0}
      .mot-photo:first-child{grid-column:span 2;grid-row:span 2}
      .mot-photo img{display:block;width:100%;aspect-ratio:1;object-fit:cover;transition:transform .2s ease}
      .mot-photo:hover img{transform:scale(1.035)}
      .mot-model-info{padding:5px 3px 3px}
      .mot-model-info h3{font:500 22px/1.2 Georgia,serif!important;color:#68434a!important;margin:10px 0 5px!important}
      .mot-description{font-size:12px;line-height:1.45;color:#806f70;margin:0 0 8px}
      .mot-price{font-weight:800;color:#7b3f4b;margin:0 0 10px}
      .mot-select{width:100%;border:1px solid #c98a98;border-radius:10px;background:#fff;color:#7b3f4b;padding:10px;font-weight:800;cursor:pointer}
      .mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}
      .mot-selected .mot-select{background:#c4778b;color:#fff}
      .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
      .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:20px;z-index:9999}
      .mot-lightbox.open{display:flex}
      .mot-lightbox-inner{position:relative;width:min(1000px,94vw);max-height:94vh;background:#fffaf7;border-radius:16px;padding:14px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .mot-lightbox-image{display:block;max-width:90vw;max-height:70vh;object-fit:contain;border-radius:10px;margin:auto}
      .mot-lightbox-title{font:500 20px Georgia,serif;color:#68434a;margin:9px 50px 8px}
      .mot-lightbox-thumbs{display:flex;gap:7px;overflow-x:auto;padding:3px;justify-content:center}
      .mot-lightbox-thumbs button{border:2px solid transparent;background:#fff;padding:2px;border-radius:8px;cursor:pointer;flex:0 0 66px}
      .mot-lightbox-thumbs button.active{border-color:#c4778b}
      .mot-lightbox-thumbs img{width:60px;height:60px;object-fit:cover;border-radius:6px;display:block}
      .mot-lightbox-select{border:0;background:#7b3f4b;color:#fff;border-radius:22px;padding:11px 24px;font-weight:800;cursor:pointer;margin-top:8px}
      .mot-lightbox-close{position:absolute;right:8px;top:8px;width:38px;height:38px;border:1px solid #dfc4c7;background:#fff;border-radius:50%;color:#7b3f4b;font-size:22px;cursor:pointer;z-index:2}
      .mot-custom-options{margin-top:18px;padding:16px;background:#fffaf7;border:1px solid #eadbd5;border-radius:14px}
      .mot-custom-options h3{margin:0 0 6px;color:#68434a;font:500 22px Georgia,serif}
      .mot-custom-options p{margin:0 0 10px;color:#806f70;font-size:13px}
      .mot-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .mot-choice{border:1px solid #d8b7bd;background:#fff;border-radius:10px;padding:11px 8px;color:#7b3f4b;font-weight:800;cursor:pointer}
      .mot-choice.active{background:#7b3f4b;color:#fff;border-color:#7b3f4b}
      @media(max-width:700px){.mot-gallery{grid-template-columns:repeat(3,1fr)}.mot-model-info h3{font-size:19px!important}.mot-lightbox{padding:10px}.mot-lightbox-inner{padding:10px}.mot-lightbox-image{max-width:92vw;max-height:66vh}.mot-choice-row{grid-template-columns:1fr}.mot-lightbox-thumbs{justify-content:flex-start}}
    `;
    document.head.appendChild(style);
  }

  async function load() {
    const grid = $('modelGrid');
    if (!grid) return;

    addStyles();
    installTabs();
    installCustomOptions();
    installWhatsApp();

    try {
      const db = await openDB();
      products = await getAllProducts(db);
      renderModels();
    } catch (err) {
      console.error('Seturi pentru moț:', err);
      grid.innerHTML = '<div class="mot-empty">Nu am putut accesa modelele salvate în catalog. Reîncarcă pagina.</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once:true });
  } else {
    load();
  }
})();
