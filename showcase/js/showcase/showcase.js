document.addEventListener("DOMContentLoaded", () => {
    const showcase = ddcarousel({
        container: ".showcase__carousel",
        autoHeight: false,
        pagination: true,
        nav: true,
        urlNav: true,
        urlNavContainer: ".main-header__links.showcase"
    });

    showcase.ready.catch(console.error);
});