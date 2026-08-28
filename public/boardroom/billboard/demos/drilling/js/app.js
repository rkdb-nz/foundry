(() => {
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.menu-drawer');
  const close = document.querySelector('.menu-close');
  const backdrop = document.querySelector('.menu-backdrop');
  const links = [...document.querySelectorAll('.drawer-link')];
  const panels = [...document.querySelectorAll('.drawer-panel')];
  let menuOpener = null;

  function openMenu() {
    menuOpener = document.activeElement;
    body.classList.add('menu-open');
    toggle?.setAttribute('aria-expanded', 'true');
    drawer?.setAttribute('aria-hidden', 'false');
    close?.focus({preventScroll:true});
  }

  function closeMenu() {
    body.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    drawer?.setAttribute('aria-hidden', 'true');
    (menuOpener instanceof HTMLElement ? menuOpener : toggle)?.focus({preventScroll:true});
  }

  function showPanel(name) {
    links.forEach(link => link.classList.toggle('is-active', link.dataset.panel === name));
    panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.content === name));
  }

  toggle?.addEventListener('click', () => {
    if (body.classList.contains('menu-open')) closeMenu();
    else openMenu();
  });
  document.querySelector('.mobile-menu-cta')?.addEventListener('click', openMenu);
  close?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', () => showPanel(link.dataset.panel));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) closeMenu();
    if (event.key === 'Tab' && body.classList.contains('menu-open') && drawer) {
      const focusable = [...drawer.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({preventScroll:true});
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({preventScroll:true});
      }
    }
  });

  document.getElementById('quote-form')?.addEventListener('submit', event => {
    event.preventDefault();
    event.currentTarget.querySelector('.form-status').textContent = 'Thanks — your request has been received. We’ll be in touch shortly.';
  });
})();
