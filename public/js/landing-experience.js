const sortButton = document.getElementById('sortButton');
const backButton = document.getElementById('backButton');

const introPanel = document.getElementById('introPanel');
const sortPanel = document.getElementById('sortPanel');
const exploreScreen = document.getElementById('exploreScreen');

let isTransitioning = false;

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function activateSortPanel() {
    introPanel.classList.remove('is-active');
    introPanel.setAttribute('aria-hidden', 'true');

    sortPanel.classList.add('is-active');
    sortPanel.setAttribute('aria-hidden', 'false');
}

function activateIntroPanel() {
    sortPanel.classList.remove('is-active');
    sortPanel.setAttribute('aria-hidden', 'true');

    introPanel.classList.add('is-active');
    introPanel.setAttribute('aria-hidden', 'false');
}

function showSortPanel() {
    if (isTransitioning || sortPanel.classList.contains('is-active')) {
        return;
    }

    if (prefersReducedMotion()) {
        activateSortPanel();
        return;
    }

    isTransitioning = true;
    sortButton.disabled = true;
    document.body.classList.add('is-forging');

    window.setTimeout(() => {
        activateSortPanel();
    }, 1400);

    window.setTimeout(() => {
        document.body.classList.remove('is-forging');
        sortButton.disabled = false;
        isTransitioning = false;
    }, 3200);
}

function showIntroPanel() {
    document.documentElement.classList.remove('restore-explore');
    document.body.classList.remove('explore-open');

    if (exploreScreen) {
        exploreScreen.setAttribute('aria-hidden', 'true');
    }

    if (isTransitioning) {
        return;
    }

    if (!sortPanel.classList.contains('is-active') || prefersReducedMotion()) {
        activateIntroPanel();
        return;
    }

    isTransitioning = true;
    document.body.classList.add('is-returning');

    window.setTimeout(() => {
        activateIntroPanel();
    }, 1200);

    window.setTimeout(() => {
        document.body.classList.remove('is-returning');
        isTransitioning = false;
    }, 2850);
}

sortButton.addEventListener('click', showSortPanel);
backButton.addEventListener('click', showIntroPanel);


/* =========================================================
   GLOBAL NAV: LANDING-PAGE ACTIONS
   ========================================================= */

const drawerHome = document.querySelector('[data-drawer-action="home"]');
const drawerSite = document.querySelector('[data-drawer-action="site"]');
const globalBackButton = document.querySelector('.foundry-global-back');

function closeDrawer() {
    if (typeof window.closeFoundryDrawer === 'function') {
        window.closeFoundryDrawer();
    }
}

/* On landing state two, the global Back control returns to state one. */
globalBackButton?.addEventListener('click', event => {
    if (!sortPanel.classList.contains('is-active')) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    showIntroPanel();
}, true);

drawerHome?.addEventListener('click', () => {
    window.setTimeout(showIntroPanel, 600);
});

drawerSite?.addEventListener('click', () => {
    window.setTimeout(showSortPanel, 380);
});


/* LET ME CHOOSE */

function showExploreScreen() {
    closeDrawer();

    if (window.location.hash !== '#explore') {
        history.pushState(null, '', '#explore');
    }

    document.body.classList.add('explore-open');

    introPanel.setAttribute('aria-hidden', 'true');
    exploreScreen.setAttribute('aria-hidden', 'false');
}

exploreButton.addEventListener('click', showExploreScreen);


/* Real navigation links close the drawer before the existing page transition runs. */
document.querySelectorAll('.drawer-link[href]').forEach(link => {
    link.addEventListener('click', closeDrawer);
});

window.addEventListener('DOMContentLoaded', () => {
    introPanel.classList.remove('is-arriving', 'home-return');
    introPanel.classList.add('landing-enter');

    window.setTimeout(() => {
        introPanel.classList.remove('landing-enter');
    }, 1050);
});


/* Restore Explore when returning from a subpage via /#explore */

function restoreExploreFromHash() {
    if (window.location.hash === '#explore') {
        showExploreScreen();
    }
}

window.addEventListener('DOMContentLoaded', restoreExploreFromHash);
window.addEventListener('hashchange', restoreExploreFromHash);

window.addEventListener('pageshow', () => {
    if (window.location.hash === '#explore') {
        showExploreScreen();
    }
});

window.addEventListener('popstate', () => {
    if (window.location.hash === '#explore') {
        showExploreScreen();
    } else {
        showIntroPanel();
    }
});
