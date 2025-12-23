// WhatsApp Link Generator

function generateWALink(product, price, isOud, concentration) {
    const phone = SETTINGS.whatsappNumber;
    let text = `السلام عليكم، أريد ${product.name}`;

    if (product.badge) {
        text += ` (${product.badge})`;
    }

    if (product.type === "bottle") {
        const concLabel = concentration === "high" ? "تركيز عالي" : "تركيز متوسط";
        text += ` - ${concLabel}`;
    }

    if (isOud) {
        text += ` (مضاف إليه عود)`;
    }

    text += ` بسعر ${fmtCurrency(price)} ${SETTINGS.currency}.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
