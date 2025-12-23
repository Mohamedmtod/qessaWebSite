const CATEGORIES = [
  { id: 'all', name: 'الكل', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/qessaLogo.png' },
  { id: 'deals', name: 'العروض', url: 'deals.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/offers.png' },
  { id: 'bottles', name: 'تركيب', url: 'bottles.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/tarkeeb.png' },
  { id: 'rolls', name: 'البلي', url: 'rolls.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/rollOn.png' },
  { id: 'ready-perfumes', name: 'عطور جاهزة', url: 'ready-perfumes.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/perfumes.png' },
  { id: 'burners', name: 'مباخر', url: 'burners.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/mabkhra.png' },
  { id: 'diffusers', name: 'فواحات', url: 'diffusers.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/fawa7a.png' },
  { id: 'glasses', name: 'نظارات', url: 'glasses.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/sunglass.png' },
  { id: 'watches', name: 'ساعات', url: 'watches.html', img: 'https://pub-e532a30d2689465ba0dccae10883a5e5.r2.dev/wristwatch.png' },
];

function renderNav() {
  const head = document.querySelector('.x-head');
  if (!head) return;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const category = document.body.dataset.category;
  const showOudToggle = ['bottles', 'rolls'].includes(category);

  const oudToggleHTML = showOudToggle ? `
     <div class="oud-toggle">
        <span>تفعيل أسعار العود</span>
        <label class="switch">
          <input type="checkbox" id="global-oud-toggle">
          <span class="slider"></span>
        </label>
     </div>
  ` : '';

  const navHTML = `
    <div class="x-nav-container">
      <div class="x-head-row flex justify-between items-center" style="gap: 15px;">
         <button class="mobile-menu-btn" onclick="toggleMenu()">☰</button>
         
         <div class="x-brand" style="text-align: center; flex: 1;">
            <a href="index.html"><h1>قصة</h1></a>
            <p>QESSA PERFUMES</p>
         </div>

         ${oudToggleHTML}
      </div>

      <div class="nav-overlay" onclick="toggleMenu()"></div>

      <nav class="x-nav" id="main-nav">
        <button class="close-menu-btn" onclick="toggleMenu()">✕</button>
        <a href="index.html" class="x-nav-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">الرئيسية</a>
        <a href="categoryPage.html" class="x-nav-link ${currentPath === 'categoryPage.html' ? 'active' : ''}">التصنيفات</a>
        <a href="contact.html" class="x-nav-link">تواصل معنا</a>
        
        <a href="favorites.html" class="x-nav-link" style="color:var(--brand);">المفضلة ❤️</a>
      </nav>
    </div>
  `;

  head.innerHTML = navHTML;

  // Inject Amazon-style Carousel
  setTimeout(renderCategoryCarousel, 50);
}

function toggleMenu() {
  document.getElementById('main-nav').classList.toggle('open');
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) overlay.classList.toggle('open');
}

// === AMAZON-STYLE CATEGORY CAROUSEL ===
function renderCategoryCarousel() {
  if (document.querySelector('.cat-carousel')) return;
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  // Initial Active State Logic
  let initialCat = 'all';
  const hashCat = window.location.hash.replace('#', '');
  const bodyCat = document.body.dataset.category;
  if (hashCat && CATEGORIES.some(c => c.id === hashCat)) initialCat = hashCat;
  else if (bodyCat && CATEGORIES.some(c => c.id === bodyCat)) initialCat = bodyCat;

  // Create Container
  const carousel = document.createElement('section');
  carousel.className = 'cat-carousel';
  carousel.setAttribute('aria-label', 'التصنيفات');

  const itemsHTML = CATEGORIES.filter(cat => cat.id !== 'all').map(cat => {
    const isActive = (initialCat === cat.id);
    return `
       <li class="cat-carousel__item" data-cat="${cat.id}">
       <li class="cat-carousel__item" data-cat="${cat.id}">
         <a href="${cat.url || '#'}" 
            class="cat-chip ${isActive ? 'is-active' : ''}" 
            aria-selected="${isActive}"
            onclick="handleSpaNav(event, '${cat.id}')">
           <span class="cat-chip__icon">
             ${cat.id === 'all'
        ? '<span style="font-weight:bold; font-size:18px;">∞</span>'
        : `<img src="${cat.img}" alt="" loading="lazy">`
      }
           </span>
           ${cat.name ? `<span class="cat-chip__label">${cat.name}</span>` : ''}
         </a>
       </li>
     `;
  }).join('');

  carousel.innerHTML = `
    <button class="cat-carousel__btn cat-carousel__btn--prev" type="button" aria-label="السابق" onclick="scrollCarousel(-1)">‹</button>
    <div class="cat-carousel__viewport" id="catViewport">
      <ol class="cat-carousel__track">
        ${itemsHTML}
      </ol>
    </div>
    <button class="cat-carousel__btn cat-carousel__btn--next" type="button" aria-label="التالي" onclick="scrollCarousel(1)">›</button>
  `;

  grid.parentNode.insertBefore(carousel, grid);

  // Inject Filters UI
  renderFilters(grid.parentNode, grid);

  // Initial Filter
  if (initialCat !== 'all') {
    renderProductGrid('product-grid', initialCat);
  }
}

