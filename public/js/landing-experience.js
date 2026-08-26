const sortButton = document.getElementById('sortButton');
const exploreButton = document.getElementById('exploreButton');
const backButton = document.getElementById('backButton');

const introPanel = document.getElementById('introPanel');
const sortPanel = document.getElementById('sortPanel');
const exploreScreen = document.getElementById('exploreScreen');

const LANDING_STATES = Object.freeze({
    HOME: 'home',
    MAKE_SITE: 'make-site',
    EXPLORE: 'explore'
});

const TRANSITION_TIMING = Object.freeze({
    exit: 300,
    quiet: 80,
    enter: 420,
    get stateChange() {
        return this.exit + this.quiet;
    },
    get total() {
        return this.exit + this.quiet + this.enter;
    }
});

let isTransitioning = false;
let transitionTimers = [];

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function currentState() {
    if (document.body.classList.contains('explore-open')) {
        return LANDING_STATES.EXPLORE;
    }

    if (sortPanel.classList.contains('is-active') || document.body.classList.contains('sort-open')) {
        return LANDING_STATES.MAKE_SITE;
    }

    return LANDING_STATES.HOME;
}

function stateFromHash() {
    if (window.location.hash === '#make-site') {
        return LANDING_STATES.MAKE_SITE;
    }

    if (window.location.hash === '#explore') {
        return LANDING_STATES.EXPLORE;
    }

    return LANDING_STATES.HOME;
}

function historyStateFor(state) {
    if (state === LANDING_STATES.MAKE_SITE) {
        return { foundryState: 'make-site' };
    }

    if (state === LANDING_STATES.EXPLORE) {
        return { foundryState: 'explore' };
    }

    return null;
}

function hashForState(state) {
    if (state === LANDING_STATES.MAKE_SITE) {
        return '#make-site';
    }

    if (state === LANDING_STATES.EXPLORE) {
        return '#explore';
    }

    return '';
}

function updateHistory(state, mode = 'push') {
    if (mode === 'none') {
        return;
    }

    const hash = hashForState(state);
    const destination = hash || `${window.location.pathname}${window.location.search}`;

    if (mode === 'replace') {
        history.replaceState(historyStateFor(state), '', destination);
        return;
    }

    if (window.location.hash !== hash) {
        history.pushState(historyStateFor(state), '', destination);
    }
}

function activateHomeState() {
    document.documentElement.classList.remove('restore-explore', 'restore-sort');
    document.body.classList.remove('explore-open', 'sort-open');

    sortPanel.classList.remove('is-active');
    sortPanel.setAttribute('aria-hidden', 'true');

    exploreScreen.setAttribute('aria-hidden', 'true');

    introPanel.classList.add('is-active');
    introPanel.setAttribute('aria-hidden', 'false');
}

function activateMakeSiteState() {
    document.documentElement.classList.remove('restore-explore');
    document.body.classList.remove('explore-open');
    document.body.classList.add('sort-open');

    exploreScreen.setAttribute('aria-hidden', 'true');

    introPanel.classList.remove('is-active');
    introPanel.setAttribute('aria-hidden', 'true');

    sortPanel.classList.add('is-active');
    sortPanel.setAttribute('aria-hidden', 'false');
}

function activateExploreState() {
    document.documentElement.classList.remove('restore-sort');
    document.body.classList.remove('sort-open');
    document.body.classList.add('explore-open');

    sortPanel.classList.remove('is-active');
    sortPanel.setAttribute('aria-hidden', 'true');

    introPanel.classList.add('is-active');
    introPanel.setAttribute('aria-hidden', 'true');

    exploreScreen.setAttribute('aria-hidden', 'false');
}

function activateState(state) {
    if (state === LANDING_STATES.MAKE_SITE) {
        activateMakeSiteState();
        return;
    }

    if (state === LANDING_STATES.EXPLORE) {
        activateExploreState();
        return;
    }

    activateHomeState();
}

function clearTransitionTimers() {
    transitionTimers.forEach(timer => window.clearTimeout(timer));
    transitionTimers = [];
}

