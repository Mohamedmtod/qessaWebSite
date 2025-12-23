import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-lite.js";

// Minimal config for public read-only access
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD9wNdc90nnFaq9ybjr3QBse_OQMHbVX2A",
    projectId: "qessa-e48f7",
    storageBucket: "qessa-e48f7.firebasestorage.app",
    messagingSenderId: "514689205440",
    appId: "1:514689205440:web:96048a1d267ece5ca71925"
};

const CACHE_KEY = 'qessa_products_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

let db;

function initFirebase() {
    if (!db) {
        const app = initializeApp(FIREBASE_CONFIG);
        db = getFirestore(app);
    }
    return db;
}

function normalizeProduct(docData, id) {
    // Map Firestore new structure to old structure expected by render.js
    const p = {
        id: id,
        category: docData.category,
        name: docData.name,
        type: (docData.category === 'deals') ? 'deal' : (docData.pricing?.type || 'fixed'),
        images: docData.images || [],
        active: docData.active,
        gender: docData.gender // Added missing field
    };

    // Meta fields
    if (docData.meta?.badge) p.badge = docData.meta.badge;
    if (docData.meta?.sizeGroup) p.sizeGroup = docData.meta.sizeGroup;
    if (docData.description) p.desc = docData.description;

    // Map Pricing to flat structure expected by pricing.js { "mid-normal": 100, ... }
    // Map Pricing to flat structure expected by pricing.js { "mid-normal": 100, ... }
    p.prices = {};
    const pricing = docData.pricing || {};

    if (p.type === 'bottle') {
        if (pricing.midNormal) p.prices['mid-normal'] = pricing.midNormal;
        if (pricing.highNormal) p.prices['high-normal'] = pricing.highNormal;
        if (pricing.midOud) p.prices['mid-oud'] = pricing.midOud;
        if (pricing.highOud) p.prices['high-oud'] = pricing.highOud;
    } else if (p.type === 'roll') {
        if (pricing.normal) p.prices['normal'] = pricing.normal;
        if (pricing.oud) p.prices['oud'] = pricing.oud;
    } else if (p.type === 'deal') {
        // Map deal structure: { normal: {before, after}, oud: {before, after} }
        // Fallback: if normalAfter is missing, try fixedNormal
        p.prices = {
            normal: {
                before: pricing.normalBefore || pricing.fixedNormal || 0,
                after: pricing.normalAfter || pricing.fixedNormal || 0
            },
            oud: {
                before: pricing.oudBefore || pricing.fixedOud || 0,
                after: pricing.oudAfter || pricing.fixedOud || 0
            }
        };
        // Ensure discount logic works (if before == after, no discount shown)
        if (p.prices.normal.before === p.prices.normal.after) p.prices.normal.before = 0;
        if (p.prices.oud.before === p.prices.oud.after) p.prices.oud.before = 0;

    } else {
        // Fixed / Others
        if (pricing.fixedNormal) p.prices['normal'] = pricing.fixedNormal;
        if (pricing.fixedOud) p.prices['oud'] = pricing.fixedOud;
    }

    // Pass timestamp for sorting (convert to millis if possible)
    if (docData.createdAt && docData.createdAt.toMillis) {
        p.createdAt = docData.createdAt.toMillis();
    } else if (docData.createdAt) {
        p.createdAt = new Date(docData.createdAt).getTime();
    } else {
        p.createdAt = 0;
    }

    return p;
}

async function fetchProductsFromFirestore(category) {
    try {
        initFirebase();
        const col = collection(db, 'products');
        let q;

        // If we want specific category only:
        if (category && category !== 'all') {
            // Use simple query to avoid Index issues
            q = query(col, where('category', '==', category), where('active', '==', true));
        } else {
            q = query(col, where('active', '==', true));
        }

        // Add Timeout to prevent hanging
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 10000));
        const fetchPromise = getDocs(q);

        const snapshot = await Promise.race([fetchPromise, timeout]);

        let products = snapshot.docs.map(doc => normalizeProduct(doc.data(), doc.id));

        // Client-side Sort (Newest First)
        products.sort((a, b) => b.createdAt - a.createdAt);

        return products;
    } catch (e) {
        console.error("Firestore fetch error:", e);
        throw e;
    }
}

window.DataSource = {
    async getProducts(category) {
        // Strategy: Network First, Fallback to Cache
        // This ensures the user always sees the latest data (Immediate Consistency)

        try {
            // 1. Try to fetch fresh data
            const freshData = await fetchProductsFromFirestore(category);

            // 2. Update Cache
            const cached = localStorage.getItem(CACHE_KEY);
            let cacheObj = {};
            if (cached) {
                try { cacheObj = JSON.parse(cached).data || {}; } catch (e) { }
                if (Array.isArray(cacheObj)) cacheObj = {};
            }

            cacheObj[category] = freshData;

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: cacheObj
            }));

            return freshData;

        } catch (e) {
            console.warn("Network request failed, falling back to cache", e);

            // 3. Fallback to Cache
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const cacheObj = JSON.parse(cached).data || {};
                    return cacheObj[category] || [];
                } catch (err) { }
            }
            return [];
        }
    }
};
