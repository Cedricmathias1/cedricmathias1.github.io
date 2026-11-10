(() => {
  'use strict';

  const links = Array.from(document.querySelectorAll('.case-jumps a'));
  const chapters = links.map(link => document.querySelector(link.hash));
  let scheduled = false;

  function markChapter() {
    scheduled = false;
    const readingLine = window.innerHeight * .3;
    const index = chapters.findLastIndex(chapter => chapter.getBoundingClientRect().top <= readingLine);
    links.forEach((link, position) => {
      if (position === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleChapterUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(markChapter);
  }

  window.addEventListener('scroll', scheduleChapterUpdate, { passive: true });
  window.addEventListener('resize', scheduleChapterUpdate);
  window.addEventListener('load', scheduleChapterUpdate);
  markChapter();

  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.className = 'screen-dialog';
  dialog.setAttribute('aria-label', 'Prototype screenshot');
  dialog.innerHTML = '<header><span></span><button type="button" autofocus>Close</button></header><img alt="">';
  document.body.append(dialog);

  const image = dialog.querySelector('img');
  const title = dialog.querySelector('span');
  dialog.querySelector('button').addEventListener('click', () => dialog.close());

  document.querySelectorAll('.decision-visual a').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const preview = link.querySelector('img');
      title.textContent = preview.alt;
      image.alt = preview.alt;
      image.src = link.href;
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  });
})();
