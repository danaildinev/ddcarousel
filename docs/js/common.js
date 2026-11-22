export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
    }

    document.getElementById('theme-toggle').addEventListener('click', () => toggleTheme());
}

export function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.dataset.theme;

    let newTheme;
    if (!currentTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        newTheme = prefersDark ? 'light' : 'dark';
    } else {
        newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    }

    html.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
}

export function throttle(callback, delay) {
    let lastCall = 0;

    return (...args) => {
        const now = performance.now();

        if (now - lastCall < delay) {
            return;
        }

        lastCall = now;
        callback(...args);
    };
}