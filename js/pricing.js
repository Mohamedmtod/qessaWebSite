// Pricing Logic

/**
 * Calculate standard price
 * @param {Object} product - The product object
 * @param {Boolean} isOud - Whether oud mode is enabled
 * @param {String} concentration - 'mid' or 'high' (only for bottles)
 * @returns {Number} Final price
 */
function getProductPrice(product, isOud, concentration = "mid") {
    if (!product.prices) return 0;

    if (product.type === "bottle") {
        // Keys: mid-normal, high-normal, mid-oud, high-oud
        const oudPart = isOud ? "oud" : "normal";
        const concPart = concentration; // 'mid' or 'high'
        const key = `${concPart}-${oudPart}`;
        return safeNum(product.prices[key]);
    } else {
        // Keys: normal, oud
        const key = isOud ? "oud" : "normal";
        return safeNum(product.prices[key]);
    }
}
