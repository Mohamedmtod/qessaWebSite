// Global Products Holder
window.PRODUCTS = [];

// --- ROUTER & NAVIGATION ---
window.ROUTER = {
    async navigateTo(categoryId) {
        // 1. Update URL
        const url = categoryId === 'all' ? 'index.html' : `${categoryId}.html`;
        history.pushState({ category: categoryId }, '', url);

        // 2. Load Content
        await this.loadCategory(categoryId);
    },

    async loadCategory(categoryId) {
        // Update Body State
        document.body.dataset.category = categoryId;

        // --- FILTER RESET LOGIC ---
        if (window.FilterState) {
            window.FilterState.gender = 'all';
            window.FilterState.sort = 'default';
        }
        const oldBar = document.querySelector('.x-filter-bar');
        if (oldBar) oldBar.remove();
        // --------------------------

        // Visual Updates
        this.updateActiveNavLink(categoryId);
        this.updatePageTitle(categoryId);

        // Fetch & Render
        const mainGrid = document.getElementById('product-grid');
        if (mainGrid) {
            mainGrid.innerHTML = '<div class="spinner"></div>'; // Add CSS for spinner later

            try {
                // Fetch
                console.log("SPA: Fetching", categoryId);
                const data = await window.DataSource.getProducts(categoryId);
                window.PRODUCTS = data;

                // Render
                renderProductGrid('product-grid', categoryId);

                // --- RE-RENDER FILTERS ---
                if (typeof renderFilters === 'function') {
                    renderFilters(mainGrid.parentNode, mainGrid);
                }
                // -------------------------

            } catch (e) {
                console.error("SPA Error", e);
                mainGrid.innerHTML = '<p class="text-center error">فشل تحميل المنتجات</p>';
            }
        }
    },

    updateActiveNavLink(catId) {
        // Update Carousel
        document.querySelectorAll('.cat-chip').forEach(btn => {
            const isTarget = btn.parentElement.dataset.cat === catId;
            if (isTarget) btn.classList.add('is-active');
            else btn.classList.remove('is-active');
            btn.setAttribute('aria-selected', isTarget);
        });
    },

    updatePageTitle(catId) {
        // 1. Try injected ID
        let titleEl = document.getElementById('cat-title');

        // 2. Fallback to existing static H2
        if (!titleEl) {
            titleEl = document.querySelector('main h2.text-dim');
        }

        if (titleEl) {
            // We need the Name, not just ID. 
            // Since CATEGORIES is in render.js scope, we might not have it here unless global.
            // render.js runs first, so let's try assuming CATEGORIES is global or access via Render logic?
            // Actually render.js defines const CATEGORIES. It is NOT global.
            // We need to define the map here or make it global.
            // Quickest fix: define map/lookup here.

            const catMap = {
                'all': 'الكل',
                'deals': 'العروض الحصرية',
                'bottles': 'تركيب',
                'rolls': 'البلي',
                'ready-perfumes': 'عطور جاهزة',
                'burners': 'مباخر',
                'diffusers': 'فواحات',
                'glasses': 'نظارات',
                'watches': 'ساعات'
            };

            titleEl.textContent = catMap[catId] || catId;
            titleEl.style.color = 'var(--brand)'; // Ensure visibility
        }

        // Update <title>
        document.title = `QESSA - ${catId}`;
    }
};

async function init() {
    renderNav();

    // Handle Browser Back/Forward
    window.onpopstate = (event) => {
        if (event.state && event.state.category) {
            window.ROUTER.loadCategory(event.state.category);
        } else {
            // Fallback for initial state?
            // Maybe reload or parse URL
            const cat = window.location.pathname.split('/').pop().replace('.html', '');
            window.ROUTER.loadCategory(cat || 'all');
        }
    };

    // Initial Load Logic
    const mainGrid = document.getElementById('product-grid');
    const catFilter = document.body.dataset.category || 'all';

    // Fetch Data if we need it
    if (catFilter) {
        if (window.DataSource) {
            try {
                // Loading state
                if (mainGrid) mainGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;">جار تحميل المنتجات...</p>';

                console.log("Fetching products for category:", catFilter);
                const data = await window.DataSource.getProducts(catFilter);
                console.log("Fetched products:", data);

                window.PRODUCTS = data;

            } catch (e) {
                console.error("Failed to load products", e);
                if (mainGrid) mainGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:red;">فشل تحميل المنتجات. تأكد من الاتصال بالانترنت.</p>';
            }
        } else {
            console.error("DataSource module not loaded. Check script imports.");
            if (mainGrid) mainGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:red;">خطأ داخلي: فشل تحميل مصدر البيانات.</p>';
        }
    }

    // Initialize Global Oud Toggle
    const oudToggle = document.getElementById('global-oud-toggle');
    if (oudToggle) {
        oudToggle.checked = getStoredOudState();

        oudToggle.addEventListener('change', () => {
            setStoredOudState(oudToggle.checked);
            // Re-render prices on current page
            document.querySelectorAll('.x-item').forEach(card => updateCardPrice(card));
        });
    }

    if (mainGrid && catFilter) {
        // Render initial grid
        renderProductGrid('product-grid', catFilter);

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const allCatItems = window.PRODUCTS.filter(p => p.category === catFilter);

                const filtered = allCatItems.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    (p.badge && p.badge.toLowerCase().includes(query))
                );

                renderProductList('product-grid', filtered);
            });
        }

        // Favorites Filter Toggle Logic
        const favFilterBtn = document.getElementById('toggle-fav-filter');
        let isFavFilterActive = false;

        if (favFilterBtn) {
            favFilterBtn.addEventListener('click', () => {
                isFavFilterActive = !isFavFilterActive;
                favFilterBtn.classList.toggle('active', isFavFilterActive);
                favFilterBtn.textContent = isFavFilterActive ? "عرض الكل 📋" : "عرض المفضلة فقط ❤️";

                // Ensure we filter based on current catFilter
                const allCatItems = (catFilter === 'all')
                    ? window.PRODUCTS
                    : window.PRODUCTS.filter(p => p.category === catFilter);

                if (isFavFilterActive) {
                    const favIds = window.Favorites.getFavorites();
                    const filtered = allCatItems.filter(p => favIds.includes(p.id));
                    renderProductList('product-grid', filtered);
                } else {
                    renderProductList('product-grid', allCatItems);
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
