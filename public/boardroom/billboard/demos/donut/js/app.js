(() => {
  const site = document.getElementById('site');
  const triggers = [...document.querySelectorAll('[data-overlay]')];
  const overlays = [...document.querySelectorAll('.overlay')];
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  let lastTrigger = null;
  let closeTimer = null;

  function closeMobileMenu() {
    if (!mobileMenuToggle || !mobileMenuPanel) return;
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Open menu');
    mobileMenuPanel.hidden = true;
  }

  function toggleMobileMenu() {
    if (!mobileMenuToggle || !mobileMenuPanel) return;
    const opening = mobileMenuToggle.getAttribute('aria-expanded') !== 'true';
    mobileMenuToggle.setAttribute('aria-expanded', String(opening));
    mobileMenuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
    mobileMenuPanel.hidden = !opening;
  }

  function resetOverlay(overlay) {
    overlay.classList.remove('is-opening', 'is-open', 'is-closing');
  }

  function hideImmediately(overlay) {
    resetOverlay(overlay);
    overlay.hidden = true;
  }

  function openOverlay(name, trigger) {
    const overlay = document.getElementById(`overlay-${name}`);
    if (!overlay) return;

    closeMobileMenu();
    clearTimeout(closeTimer);
    overlays.forEach(other => {
      if (other !== overlay) hideImmediately(other);
    });

    lastTrigger = trigger;
    resetOverlay(overlay);
    overlay.hidden = false;
    document.body.classList.add('overlay-open');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('is-opening');
        setTimeout(() => {
          overlay.classList.remove('is-opening');
          overlay.classList.add('is-open');
          overlay.querySelector('.overlay-close')?.focus();
        }, 620);
      });
    });
  }

  function closeAll(restoreFocus = true) {
    const active = overlays.find(overlay => !overlay.hidden);
    if (!active) {
      document.body.classList.remove('overlay-open');
      return;
    }

    clearTimeout(closeTimer);
    active.classList.remove('is-opening', 'is-open');
    active.classList.add('is-closing');
    document.body.classList.remove('overlay-open');

    closeTimer = setTimeout(() => {
      hideImmediately(active);
      if (restoreFocus && lastTrigger) lastTrigger.focus();
    }, 500);
  }

  mobileMenuToggle?.addEventListener('click', toggleMobileMenu);

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => openOverlay(trigger.dataset.overlay, trigger));
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeAll();
    });

    const close = overlay.querySelector('.overlay-close');
    if (close) {
      close.textContent = 'Back to site';
      close.addEventListener('click', () => closeAll());
    }
  });

  document.addEventListener('click', event => {
    if (!mobileMenuPanel || mobileMenuPanel.hidden) return;
    if (mobileMenuPanel.contains(event.target) || mobileMenuToggle?.contains(event.target)) return;
    closeMobileMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (mobileMenuPanel && !mobileMenuPanel.hidden) {
        closeMobileMenu();
        mobileMenuToggle?.focus();
        return;
      }
      closeAll();
      return;
    }
    if (event.key !== 'Tab') return;
    const active = overlays.find(overlay => !overlay.hidden);
    if (!active) return;
    const focusable = [...active.querySelectorAll('button,input,select,textarea,[href],[tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.getElementById('catering-enquiry')?.addEventListener('click', event => {
    const button = event.currentTarget;
    button.classList.remove('is-sending');
    void button.offsetWidth;
    button.classList.add('is-sending');

    setTimeout(() => {
      window.location.href = 'mailto:aholein1@rkdb.nz?subject=Catering%20Enquiry&body=Hi%20there%2C%0A%0AI%27d%20like%20to%20make%20a%20catering%20enquiry.%0A%0A';
    }, 320);
  });

  document.getElementById('order-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const status = event.currentTarget.querySelector('.form-status');
    status.textContent = 'Got it! Consider your message freshly glazed and delivered.';
  });

  site.querySelector('.brand')?.addEventListener('click', event => {
    event.preventDefault();
    closeMobileMenu();
    closeAll(false);
  });
})();
