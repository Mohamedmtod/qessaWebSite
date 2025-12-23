/**
 * Favorites (Wishlist) Logic
 * Uses localStorage key: "qessa_favorites"
 */

const FAV_KEY = "qessa_favorites";

const Favorites = {
    getFavorites() {
        try {
            const stored = localStorage.getItem(FAV_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error reading favorites", e);
            return [];
        }
    },

    isFavorite(productId) {
        const list = this.getFavorites();
        return list.includes(productId);
    },

    toggleFavorite(productId) {
        let list = this.getFavorites();
        const exists = list.includes(productId);
        let added = false;

        if (exists) {
            list = list.filter(id => id !== productId);
        } else {
            list.push(productId);
            added = true;
        }

        localStorage.setItem(FAV_KEY, JSON.stringify(list));
        this.updateUI(productId, added);

        if (added) {
            this.showToast("اتضاف للمفضلة ❤️");
        }

        // If on favorites page, re-render?
        // User requirement: "Display ONLY products that exist... if no favorites... empty state"
        // We might need to refresh the grid if we are on the favorites page and remove an item.
        if (window.location.pathname.includes('favorites.html') && !added) {
            // Ideally trigger a re-render or remove the card
            const card = document.querySelector(`.x-item[data-id="${productId}"]`);
            if (card) card.remove();

            // Check if empty
            if (list.length === 0) {
                const grid = document.getElementById('product-grid');
                if (grid) grid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-dim);">لسه مفيش منتجات في المفضلة ❤️</p>`;
            }
        }
    },

    updateUI(productId, isFav) {
        // Update all instances of this product card (in case of aliases/duplicates)
        const cards = document.querySelectorAll(`.x-item[data-id="${productId}"]`);
        cards.forEach(card => {
            const btn = card.querySelector('.noon-wishlist-btn');
            if (btn) {
                if (isFav) {
                    btn.classList.add('active');
                    btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          `;
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          `;
                }
            }
        });
    },

    showToast(msg) {
        let container = document.getElementById('toast-container');
        if (!container) {
            // Create if missing (though we will add to HTML)
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'x-toast';
        toast.textContent = msg;

        container.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// Expose globally
window.Favorites = Favorites;