function clearTransitionClasses() {
    document.body.classList.remove(
        'landing-transitioning',
        'landing-phase-exit',
        'landing-phase-quiet',
        'landing-phase-enter',
        'landing-from-home',
        'landing-from-make-site',
        'landing-from-explore',
        'landing-to-home',
        'landing-to-make-site',
        'landing-to-explore',
        'is-forging',
        'is-returning'
    );
}

function finishTransition() {
    clearTransitionTimers();
    clearTransitionClasses();
    sortButton.disabled = false;
    isTransitioning = false;
}

function beginTransitionClasses(fromState, toState) {
    clearTransitionClasses();

    document.body.classList.add(
        'landing-transitioning',
        'landing-phase-exit',
        `landing-from-${fromState}`,
        `landing-to-${toState}`
    );

    if (fromState === LANDING_STATES.HOME && toState === LANDING_STATES.MAKE_SITE) {
        document.body.classList.add('is-forging');
    }

    if (fromState === LANDING_STATES.MAKE_SITE && toState === LANDING_STATES.HOME) {
        document.body.classList.add('is-returning');
    }
}

function transitionToState(toState, { historyMode = 'push', immediate = false } = {}) {
    const fromState = currentState();

    if (isTransitioning || fromState === toState) {
        if (!isTransitioning) {
            updateHistory(toState, historyMode);
        }
        return false;
    }

    updateHistory(toState, historyMode);

    if (immediate || prefersReducedMotion()) {
        finishTransition();
        activateState(toState);
        return true;
    }

    isTransitioning = true;
    sortButton.disabled = true;
    beginTransitionClasses(fromState, toState);

    transitionTimers.push(window.setTimeout(() => {
        document.body.classList.remove('landing-phase-exit');
        document.body.classList.add('landing-phase-quiet');
    }, TRANSITION_TIMING.exit));

    transitionTimers.push(window.setTimeout(() => {
        activateState(toState);
        document.body.classList.remove('landing-phase-quiet');
        document.body.classList.add('landing-phase-enter');
    }, TRANSITION_TIMING.stateChange));

    transitionTimers.push(window.setTimeout(() => {
        finishTransition();
    }, TRANSITION_TIMING.total));

    return true;
}

function showSortPanel(options = {}) {
    closeDrawer();
    return transitionToState(LANDING_STATES.MAKE_SITE, {
        historyMode: options.historyMode || 'push',
        immediate: Boolean(options.immediate)
    });
}

function showExploreScreen(options = {}) {
    closeDrawer();
    return transitionToState(LANDING_STATES.EXPLORE, {
        historyMode: options.historyMode || 'push',
        immediate: Boolean(options.immediate)
    });
}

function showIntroPanel(options = {}) {
    closeDrawer();
    return transitionToState(LANDING_STATES.HOME, {
        historyMode: options.historyMode || 'replace',
        immediate: Boolean(options.immediate)
    });
}

sortButton.addEventListener('click', () => showSortPanel());
backButton?.addEventListener('click', () => showIntroPanel());
exploreButton.addEventListener('click', () => showExploreScreen());


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

/* On landing state two, the global Back control returns through browser history. */
globalBackButton?.addEventListener('click', event => {
    if (isTransitioning) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }

    if (!sortPanel.classList.contains('is-active')) {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (history.state?.foundryState === 'make-site') {
        history.back();
    } else {
        showIntroPanel();
    }
}, true);

/* Let the 560ms global drawer close before beginning the landing-state movement. */
drawerHome?.addEventListener('click', () => {
    window.setTimeout(() => showIntroPanel(), 560);
});

drawerSite?.addEventListener('click', () => {
    window.setTimeout(() => showSortPanel(), 560);
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


/* Restore landing states from their persistent URL hashes without replaying entry motion. */

function restoreStateFromHash() {
    finishTransition();
    activateState(stateFromHash());
}

restoreStateFromHash();
window.addEventListener('DOMContentLoaded', restoreStateFromHash);

window.addEventListener('hashchange', () => {
    transitionToState(stateFromHash(), { historyMode: 'none' });
});

window.addEventListener('pageshow', () => {
    restoreStateFromHash();
});

window.addEventListener('popstate', () => {
    transitionToState(stateFromHash(), { historyMode: 'none' });
});