// --- FILTER & SORT LOGIC ---
window.FilterState = {
  gender: 'all', // 'all', 'رجالي', 'حريمي'
  sort: 'default' // 'default', 'price-asc', 'price-desc'
};

function renderFilters(parent, beforeNode) {
  if (document.querySelector('.x-filter-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'x-filter-bar';

  const cat = getCurrentCategory();
  const showGender = ['ready-perfumes', 'watches', 'glasses'].includes(cat);

  let genderHTML = '';
  if (showGender) {
    genderHTML = `
            <div class="x-gender-toggle">
                <button class="x-g-btn active" onclick="setFilterGender('all', this)">الكل</button>
                <button class="x-g-btn" onclick="setFilterGender('رجالي', this)">رجالي</button>
                <button class="x-g-btn" onclick="setFilterGender('حريمي', this)">حريمي</button>
            </div>
        `;
  }

  const sortHTML = `
        <div class="x-sort-group">
            <select onchange="setFilterSort(this.value)" class="x-sort-select">
                <option value="default">ترتيب حسب: الافتراضي</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
        </div>
    `;

  bar.innerHTML = `
        ${genderHTML}
        ${sortHTML}
    `;

  parent.insertBefore(bar, beforeNode);
}

function getCurrentCategory() {
  // Helper to get consistent category
  const hashCat = window.location.hash.replace('#', '');
  const bodyCat = document.body.dataset.category;
  return hashCat || bodyCat || 'all';
}

window.setFilterGender = function (val, btn) {
  window.FilterState.gender = val;
  // UI
  document.querySelectorAll('.x-g-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Render
  refreshGrid();
};

window.setFilterSort = function (val) {
  window.FilterState.sort = val;
  refreshGrid();
};

function refreshGrid() {
  const cat = getCurrentCategory();
  renderProductGrid('product-grid', cat);
}

// Update Filters Visibility on Nav
const originalNavigate = window.ROUTER ? window.ROUTER.navigateTo : null;
if (window.ROUTER) {
  window.ROUTER.navigateTo = async function (catId) {
    // Reset State on Cat Change
    window.FilterState.gender = 'all';
    window.FilterState.sort = 'default';

    // Remove old bar to re-render with correct logic
    const oldBar = document.querySelector('.x-filter-bar');
    if (oldBar) oldBar.remove();

    await originalNavigate.call(window.ROUTER, catId);

    // Render new bar
    const grid = document.getElementById('product-grid');
    if (grid) renderFilters(grid.parentNode, grid);
  };
}


// handleCatClick removed

window.handleSpaNav = function (e, catId) {
  if (window.ROUTER) {
    e.preventDefault();
    window.ROUTER.navigateTo(catId);
  }
  // If no router, fallback to default href behavior
};

function scrollCarousel(direction) {
  const viewport = document.getElementById('catViewport');
  if (!viewport) return;
  const scrollAmount = 200; // Approx item width
  // RTL: negative direction moves left (next), positive right (prev)? 
  // In RTL browser: scrollLeft starts at 0 or negative. 
  // Standard approach: To go "Next" (Left in RTL), we might subtract. 
  // Let's rely on standard scrollBy behavior which is usually logical direction.
  // If direction is 1 (Next), we want to see more items. In RTL that is scrolling negative X usually.
  // Let's try flexible logic:
  const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
  const factor = isRTL ? -1 : 1;

  viewport.scrollBy({ left: direction * scrollAmount * factor, behavior: 'smooth' });
}

function renderProductList(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-dim);">لا توجد نتائج.</p>`;
    return;
  }

  container.innerHTML = items.map(p => createCardHTML(p)).join('');

  container.querySelectorAll('.x-item').forEach(card => {
    attachCarouselEvents(card);
    const concInputs = card.querySelectorAll('input[name^="conc-"]');
    concInputs.forEach(input => {
      input.addEventListener('change', () => updateCardPrice(card));
    });
    updateCardPrice(card);
  });
}

function renderProductGrid(containerId, category = null) {
  let items = [];

  // 1. Initial Category Filter
  if (category === 'all' || !category) {
    items = PRODUCTS;
  } else if (category === 'deals') {
    items = PRODUCTS.filter(p => p.category === 'deals');
  } else {
    items = PRODUCTS.filter(p => p.category === category);
  }

  // 2. Gender Filter
  const showGender = ['ready-perfumes', 'watches', 'glasses'].includes(category);
  if (showGender && window.FilterState.gender !== 'all') {
    items = items.filter(p => p.gender === window.FilterState.gender);
  }

  // 3. Price Sorting
  if (window.FilterState.sort !== 'default') {
    const isAsc = window.FilterState.sort === 'price-asc';
    const isOud = getStoredOudState(); // Need price context

    items.sort((a, b) => {
      const pA = getVirtualPrice(a, isOud);
      const pB = getVirtualPrice(b, isOud);
      return isAsc ? pA - pB : pB - pA;
    });
  }

  renderProductList(containerId, items);
}

// Helper for sorting
function getVirtualPrice(p, isOud) {
  // Simplify price extraction for sorting
  if (p.type === 'deal') {
    const mode = isOud ? 'oud' : 'normal';
    return (p.prices && p.prices[mode]) ? p.prices[mode].after : p.prices.normal.after;
  }
  // For others, use 'mid' conc as standard for sorting
  return getProductPrice(p, isOud, 'mid');
}

function createCardHTML(product) {
  const hasMultiple = product.images && product.images.length > 1;
  const imgSrcs = (product.images && product.images.length) ? product.images : ['https://placehold.co/400x400/222/ffc000?text=No+Image'];

  const imageHTML = hasMultiple
    ? `
      <div class="x-carousel-container">
        <div class="x-carousel-wrapper">
          ${imgSrcs.map(src => `<div class="x-carousel-slide"><img src="${src}" loading="lazy" alt="${product.name}"></div>`).join('')}
        </div>
        <div class="x-carousel-dots">
          ${imgSrcs.map((_, i) => `<div class="carousel-dot ${i === 0 ? 'active' : ''}"></div>`).join('')}
        </div>
      </div>
      `
    : `<img src="${imgSrcs[0]}" loading="lazy" class="product-img-main" alt="${product.name || product.title}">`;

  // Badge Logic
  let badgeHTML = '';
  if (product.type === 'deal') {
    let discount = 0;
    if (product.prices && product.prices.normal && product.prices.normal.before && product.prices.normal.after) {
      const oldP = product.prices.normal.before;
      const newP = product.prices.normal.after;
      if (oldP > newP) {
        discount = Math.round(((oldP - newP) / oldP) * 100);
      }
    }

    if (discount > 0) {
      badgeHTML = `<span class="noon-badge discount">${discount}% خصم</span>`;
    } else {
      badgeHTML = `<span class="noon-badge">${product.badge || 'عرض خاص'}</span>`;
    }
  } else if (product.badge) {
    badgeHTML = `<span class="noon-badge">${product.badge}</span>`;
  }

  let controlsHTML = '';
  if (product.type === 'bottle') {
    controlsHTML = `
      <div class="x-toggle-group">
        <label class="x-toggle-option active">
          <input type="radio" name="conc-${product.id}" value="mid" checked class="hidden">
          متوسط
        </label>
        <label class="x-toggle-option">
          <input type="radio" name="conc-${product.id}" value="high" class="hidden">
          عالي
        </label>
      </div>
    `;
  }

  let descHTML = '';
  if (product.desc) {
    descHTML = `<p style="font-size:13px; color:var(--text-dim); margin: -3px 0 5px 0; line-height:1.4;">${product.desc}</p>`;
  }

  const name = product.name || product.title;

  return `
    <article class="x-item noon-card" data-id="${product.id}" data-type="${product.type}">
      <div class="noon-img-area">
        ${imageHTML}
        <div class="noon-badges-overlay">${badgeHTML}</div>
        <div class="noon-wishlist-btn ${window.Favorites && window.Favorites.isFavorite(product.id) ? 'active' : ''}" 
             onclick="window.Favorites.toggleFavorite('${product.id}')">
            ${window.Favorites && window.Favorites.isFavorite(product.id) ?
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>` :
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
    }
        </div>
      </div>
      
      <div class="noon-details">
        <h3 class="noon-title" title="${name}">${name}</h3>
        

        <div class="noon-meta">
           ${descHTML}
           <!-- Rating Removed -->
        </div>

        <div class="noon-price-block">
             <div class="pr-row">
                <span class="currency">${SETTINGS.currency}</span>
                <span class="price-val">...</span>
             </div>
             <div class="old-price-row"></div> 
        </div>

        <div class="controls-area">
             ${controlsHTML}
        </div>

        <div class="noon-footer">

            <div class="express-info" style="visibility:hidden"></div>
            
            <button class="noon-add-cart-btn" onclick="window.Cart.addToCart('${product.id}'); event.stopPropagation();">
                <span>أضف للسلة</span>
                <span style="font-size:18px;">+</span>
            </button>

            <button class="noon-atc-btn" onclick="orderViaWhatsapp('${product.id}')" title="اطلب عبر واتساب">
                 <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                </svg>
                <span>اطلب عبر واتساب</span>
            </button>
        </div>
      </div>
    </article>
  `;
}

function updateCardPrice(card) {
  const pid = card.dataset.id;
  const product = PRODUCTS.find(p => p.id === pid);
  if (!product) return;

  const isOud = getStoredOudState();
  let conc = 'mid';
  if (product.type === 'bottle') {
    const checkedConc = card.querySelector(`input[name="conc-${pid}"]:checked`);
    if (checkedConc) conc = checkedConc.value;
  }

  // Update Toggles UI
  card.querySelectorAll('.x-toggle-option').forEach(opt => {
    const input = opt.querySelector('input');
    if (input && input.checked) opt.classList.add('active');
    else opt.classList.remove('active');
  });

  let price = 0;
  let oldPrice = 0;

  const priceValEl = card.querySelector('.price-val');
  const oldPriceRow = card.querySelector('.old-price-row');

  if (product.type === 'deal') {
    const mode = isOud ? 'oud' : 'normal';
    const pObj = product.prices[mode] || product.prices['normal'];
    price = pObj.after;
    oldPrice = pObj.before;

    if (priceValEl) priceValEl.textContent = fmtCurrency(price);
    if (oldPriceRow) {
      if (oldPrice > price) {
        oldPriceRow.innerHTML = `<span style="text-decoration:line-through; color:var(--text-dim); font-size:12px;">${fmtCurrency(oldPrice)} ${SETTINGS.currency}</span>`;
      } else {
        oldPriceRow.innerHTML = '';
      }
    }
  } else {
    price = getProductPrice(product, isOud, conc);
    if (priceValEl) priceValEl.textContent = fmtCurrency(price);
    if (oldPriceRow) oldPriceRow.innerHTML = '';
  }
}

function orderViaWhatsapp(pid) {
  const card = document.querySelector(`.x-item[data-id="${pid}"]`);
  let product = PRODUCTS.find(p => p.id === pid);
  if (!card || !product) return;

  const isOud = getStoredOudState();
  let conc = 'mid';
  if (product.type === 'bottle') {
    const checkedConc = card.querySelector(`input[name="conc-${pid}"]:checked`);
    if (checkedConc) conc = checkedConc.value;
  }

  let price = 0;
  if (product.type === 'deal') {
    const mode = isOud ? 'oud' : 'normal';
    if (product.prices && product.prices[mode]) {
      price = product.prices[mode].after;
    } else {
      price = product.prices.normal.after;
    }
  } else {
    price = getProductPrice(product, isOud, conc);
  }

  let link = '';
  if (product.type === 'deal') {
    const text = `السلام عليكم، أريد العرض: ${product.title || product.name} بسعر ${fmtCurrency(price)} ${SETTINGS.currency}.`;
    link = `https://wa.me/${SETTINGS.whatsappNumber}?text=${encodeURIComponent(text)}`;
  } else {
    link = generateWALink(product, price, isOud, conc);
  }

  window.open(link, '_blank');
}
