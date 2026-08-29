document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('message-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('sender-name').value.trim();
      const email = document.getElementById('sender-email').value.trim();
      const message = document.getElementById('sender-message').value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please complete all three fields.';
        return;
      }

      const subject = encodeURIComponent(`A trail message for Kōkiri from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
      status.textContent = 'Opening your email app…';
      window.location.href = `mailto:kokiri@ontheroad.nz?subject=${subject}&body=${body}`;
    });
  }

  const mobileViews = Array.from(document.querySelectorAll('[data-mobile-view]'));
  const viewButtons = document.querySelectorAll('[data-open-view]');
  const showMobileView = (name) => {
    mobileViews.forEach((view) => {
      const active = view.dataset.mobileView === name;
      view.hidden = false;
      view.classList.toggle('is-active', active);
      view.setAttribute('aria-hidden', String(!active));
      if (!active) {
        window.setTimeout(() => {
          if (!view.classList.contains('is-active')) view.hidden = true;
        }, 360);
      }
    });
  };

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => showMobileView(button.dataset.openView));
  });

  const diaryEntries = Array.from(document.querySelectorAll('.mobile-diary-entry'));
  const diaryCurrent = document.querySelector('[data-diary-current]');
  let diaryIndex = 0;
  const showDiaryEntry = (nextIndex) => {
    diaryIndex = (nextIndex + diaryEntries.length) % diaryEntries.length;
    diaryEntries.forEach((entry, index) => entry.classList.toggle('is-current', index === diaryIndex));
    if (diaryCurrent) diaryCurrent.textContent = String(diaryIndex + 1);
  };

  document.querySelectorAll('[data-diary-step]').forEach((button) => {
    button.addEventListener('click', () => showDiaryEntry(diaryIndex + Number(button.dataset.diaryStep)));
  });

  let touchStartX = 0;
  const diaryStack = document.querySelector('.mobile-diary-stack');
  if (diaryStack) {
    diaryStack.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    diaryStack.addEventListener('touchend', (event) => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 45) showDiaryEntry(diaryIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }
});
