/* SETURI PENTRU MOȚ — sursa reală a modelelor este catalogul Supabase.
   Nu folosim IndexedDB ca sursă principală: aceea era baza locală a versiunii vechi
   și de aici venea problema că pe alt dispozitiv / altă versiune nu apăreau toate pozele.
*/
(() => {
  const SB_URL = 'https://zbfqhmiqjcvicqlidswo.supabase.co';
  const SB_KEY = 'sb_publishable_d81c4EtU4mkkqgBnVQi9HQ_nf7M2zFb';
  const API = SB_URL + '/rest/v1';
  const HEADERS = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
  const PHOTO_BUCKET = 'mot-models';
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

  const normalize = v => String(v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const photoUrl = value => {
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value)) return value;
    return SB_URL + '/storage/v1/object/public/' + PHOTO_BUCKET + '/' + String(value).replace(/^\//, '');
  };

  const wa = text => 'https://wa.me/447742444493?text=' + encodeURIComponent(text);

  async function api(path) {
    const response = await fetch(API + path, { headers: HEADERS });
    const text = await response.text();
    if (!response.ok) throw new Error(text || ('HTTP ' + response.status));
    return text ? JSON.parse(text) : [];
  }

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

  function isGirl(model) {
    const text = normalize([
      model.category, model.category_name, model.subcategory, model.subcategory_name,
      model.gender, model.sex, model.type, model.collection, model.section, model.name
    ].filter(Boolean).join(' '));
    return /fetit|fata|fete|girl|female/.test(text) || text === 'f';
  }

  function isBoy(model) {
    const text = normalize([
      model.category, model.category_name, model.subcategory, model.subcategory_name,
      model.gender, model.sex, model.type, model.collection, model.section, model.name
    ].filter(Boolean).join(' '));
    return /baiat|baieti|baietel|boy|male|masculin|mascul/.test(text) || text === 'b';
  }

  function isMot(model) {
    const text = normalize([
      model.category, model.category_name, model.subcategory, model.subcategory_name,
      model.type, model.collection, model.section, model.name
    ].filter(Boolean).join(' '));
    return text.includes('mot');
  }

  function productPhotos(model) {
    const source = Array.isArray(model?.photos) ? model.photos : [];
    return source.map(item => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      return item.image_url || item.url || item.src || item.image || item.imageUrl || item.path || item.file || item.data || '';
    }).filter(Boolean).map(photoUrl);
  }

  function addStyles() {
    if ($('mot-model-styles')) return;
    const style = document.createElement('style');
    style.id = 'mot-model-styles';
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
      .mot-select{width:100%;border:2px solid #7b3f4b;border-radius:11px;background:#7b3f4b;color:#fff;padding:14px 12px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 5px 14px rgba(123,63,75,.22);transition:background .18s,transform .18s,box-shadow .18s}.mot-select:hover{background:#65323e;transform:translateY(-2px);box-shadow:0 8px 18px rgba(123,63,75,.28)}.mot-select:focus-visible{outline:3px solid #d99ba7;outline-offset:3px}
      .mot-selected{border-color:#c4778b;box-shadow:0 10px 28px rgba(123,63,75,.14)}
      .mot-selected .mot-select{background:#c4778b;border-color:#c4778b;color:#fff}
      #modelGrid .mot-model-card .mot-select{display:block!important;width:100%!important;min-height:50px!important;background:#7b3f4b!important;color:#fff!important;border:2px solid #7b3f4b!important;border-radius:11px!important;font-size:15px!important;font-weight:800!important;box-shadow:0 5px 14px rgba(123,63,75,.22)!important}
      #modelGrid .mot-model-card .mot-select:hover{background:#65323e!important}
      #modelGrid .mot-model-card.mot-selected .mot-select{background:#c4778b!important;border-color:#c4778b!important}
      .mot-empty,.mot-no-photo{padding:30px;text-align:center;color:#806f70;background:#f8eee9;border-radius:13px}
      .mot-lightbox{position:fixed;inset:0;background:rgba(55,35,39,.82);display:none;align-items:center;justify-content:center;padding:20px;z-index:9999}
      .mot-lightbox.open{display:flex}
      .mot-lightbox-inner{position:relative;box-sizing:border-box;width:min(1100px,94vw);max-height:94dvh;min-height:0;display:flex;flex-direction:column;align-items:stretch;overflow:hidden;background:#fffaf7;border-radius:16px;padding:14px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .mot-lightbox-image{display:block;box-sizing:border-box;width:100%;height:auto;max-width:100%;max-height:calc(94dvh - 190px);min-height:0;flex:1 1 auto;object-fit:contain;border-radius:10px;margin:0 auto}
      .mot-lightbox-photo-wrap{display:flex;align-items:center;justify-content:center;gap:8px;min-height:0;flex:1 1 auto;width:100%}.mot-lightbox-photo-wrap .mot-lightbox-image{flex:1 1 auto;min-width:0}.mot-gallery-prev,.mot-gallery-next{flex:0 0 44px;width:44px;height:54px;border:0;border-radius:12px;background:#7b3f4b;color:white;font-size:34px;cursor:pointer}.mot-gallery-prev:disabled,.mot-gallery-next:disabled{opacity:.35;cursor:default}.mot-gallery-count{font-size:14px;color:#68434a;padding-top:5px}.mot-lightbox-photo-wrap{position:relative;display:block;min-height:220px}.mot-lightbox-photo-wrap .mot-lightbox-image{width:100%;height:auto;max-height:calc(94dvh - 220px)}.mot-lightbox-photo-wrap .mot-gallery-prev,.mot-lightbox-photo-wrap .mot-gallery-next{position:absolute;top:50%;transform:translateY(-50%);z-index:5;display:flex!important;align-items:center;justify-content:center;opacity:1;visibility:visible;box-shadow:0 2px 12px #0006}.mot-lightbox-photo-wrap .mot-gallery-prev{left:8px}.mot-lightbox-photo-wrap .mot-gallery-next{right:8px}.mot-lightbox-title{font:500 20px Georgia,serif;color:#68434a;margin:9px 50px 8px}
      .mot-lightbox-thumbs{display:flex;flex:0 0 auto;min-width:0;max-width:100%;gap:7px;overflow-x:auto;overflow-y:hidden;padding:3px;justify-content:flex-start}
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
      .mot-custom-photo-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
      .mot-custom-photo{border:1px solid #d8b7bd;background:#fff;border-radius:10px;padding:11px 8px;color:#7b3f4b;font-weight:800;cursor:pointer}
      .mot-custom-photo.active{background:#7b3f4b;color:#fff;border-color:#7b3f4b}
      @media(max-width:700px){
        .mot-gallery{grid-template-columns:repeat(3,1fr)}
        .mot-model-info h3{font-size:19px!important}
        .mot-lightbox{padding:10px}
        .mot-lightbox-inner{padding:10px}
        .mot-lightbox-image{max-width:100%;max-height:calc(94dvh - 175px)}
        .mot-choice-row,.mot-custom-photo-row{grid-template-columns:1fr}
        .mot-lightbox-thumbs{justify-content:flex-start}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLightbox() {
    let box = $('motLightbox');
    if (box) { box.querySelectorAll('.mot-lightbox-title').forEach(el=>el.remove()); return box; }

    box = document.createElement('div');
    box.id = 'motLightbox';
    box.className = 'mot-lightbox';
    box.innerHTML = `
      <div class="mot-lightbox-inner">
        <button type="button" class="mot-lightbox-close" aria-label="Închide">×</button>
        <div class="mot-lightbox-photo-wrap"><button type="button" class="mot-gallery-prev" aria-label="Fotografia anterioară">‹</button><img class="mot-lightbox-image" alt="Fotografie model"><button type="button" class="mot-gallery-next" aria-label="Fotografia următoare">›</button></div><div class="mot-gallery-count" aria-live="polite"></div>
        
        <div class="mot-lightbox-thumbs"></div>
        <button type="button" class="mot-lightbox-select">Alege modelul acesta</button>
      </div>`;
    document.body.appendChild(box);

    box.addEventListener('click', e => {
      if (e.target === box || e.target.classList.contains('mot-lightbox-close')) box.classList.remove('open');
    });

    box.querySelector('.mot-lightbox-select').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const model = box._model;
      const index = Number(box.dataset.photoIndex || 0);
      const photos = productPhotos(model);
      selectModel(model, photos[index] || '');
      box.classList.remove('open');
    });

    return box;
  }

  function openLightbox(model, photos, index = 0) {
    if (!photos.length) return;
    const box = ensureLightbox();
    box.querySelectorAll('.mot-lightbox-title').forEach(el=>el.remove());
    box._model = model;
    box.dataset.photoIndex = String(index);
    

    const main = box.querySelector('.mot-lightbox-image');
    const thumbs = box.querySelector('.mot-lightbox-thumbs');const prev=box.querySelector('.mot-gallery-prev');const next=box.querySelector('.mot-gallery-next');const count=box.querySelector('.mot-gallery-count');

    const showPhoto = i => {
      if (!photos[i]) return;
      box.dataset.photoIndex = String(i);
      main.src = photos[i];
      main.alt = model.name || 'Model set moț';
      thumbs.querySelectorAll('button').forEach((b,n) => b.classList.toggle('active', n === i));count.textContent=(i+1)+' / '+photos.length;prev.disabled=next.disabled=photos.length<2;
    };

    thumbs.innerHTML = photos.map((url,i) => `<button type="button" aria-label="Fotografia ${i + 1}"><img src="${esc(url)}" alt=""></button>`).join('');
    thumbs.querySelectorAll('button').forEach((button,i) => button.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      showPhoto(i);
    }));

    prev.onclick=()=>showPhoto((Number(box.dataset.photoIndex)-1+photos.length)%photos.length);next.onclick=()=>showPhoto((Number(box.dataset.photoIndex)+1)%photos.length);showPhoto(Math.min(index, photos.length - 1));
    box.classList.add('open');
  }

  function renderModels() {
    const grid = $('modelGrid');
    if (!grid) return;

    const list = products.filter(model => {
      return genderFilter === 'fetita' ? isGirl(model) : isBoy(model);
    });

    if (!list.length) {
      grid.innerHTML = '<div class="mot-empty">Nu am găsit modele pentru această categorie.</div>';
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
          <button type="button" class="mot-select">${selected ? '✓ Model ales' : 'Răsfoiește pozele'}</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.mot-select').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const model = list[Number(button.closest('[data-index]').dataset.index)];
        openLightbox(model, productPhotos(model), 0);
      });
    });

    grid.querySelectorAll('.mot-photo').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const model = list[Number(button.closest('[data-index]').dataset.index)];
        openLightbox(model, productPhotos(model), Number(button.dataset.index));
      });
    });
  }

  function selectModel(model, photo) {
    if (!model) return;
    selectedModel = model;
    selectedPhotoUrl = photo || productPhotos(model)[0] || '';
    if ($('modelChoice')) $('modelChoice').value = model.name || '';
    renderModels();
    renderSummarySafe();
    $('personalizare')?.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function installTabs() {
    document.querySelectorAll('.tab').forEach(oldTab => {
      const tab = oldTab.cloneNode(true);
      oldTab.replaceWith(tab);
      tab.addEventListener('click', () => {
        genderFilter = tab.dataset.gender === 'baiat' ? 'baiat' : 'fetita';
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        tab.classList.add('active');
        selectedModel = null;
        selectedPhotoUrl = '';
        renderModels();
      });
    });
  }

  function installCustomOptions() {
    const custom = $('personalizare');
    const form = custom?.querySelector('.form-grid');
    if (!custom || !form) return;

    const trayInput = $('tray');
    if (trayInput) trayInput.type = 'hidden';

    let box = $('motCustomOptions');
    if (!box) {
      box = document.createElement('div');
      box.id = 'motCustomOptions';
      box.className = 'mot-custom-options';
      box.innerHTML = `
        <h3>🎨 Dacă nu găsești tematica dorită</h3>
        <p>Scrie tema dorită mai sus, apoi alege tipul de tavă iar opțiunea pentru fotografia copilului o alegi în secțiunea de mai jos.</p>
        <div class="mot-choice-row">
          <button type="button" class="mot-choice active" data-custom-tray="70">Tavă dreptunghiulară £70</button>
          <button type="button" class="mot-choice" data-custom-tray="80">Tavă rotundă £80</button>
        </div>
`;
      form.insertAdjacentElement('afterend', box);
    }

    // Remove legacy duplicate photo choices from older generated markup.
    box.querySelectorAll('.mot-custom-photo-row,[data-custom-photo]').forEach(el => el.remove());

    box.querySelectorAll('[data-custom-tray]').forEach(btn => {
      btn.onclick = () => {
        selectedTray = btn.dataset.customTray;
        if (trayInput) trayInput.value = selectedTray;
        box.querySelectorAll('[data-custom-tray]').forEach(x => x.classList.toggle('active', x === btn));
        renderSummarySafe();
      };
    });

    const dateInput = $('childDate');
    const dateLabel = dateInput?.closest('label');
    if (dateLabel) {
      const textNode = Array.from(dateLabel.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNode) textNode.textContent = 'Data (opțional)';
    }

    const photoBox = custom.querySelector('.photo-option');
    if (photoBox) photoBox.querySelectorAll('.photo-choice-btn').forEach(btn => {
      btn.onclick = () => {
        selectedChildPhoto = btn.dataset.photo === 'da' ? 'da' : 'nu';
        photoBox.querySelectorAll('.photo-choice-btn').forEach(x => x.classList.toggle('active', x === btn));
        renderSummarySafe();
      };
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

      window.open(wa(lines), '_blank', 'noopener');
    }, true);
  }

  async function loadFromSupabase() {
    const [modelsResult, photosResult] = await Promise.allSettled([
      api('/mot_models?select=*&is_active=eq.true&order=display_order.asc,name.asc'),
      api('/mot_model_photos?select=*&order=display_order.asc')
    ]);

    if (modelsResult.status !== 'fulfilled') throw modelsResult.reason;
    const modelRows = Array.isArray(modelsResult.value) ? modelsResult.value : [];
    const photoRows = photosResult.status === 'fulfilled' && Array.isArray(photosResult.value) ? photosResult.value : [];

    modelRows.forEach(model => {
      model.photos = photoRows
        .filter(photo => String(photo.model_id) === String(model.id))
        .sort((a,b) => (a.display_order || 0) - (b.display_order || 0));
    });

    return modelRows;
  }

  async function loadFromIndexedDB() {
    const db = await openDB();
    return getAllProducts(db);
  }


  function updateMotCategoryPhoto() {
    const card = document.querySelector('.category-card[href="#mot"] .category-visual');
    if (!card) return;
    const model = products.find(item => productPhotos(item).length && !isBoy(item)) || products.find(item => productPhotos(item).length);
    if (!model) return;
    const url = productPhotos(model)[0];
    if (!url) return;
    const photo = new Image();
    photo.onload = () => {
      card.querySelectorAll('.category-art-main,.category-art-mini').forEach(el => el.remove());
      card.querySelector('.mot-category-cover')?.remove();
      photo.className = 'mot-category-cover';
      photo.alt = 'Set pentru moț personalizat – Alina’s Handmade Boutique';
      photo.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;object-position:center;position:relative;z-index:2';
      card.insertBefore(photo, card.firstChild);
    };
    photo.src = url;
  }

  async function load() {
    const grid = $('modelGrid');
    if (!grid) return;

    addStyles();
    installTabs();
    installCustomOptions();
    installWhatsApp();

    try {
      products = await loadFromSupabase();
      if (!products.length) throw new Error('Supabase nu a returnat modele active.');
      renderModels();
      updateMotCategoryPhoto();
    } catch (supabaseError) {
      console.warn('Supabase mot models:', supabaseError);
      try {
        products = await loadFromIndexedDB();
        renderModels();
        updateMotCategoryPhoto();
      } catch (localError) {
        console.error('Seturi pentru moț:', localError);
        grid.innerHTML = '<div class="mot-empty">Nu am putut încărca modelele și fotografiile. Reîncarcă pagina.</div>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once:true });
  } else {
    load();
  }
})();
