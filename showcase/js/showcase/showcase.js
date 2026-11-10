import { initTheme } from "../common.js";

let menu,
    kofi,
    menuExpanded = false;

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const showcase = ddcarousel({
        container: ".showcase__carousel",
        fullPage: true,
        pagination: true,
        nav: true,
        urlNav: true,
        urlNavContainer: ".main-header__links.showcase",
        touchDrag: false,
        slideChangeDuration: 1,
        responsive: {
            1024: {
                nav: false,
            }
        },
        "on:module:initialized": m => {
            if (m.name === "urlNav") {
                document.querySelectorAll(".ddcarousel-module-urlNav__link a").forEach(item => {
                    item.addEventListener("click", () => toggleMenu())
                });
            }
        },
        "on:carousel:initialized": () => initDemoCarousel(),
    });

    showcase.ready.catch(console.error);

    menu = document.querySelector(".main-header__navigation");
    kofi = document.querySelector(".floatingchat-container-wrap-mobi")

    document.querySelector(".main-header__sidebar-open").addEventListener("click", () => toggleMenu())
});

function toggleCarouselEvent(item) {
    item.classList.add("active");
    setTimeout(() => item.classList.remove("active"), 500);
}

function toggleMenu() {
    menuExpanded = !menuExpanded;
    menu.classList.toggle("expanded", menuExpanded)
    kofi.classList.toggle("expanded", menuExpanded)
}

function initDemoCarousel() {
    const slides = [
        {
            title: "Live demo",
            description: "See it in action - swipe, drag and explore smooth transitions"
        },
        {
            title: "Built for flexibility",
            description: "Customize every detail to fit your needs"
        },
        {
            title: "Modern API and events",
            description: "Small but powerfull API with enough hooks to build on."
        },
    ];

    document.querySelector(".demo__carousel").innerHTML = slides.map((slide, index) => `
        <div class="demo__slide demo__slide--${["one", "two", "three"][index]}">
            <h3 class="demo__slide-title">${slide.title}</h3>
            <p class="demo__slide-content">${slide.description}</p>
        </div>
    `).join("");

    const handlerDragging = () => toggleCarouselEvent(document.querySelector('.demo__config [data-event="on:drag:dragging"]'));
    const handlerDragEnd = () => toggleCarouselEvent(document.querySelector('.demo__config [data-event="on:drag:end"]'));
    const handlerPageChanged = () => toggleCarouselEvent(document.querySelector('.demo__config [data-event="on:page:changed"]'));

    const demo = ddcarousel({
        container: ".demo__carousel",
        nav: true,
        pagination: true,
        loop: true,
        "on:drag:dragging": () => handlerDragging(),
        "on:drag:end": () => handlerDragEnd(),
        "on:page:changed": () => handlerPageChanged(),
    });
    demo.ready.catch(console.error);

    document.querySelectorAll("[data-copy]").forEach(el => {
        el.addEventListener("click", async () => {
            const code = el.parentElement.querySelector("code");
            if (!code) {
                return
            }

            await navigator.clipboard.writeText(code.textContent.trim());

            el.textContent = "Copied!";
            setTimeout(() => el.textContent = "Copy", 2000);
        });
    });

    async function loadLatestVersion() {
        const version = document.querySelector(".get-started__version");

        try {
            const response = await fetch("https://api.github.com/repos/danaildinev/ddcarousel/releases/latest");
            if (!response.ok) {
                return;
            }

            const release = await response.json();
            version.querySelector(".get-started__version-number").textContent = release.tag_name;
            version.href = release.html_url;

            if (release.published_at) {
                const date = new Date(release.published_at);
                const dateElement = version.querySelector(".get-started__version-date");

                dateElement.dateTime = release.published_at;
                dateElement.textContent = new Intl.DateTimeFormat("en-US").format(date);
            }
        } catch (error) {
            console.warn("Failed to fetch latest release:", error);
        }
    }

    loadLatestVersion();
}