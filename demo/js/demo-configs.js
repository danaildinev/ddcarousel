import { addAction, getCarousel, createCarousel, preview } from "./main.js";

const autoplayEvents = [
    "module:autoplay:started",
    "module:autoplay:stopped",
];

const carouselEvents = [
    "carousel:initialize",
    "carousel:initialized",
    "carousel:destroy",
    "carousel:destroyed",
    "config:applied",
    "module:loaded",
    "module:initialized",
    "module:destroyed",
    "module:unloaded",
    "stage:created",
    "stage:changed",
    "stage:resized",
    "page:change:request",
    "page:change:index",
    "page:change:scroll:before",
    "page:change:scroll:after",
    "page:changed",
    "slide:scroll",
    "drag:start:pre",
    "drag:start",
    "drag:dragging",
    "drag:end",
    "transition:end",
];

export const demoConfigs = {
    default: {
        config: {},
    },
    fixedHeight: {
        config: {
            items: 2,
            autoHeight: false,
        },
        renderOptions: {
            carouselClass: "fixed-height",
        },
    },
    itemsPerPage: {
        config: {
            items: 3,
            itemPerPage: true,
        },
    },
    startPage: {
        config: {
            startPage: 2,
        },
    },
    gap: {
        config: {
            items: 3,
            gap: 24,
        },
    },
    vertical: {
        config: {
            vertical: true,
            items: 2,
        },
    },
    verticalMaxContentWidth: {
        config: {
            vertical: true,
            items: 2,
            verticalMaxContentWidth: true,
        },
        renderOptions: {
            maxCotentLength: 80
        },
    },
    responsive: {
        config: {
            items: 3,
            gap: 20,
            pagination: true,
            nav: false,
            responsive: {
                480: {
                    items: 1,
                    gap: 0,
                    pagination: false,
                    nav: true,
                    autoplay: true
                },
                768: {
                    items: 2,
                    gap: 10,
                    pagination: false,
                    nav: true,
                },
            },
        },
        renderOptions: {
            maxCotentLength: 200
        },
        actions() {
            addAction("Resize to 479px", () => {
                preview.content.style.width = "479px";
                window.dispatchEvent(new Event("resize"));
            });

            addAction("Resize to 767px", () => {
                preview.content.style.width = "767px";
                window.dispatchEvent(new Event("resize"));
            });

            addAction("Revert to original", () => {
                preview.content.removeAttribute("style");
                window.dispatchEvent(new Event("resize"));
            });
        },
    },
    touchDrag: {
        config: {
            touchDrag: true,
            mouseDrag: false,
        },
    },
    dragSnapMode: {
        config: {
            items: 3,
            dragSnapMode: "swipe",
        },
        actions(context) {
            addAction("Change to 'Swipe' mode", () => {
                context.reload({ dragSnapMode: "swipe" });
            });

            addAction("Change to 'Closest' mode", () => {
                context.reload({ dragSnapMode: "closest" });
            });
        },
    },
    mouseDrag: {
        config: {
            touchDrag: false,
            mouseDrag: true,
        },
    },
    centered: {
        config: {
            items: 3,
            centerSlide: true,
        },
        slides: 9,
    },
    keyboardNav: {
        config: {
            keyboardNavigation: true,
        },
    },
    swipeThreshold: {
        config: {
            swipeThreshold: 400,
        },
    },
    dragMaxDistance: {
        config: {
            items: 3,
            dragMaxDistance: 800,
        },
    },
    resizeDebounce: {
        config: {
            resizeDebounce: 700,
            items: 3,
        },
        actions() {
            addAction("Trigger resize", () => {
                const resized = preview.content.dataset.resized !== "true";
                preview.content.dataset.resized = String(resized);

                animateWidth(preview.content, resized ? 800 : 1000, 1000, 200);
            });
        },
    },
    swipeSmooth: {
        config: {
            swipeSmooth: 0.5,
        },
    },
    slideChangeDuration: {
        config: {
            slideChangeDuration: 1.5,
        },
    },
    events: {
        config: {},
        afterInit(context) {
            createEventLogger(context, carouselEvents);
        },
        actions(context) {
            addAction("Log status", async () => {
                const status = await context.carousel.getStatus();
                updateLog("Status", status);
            });

            addAction("Destroy", () => context.carousel.destroy(false));

            addAction("Initialize new instance", async () => {
                createCarousel(12);

                const carousel = ddcarousel();
                context.carousel = carousel;

                preview.events.replaceChildren();
                createEventLogger(context, carouselEvents);

                await carousel.init(context.config);
            });

            addAction("Load pagination module", async () => await context.carousel.loadModule("pagination"));

            addAction("Unload pagination module", async () => await context.carousel.unloadModule("pagination"));
        },
    },
    nav: {
        config: {
            items: 3,
            nav: true,
        },
    },
    navCustomButtons: {
        config: {
            items: 3,
            nav: true,
            navPrevContent: "← Previous",
            navNextContent: "Next →",
        },
    },
    autoplay: {
        config: {
            autoplay: true,
        },
        actions: addAutoplayActions,
    },
    autoplaySpeedNoProgress: {
        config: {
            autoplay: true,
            autoplaySpeed: 1500,
            autoplayProgress: false,
        },
        actions: addAutoplayActions,
        render() {
            createCarousel(40)
        }
    },
    autoplayPause: {
        config: {
            autoplay: true,
            autoplayPauseHover: true,
            autoplayPauseOnTabHidden: true,
        },
        actions: addAutoplayActions,
    },
    autoplayEvents: {
        config: {
            autoplay: true,
        },
        actions: addAutoplayActions,
        afterInit(context) {
            createEventLogger(context, autoplayEvents);
        },
    },
    pagination: {
        config: {
            pagination: true,
        },
        slides: 8,
    },
    lazyLoad: {
        config: {
            lazyLoad: true,
        },
    },
    lazyLoadPreload: {
        config: {
            lazyLoad: true,
            lazyPreload: true,
            lazyPreloadSlides: 2,
        },
    },
    urlNav: {
        config: {
            urlNav: true,
        },
        render() {
            createCarousel(5, { urlData: true });
        },
    },
    urlNavContainer: {
        config: {
            urlNav: true,
            urlNavContainer: ".demo-url-nav",
        },
        render() {
            createCarousel(5, { urlData: true, urlNavContainer: true });
        },
    },
    loop: {
        config: {
            loop: true,
        },
    },
    loopMultipleItemsPerPage: {
        config: {
            loop: true,
            items: 3,
        },
        slides: 9,
    },
    loopMultipleItemsPerPageAndCentered: {
        config: {
            loop: true,
            items: 3,
            centerSlide: true,
        },
        slides: 9,
    },
};

