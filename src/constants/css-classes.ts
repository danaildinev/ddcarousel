export const CSS_CLASSES = {
    container: "ddcarousel__container",
    stage: "ddcarousel__stage",
    stageDragging: "ddcarousel__stage-dragging",
    disabled: "ddcarousel__stage--disabled",
    item: "ddcarousel__item",
    fullWidth: "ddcarousel--full-width",
    autoHeight: "ddcarousel--auto-height",
    vertical: "ddcarousel--vertical",

    pagination: "ddcarousel-module-pagination__container",
    dot: "ddcarousel-module-pagination__dot",

    nav: "ddcarousel-module-nav",
    prev: "ddcarousel-module-nav__prev",
    next: "ddcarousel-module-nav__next",

    urls: "ddcarousel-module-urlNav__container",

    progress: "ddcarousel-module-autoplay__progress",
    progressBar: "ddcarousel-module-autoplay__progress-bar",

    // may not be needed
    slidePrev: "slide-prev",
    slideNext: "slide-next",
    slideVisible: "slide-visible"
} as const;