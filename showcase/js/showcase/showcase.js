document.addEventListener("DOMContentLoaded", () => {
    const showcase = ddcarousel({
        container: ".showcase__carousel",
        autoHeight: false,
        pagination: true,
        nav: true,
        urlNav: true,
        urlNavContainer: ".main-header__links-page"
    });

    showcase.ready.catch(console.error);
});