function addAutoplayActions() {
    const getAutoplay = () => getCarousel().module("autoplay");

    addAction("Start autoplay", () => {
        const autoplay = getAutoplay();
        autoplay.start();
    });

    addAction("Stop autoplay", () => {
        const autoplay = getAutoplay();
        autoplay.stop();
    });
}

function animateWidth(element, targetWidth, duration = 2000) {
    const startWidth = element.getBoundingClientRect().width;
    const startTime = performance.now();

    function animate(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const width = startWidth + (targetWidth - startWidth) * progress;

        element.style.width = `${width}px`;

        window.dispatchEvent(new Event("resize"));

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function createEventLogger(context, events) {
    const list = document.createElement("ul");
    list.className = "demo__preview-events-list";

    context.eventListeners = [];

    events.forEach(event => {
        const item = document.createElement("li");
        item.dataset.event = event;
        item.textContent = event;
        list.append(item);

        const callback = payload => carouselEvent(item, event, payload);

        context.carousel.on(event, callback);
        context.eventListeners.push({ event, callback });
    });

    preview.events.append(list);
}

function carouselEvent(item, event, payload) {
    item.classList.add("active");

    setTimeout(() => item.classList.remove("active"), 500);

    updateLog(event, payload);
}

const updateLog = (е, payload) => {
    const time = new Date().toLocaleTimeString();
    const payloadText = payload === undefined ? "\n" : `\n${JSON.stringify(payload, null, 2)}\n`;
    console.log(payload)

    log.value += `[${time}] ${е}${payloadText}`;
    log.scrollTop = log.scrollHeight;
}