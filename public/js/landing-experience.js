const sortButton = document.getElementById('sortButton');
const exploreButton = document.getElementById('exploreButton');
const backButton = document.getElementById('backButton');

const introPanel = document.getElementById('introPanel');
const sortPanel = document.getElementById('sortPanel');
const exploreScreen = document.getElementById('exploreScreen');
const landingStateBlackout = document.getElementById('landingStateBlackout');

const STATE_FADE_OUT_MS = 420;
const STATE_FADE_IN_MS = 520;

let isTransitioning = false;

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clearLegacyTransitionClasses() {
    document.body.classList.remove('is-forging', 'is-returning');
}

function clearExploreTransitionClass() {
    document.body.classList.remove(
        'explore-transitioning',
        'explore-crossfade',
        'explore-crossfade-complete'
    );
}

function activateSortPanel({ preserveForge = false } = {}) {
    if (!preserveForge) {
        clearLegacyTransitionClasses();
    }

    clearExploreTransitionClass();
    document.documentElement.classList.remove('restore-explore');
    document.body.classList.remove('explore-open');
    document.body.classList.add('sort-open');

    exploreScreen?.setAttribute('aria-hidden', 'true');

    introPanel.classList.remove('is-active');
    introPanel.setAttribute('aria-hidden', 'true');

    sortPanel.classList.add('is-active');
    sortPanel.setAttribute('aria-hidden', 'false');
}

function activateIntroPanel() {
    clearLegacyTransitionClasses();
    clearExploreTransitionClass();
    document.documentElement.classList.remove('restore-explore', 'restore-sort');
    document.body.classList.remove('explore-open', 'sort-open');

    sortPanel.classList.remove('is-active');
    sortPanel.setAttribute('aria-hidden', 'true');

    exploreScreen?.setAttribute('aria-hidden', 'true');

    introPanel.classList.add('is-active');
    introPanel.setAttribute('aria-hidden', 'false');
}

function activateExploreScreen() {
    clearLegacyTransitionClasses();
    document.documentElement.classList.remove('restore-sort');
    document.body.classList.remove('sort-open');
    document.body.classList.add('explore-open');
    clearExploreTransitionClass();

    introPanel.classList.remove('is-active');
    introPanel.setAttribute('aria-hidden', 'true');

    sortPanel.classList.remove('is-active');
    sortPanel.setAttribute('aria-hidden', 'true');

    exploreScreen?.setAttribute('aria-hidden', 'false');
}

function transitionTo(activateState) {
    if (isTransitioning) {
        return;
    }

    clearLegacyTransitionClasses();

    if (prefersReducedMotion()) {
        activateState();
        return;
    }

    if (!landingStateBlackout) {
        activateState();
        return;
    }

    isTransitioning = true;
    landingStateBlackout.className = 'landing-state-blackout';
    void landingStateBlackout.offsetWidth;
    landingStateBlackout.classList.add('is-fading-to-black');

    window.setTimeout(() => {
        landingStateBlackout.className = 'landing-state-blackout is-black';
        activateState();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                landingStateBlackout.className = 'landing-state-blackout is-fading-from-black';

                window.setTimeout(() => {
                    landingStateBlackout.className = 'landing-state-blackout';
                    isTransitioning = false;
                }, STATE_FADE_IN_MS);
            });
        });
    }, STATE_FADE_OUT_MS);
}

function transitionHomeToExplore() {
    transitionTo(activateExploreScreen);
}

function forgeHomeToSort() {
    if (isTransitioning) {
        return;
    }

    if (prefersReducedMotion()) {
        activateSortPanel();
        return;
    }

    isTransitioning = true;
    sortButton.disabled = true;
    document.body.classList.remove('state-fade-out', 'state-fade-in', 'is-returning');
    document.body.classList.add('is-forging');

    window.setTimeout(() => {
        activateSortPanel({ preserveForge: true });
    }, 1400);

    window.setTimeout(() => {
        document.body.classList.remove('is-forging');
        sortButton.disabled = false;
        isTransitioning = false;
    }, 3200);
}

function showSortPanel() {
    if (sortPanel.classList.contains('is-active') && !document.body.classList.contains('explore-open')) {
        return;
    }

    if (window.location.hash !== '#make-site') {
        history.pushState({ foundryState: 'make-site' }, '', '#make-site');
    }

    const comingDirectlyFromHome =
        introPanel.classList.contains('is-active') &&
        !document.body.classList.contains('explore-open');

    if (comingDirectlyFromHome) {
        forgeHomeToSort();
    } else {
        transitionTo(activateSortPanel);
    }
}

function showIntroPanel({ updateHistory = true } = {}) {
    if (updateHistory && window.location.hash) {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }

    if (introPanel.classList.contains('is-active') && !document.body.classList.contains('explore-open')) {
        activateIntroPanel();
        return;
    }

    transitionTo(activateIntroPanel);
}

function showExploreScreen() {
    closeDrawer();

    if (document.body.classList.contains('explore-open')) {
        return;
    }

    if (window.location.hash !== '#explore') {
        history.pushState({ foundryState: 'explore' }, '', '#explore');
    }

    const comingDirectlyFromHome =
        introPanel.classList.contains('is-active') &&
        !document.body.classList.contains('sort-open');

    if (comingDirectlyFromHome) {
        transitionHomeToExplore();
    } else {
        transitionTo(activateExploreScreen);
    }
}

sortButton?.addEventListener('click', showSortPanel);
backButton?.addEventListener('click', () => showIntroPanel());
exploreButton?.addEventListener('click', showExploreScreen);


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

globalBackButton?.addEventListener('click', event => {
    const onSecondaryLandingState =
        sortPanel.classList.contains('is-active') ||
        document.body.classList.contains('explore-open');

    if (!onSecondaryLandingState) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (window.location.hash === '#make-site' || window.location.hash === '#explore') {
        history.back();
    } else {
        showIntroPanel();
    }
}, true);

drawerHome?.addEventListener('click', () => {
    window.setTimeout(() => showIntroPanel(), 600);
});

drawerSite?.addEventListener('click', () => {
    window.setTimeout(showSortPanel, 380);
});


/* Real navigation links close the drawer before the existing page transition runs. */
document.querySelectorAll('.drawer-link[href]').forEach(link => {
    link.addEventListener('click', closeDrawer);
});

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#explore' || window.location.hash === '#make-site') {
        return;
    }

    introPanel.classList.remove('is-arriving', 'home-return');
    introPanel.classList.add('landing-enter');

    window.setTimeout(() => {
        introPanel.classList.remove('landing-enter');
    }, 1050);
});


/* Restore landing states from their persistent URL hashes without replaying a transition on load. */
function restoreStateFromHash({ animate = false } = {}) {
    if (window.location.hash === '#explore') {
        if (animate) {
            transitionTo(activateExploreScreen);
        } else {
            activateExploreScreen();
        }
    } else if (window.location.hash === '#make-site') {
        document.documentElement.classList.add('restore-sort');
        if (animate) {
            transitionTo(activateSortPanel);
        } else {
            activateSortPanel();
        }
    } else if (!introPanel.classList.contains('is-active') || document.body.classList.contains('explore-open')) {
        if (animate) {
            transitionTo(activateIntroPanel);
        } else {
            activateIntroPanel();
        }
    }
}

restoreStateFromHash();
window.addEventListener('DOMContentLoaded', () => restoreStateFromHash());

window.addEventListener('pageshow', () => {
    restoreStateFromHash();
});

window.addEventListener('popstate', () => {
    restoreStateFromHash({ animate: true });
});
