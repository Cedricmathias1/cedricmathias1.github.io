(() => {
  'use strict';
  const toggle = document.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('.work-card')];
  let playing = !preference.matches;
  const animations = new Map();
  const visible = new Set();
  const entered = new Set();

  function updatePlayback() {
    toggle.textContent = playing ? 'Pause previews' : 'Play previews';
    toggle.setAttribute('aria-pressed', String(playing));
    animations.forEach((items, card) => {
      items.forEach(animation => {
        if (playing && visible.has(card) && !document.hidden) animation.play();
        else animation.pause();
      });
    });
  }

  function buildPreviews() {
    animations.forEach(items => items.forEach(animation => animation.cancel()));
    animations.clear();
    cards.forEach(card => {
      const images = [...card.querySelectorAll('.card-art img')];
      const items = images.map((image, index) => {
        const frame = card.querySelector('.card-art');
        const travel = Math.max(0, image.offsetHeight - frame.clientHeight + 80);
        const keyframes = travel > 16
          ? [{ transform: 'translateY(0)' }, { transform: `translateY(-${Math.min(travel, 220)}px)` }]
          : [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }];
        const animation = image.animate(keyframes, {
          duration: 10000 + index * 3000,
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
          fill: 'both'
        });
        animation.pause();
        return animation;
      });
      animations.set(card, items);
    });
    updatePlayback();
  }

  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visible.add(entry.target);
        if (!entered.has(entry.target)) {
          entry.target.classList.add('gallery-arrive');
          entered.add(entry.target);
        }
      } else visible.delete(entry.target);
    });
    updatePlayback();
  }, { threshold: .08 });
  cards.forEach(card => observer.observe(card));
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    playing = !playing;
    updatePlayback();
  });
  preference.addEventListener('change', () => {
    playing = !preference.matches;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  // Observe images as their intrinsic size becomes available, including lazy images.
  const resizeObserver = new ResizeObserver(buildPreviews);
  cards.forEach(card => card.querySelectorAll('.card-art img').forEach(image => resizeObserver.observe(image)));
  buildPreviews();
})();
