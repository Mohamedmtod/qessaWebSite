const Cart = {
    key: "qessa_cart",

    init() {
        this.injectDropdown();
        this.updateBadge();

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === this.key) {
                this.updateBadge();
                this.renderDropdown();
            }
        });
    },

    getCart() {
        const stored = localStorage.getItem(this.key);
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem(this.key, JSON.stringify(cart));
        this.updateBadge();
        this.renderDropdown();
    },

    addToCart(productId, qty = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === productId);

        // Find product details to persist
        let productDetails = {};
        if (window.PRODUCTS) {
            const product = window.PRODUCTS.find(p => p.id === productId);
            if (product) {
                // Image
                const img = (product.images && product.images.length) ? product.images[0] : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';

                // Price
                let priceVal = 0;
                if (product.pricing) {
                    if (product.pricing.fixedNormal) priceVal = product.pricing.fixedNormal;
                    else if (product.pricing.midNormal) priceVal = product.pricing.midNormal;
                    else if (product.pricing.normal) priceVal = product.pricing.normal;
                }

                productDetails = {
                    name: product.name,
                    image: img,
                    price: priceVal
                };
            }
        }

        if (existingItem) {
            existingItem.qty += qty;
            // Update details if they changed (optional, but good practice)
            if (productDetails.name) {
                existingItem.name = productDetails.name;
                existingItem.image = productDetails.image;
                existingItem.price = productDetails.price;
            }
        } else {
            cart.push({
                id: productId,
                qty: qty,
                ...productDetails
            });
        }

        this.saveCart(cart);
        this.showToast("تمت الإضافة للسلة 🛒");
        // this.open(); // Open sidebar on add
    },

    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
        this.showToast("تم حذف المنتج");
    },

    updateQty(productId, delta) {
        const cart = this.getCart();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                this.removeFromCart(productId);
                return;
            }
            this.saveCart(cart);
        }
    },

    clearCart() {
        localStorage.removeItem(this.key);
        this.updateBadge();
        this.renderDropdown();
        this.showToast("تم تفريغ السلة");
    },

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.qty, 0);
    },

    updateBadge() {
        // Update FAB badge
        const badge = document.getElementById('fab-badge');
        if (badge) {
            const count = this.getCartCount();
            badge.textContent = count > 0 ? count : '';
            badge.style.display = count > 0 ? 'flex' : 'none';

            // Animation
            if (count > 0) {
                const fab = document.getElementById('cart-fab');
                if (fab) {
                    fab.classList.add('bounce');
                    setTimeout(() => fab.classList.remove('bounce'), 300);
                }
            }
        }
    },

    // --- Dropdown Logic ---
    injectDropdown() {
        if (document.getElementById('cart-dropdown')) return;

        const html = `
            <!-- Floating Action Button (Top-Left) -->
            <button id="cart-fab" class="cart-fab" onclick="window.Cart.toggle()" aria-label="سلة المشتريات">
                <span class="fab-icon">🛒</span>
                <span id="fab-badge" class="fab-badge" style="display:none">0</span>
            </button>

            <!-- Dropdown Menu -->
            <div class="cart-dropdown" id="cart-dropdown">
                <div class="cart-dropdown-header">
                    <h2>سلة المشتريات</h2>
                    <button class="close-cart-btn" onclick="window.Cart.close()">×</button>
                </div>
                <div class="cart-dropdown-body" id="cart-dropdown-body">
                    <!-- Items go here -->
                </div>
                <div class="cart-dropdown-footer" id="cart-dropdown-footer">
                    <!-- Summary goes here -->
                </div>
            </div>
            <!-- Overlay for mobile/focus handling -->
            <div class="cart-overlay" id="cart-overlay" onclick="window.Cart.close()"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    open() {
        const dropdown = document.getElementById('cart-dropdown');
        const overlay = document.getElementById('cart-overlay');
        if (dropdown) dropdown.classList.add('open');
        if (overlay) overlay.classList.add('open');
        this.renderDropdown();
    },

    close() {
        document.getElementById('cart-dropdown').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
    },

    toggle() {
        const dropdown = document.getElementById('cart-dropdown');
        if (dropdown && dropdown.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    },

    renderDropdown() {
        const body = document.getElementById('cart-dropdown-body');
        const footer = document.getElementById('cart-dropdown-footer');
        if (!body || !footer) return;

        const cart = this.getCart();

        // Ensure products are available
        const productsMap = {};
        if (window.PRODUCTS) {
            window.PRODUCTS.forEach(p => productsMap[p.id] = p);
        }

        if (cart.length === 0) {
            body.innerHTML = `
                <div style="text-align: center; color: var(--text-dim); margin-top: 30px;">
                    <p style="font-size: 1rem;">سلتك فاضية 🛒</p>
                </div>
            `;
            footer.innerHTML = '';
            return;
        }

        let total = 0;
        let showTotal = true;

        const itemsHTML = cart.map(item => {
            // Live lookup (optional fallback)
            const product = productsMap[item.id];

            let name = item.name || (product ? product.name : `منتج رقم ${item.id}`);
            let img = item.image || (product && product.images && product.images.length ? product.images[0] : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+');

            let priceVal = item.price;
            if (priceVal === undefined && product && product.pricing) {
                if (product.pricing.fixedNormal) priceVal = product.pricing.fixedNormal;
                else if (product.pricing.midNormal) priceVal = product.pricing.midNormal;
                else if (product.pricing.normal) priceVal = product.pricing.normal;
            }

            let priceStr = '';
            if (priceVal) {
                total += priceVal * item.qty;
                priceStr = `${priceVal} ج.م`;
            } else {
                showTotal = false;
            }

            return `
                <div class="side-cart-item">
                    <img src="${img}" class="side-cart-img" alt="${name}">
                    <div class="side-cart-details">
                        <h4>${name}</h4>
                        <div class="side-cart-price">${priceStr}</div>
                    </div>
                    <div class="side-cart-controls">
                        <div class="qty-control-sm">
                            <button class="qty-btn-sm" onclick="window.Cart.updateQty('${item.id}', -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn-sm" onclick="window.Cart.updateQty('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn-sm" onclick="window.Cart.removeFromCart('${item.id}')">حذف</button>
                    </div>
                </div>
            `;
        }).join('');

        body.innerHTML = itemsHTML;

        // Footer
        footer.innerHTML = `
            ${showTotal && total > 0 ? `
            <div class="sidebar-summary">
                <span>الإجمالي:</span>
                <span>${total} ج.م</span>
            </div>` : ''}
            <div class="sidebar-actions">
                <button class="btn-sidebar-whatsapp" onclick="window.Cart.exportToWhatsApp()">
                    اطلب عبر واتساب
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button class="btn-sidebar-clear" onclick="window.Cart.clearCart()">تفريغ السلة</button>
            </div>
        `;
    },

    // --- WhatsApp Export ---
    exportToWhatsApp() {
        const cart = this.getCart();
        if (cart.length === 0) {
            this.showToast("السلة فارغة!", "error");
            return;
        }

        // We need real product details here to show names/prices
        // Assumption: window.PRODUCTS or DataSource is available on the page calling this.
        let productsMap = {};

        // Try to fetch products if global cache exists
        if (window.PRODUCTS && window.PRODUCTS.length > 0) {
            window.PRODUCTS.forEach(p => productsMap[p.id] = p);
        }
        // Note: If PRODUCTS is not loaded, we might just show IDs, 
        // but intended usage is on cart.html where products are loaded.

        let message = "مرحباً، أريد طلب المنتجات التالية:\n\n";
        let total = 0;
        let hasPrices = true;

        cart.forEach(item => {
            // Try live lookup first, fallback to persisted data
            const product = productsMap[item.id];

            let name = item.name || (product ? product.name : `منتج رقم ${item.id}`);
            let priceVal = item.price;

            if (priceVal === undefined && product && product.pricing) {
                // Fallback price logic
                if (product.pricing.fixedNormal) priceVal = product.pricing.fixedNormal;
                else if (product.pricing.midNormal) priceVal = product.pricing.midNormal;
                else if (product.pricing.normal) priceVal = product.pricing.normal;
                else if (product.pricing.normalAfter) priceVal = product.pricing.normalAfter;
            }

            message += `• ${name} (عدد: ${item.qty})\n`;

            if (priceVal) {
                total += priceVal * item.qty;
            } else {
                hasPrices = false;
            }
        });

        message += "\n----------------\n";
        if (hasPrices && total > 0) {
            message += `الإجمالي التقريبي: ${total} ج.م\n`;
        }

        message += "\nشكراً";

        const encoded = encodeURIComponent(message);
        const phone = (typeof SETTINGS !== 'undefined' && SETTINGS.whatsappNumber) ? SETTINGS.whatsappNumber : "201068430400";
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    },

    showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return; // Should be in index.html

        const toast = document.createElement('div');
        toast.className = 'x-toast'; // Reusing existing class from Favorites
        toast.textContent = msg;

        container.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.Cart = Cart;

// Auto-init if DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Cart.init());
} else {
    Cart.init();
}
