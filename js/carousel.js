// Carousel Logic

function initCarousel(cardElement) {
    const container = cardElement.querySelector('.x-carousel-container');
    if (!container) return;

    const wrapper = container.querySelector('.x-carousel-wrapper');
    const dots = container.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    const totalSlides = dots.length;

    if (totalSlides <= 1) return;

    function update() {
        wrapper.style.transform = `translateX(${currentIndex * 100}%)`; // RTL: positive x moves right? No, standard translate usually works on visual order.
        // In RTL, 100% might push it the wrong way. Let's test standard negative translateX logic for LTR, but for RTL...
        // simpler: scrollLeft or standard flex logic.
        // Let's use simple logic: wrapper is flex.
        // transform: translateX(50%) moves element right.
        // We want to SHOW the next image.
        // If standard flex row, img1 is first.
        // To show img2, we move wrapper LEFT (-100%).
        // It works same in RTL if direction is handled by browser?
        // Let's assume standard carousel logic: translateX(-index * 100%)

        wrapper.style.transform = `translateX(${currentIndex * 100}%)`;
        // Wait, in RTL mode:
        // Image 1 is at right most.
        // Image 2 is to its left.
        // To see Image 2, we move the wrapper to the RIGHT (+100%)?
        // Actually simpler to use scrollIntoView or just try standard logic.
        // I'll stick to a simpler approach: Hide/Show slides or use safe translateX.
        // Let's try standard negative translateX first, usually libraries force LTR for carousels to avoid this headache.
        // But I will use the code from existing site used scrollSnap which is robust.
    }
}

// Re-implementing the robust scroll-snap logic from the original code which is CSS based with JS helper for dots
function attachCarouselEvents(card) {
    const container = card.querySelector('.x-carousel-container');
    if (!container) return;

    const imagesContainer = container.querySelector('.x-carousel-wrapper'); // We reused class names
    // In our CSS helper I made .x-carousel-wrapper flex.
    // Let's ensure the CSS supports scroll snap if we want to use that, OR use transform.
    // The user prompt's code used scroll-snap. I replaced it with `x-carousel-wrapper` and transform in CSS?
    // Checking my CSS...
    // .x-carousel-wrapper { display: flex; transition: transform 0.3s ease-out; }
    // So I committed to transform-based.

    // RTL TRANSFORM ISSUE:
    // In RTL, standard transform: translateX(-100%) moves element to LEFT.
    // Images are laid out Right to Left?
    // Flex container by default in RTL: Item 1 is Right, Item 2 Left.
    // To show Item 2, we need to move container RIGHT (+100%).

    const dots = container.querySelectorAll('.carousel-dot');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Update active dot
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            // Move wrapper
            // For RTL: positive value moves right.
            imagesContainer.style.transform = `translateX(${index * 100}%)`;
        });
    });
}
