(() => {
  'use strict';
  const projects = window.portfolioProjects;
  if (!Array.isArray(projects) || !projects.length) return;
  const cards = Array.from(document.querySelectorAll('.work-card'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const dialog = document.getElementById('project-dialog');
  let activeFilter = 'all';
  let activeProject = null;
  let screenIndex = 0;
  let opener = null;
  const $ = id => document.getElementById(id);
  const plain = (id, text) => { $(id).textContent = text; };

  function filterProjects(value) {
    activeFilter = ['all', 'design', 'growth'].includes(value) ? value : 'all';
    let count = 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
    cards.forEach(card => {
      const visible = activeFilter === 'all' || card.dataset.category === activeFilter;
      card.hidden = !visible;
      card.classList.remove('filter-enter');
      if (visible) { count++; void card.offsetWidth; card.classList.add('filter-enter'); }
    });
    plain('project-count', `${count} ${count === 1 ? 'project' : 'projects'}`);
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  document.querySelectorAll('[data-enter]').forEach(link => link.addEventListener('click', () => filterProjects(link.dataset.enter)));

  function fillMetrics(parent, metrics) {
    parent.replaceChildren();
    metrics.forEach(([value, label]) => {
      const item = document.createElement('div');
      const strong = document.createElement('strong');
      const span = document.createElement('span');
      strong.textContent = value; span.textContent = label;
      item.append(strong, span); parent.append(item);
    });
  }
  function renderScreen() {
    const screens = activeProject.screens;
    const hasScreens = screens.length > 0;
    $('screen-figure').hidden = !hasScreens;
    $('gallery-controls').hidden = screens.length < 2;
    $('metric-art').hidden = hasScreens;
    if (!hasScreens) {
      $('project-screen').removeAttribute('src');
      fillMetrics($('metric-art'), activeProject.metrics);
      return;
    }
    const [src, caption] = screens[screenIndex];
    const image = $('project-screen');
    image.src = src; image.alt = caption;
    plain('screen-caption', caption);
    plain('screen-position', `${screenIndex + 1} / ${screens.length}`);
  }
  function renderProject(project) {
    activeProject = project; screenIndex = 0;
    plain('dialog-client', project.client);
    plain('dialog-title', project.title);
    plain('dialog-role', `${project.role} · ${project.period}`);
    plain('dialog-challenge', project.challenge);
    plain('dialog-note', project.note);
    plain('dialog-status', project.status);
    const visibleProjects = projects.filter(p => activeFilter === 'all' || p.category === activeFilter);
    plain('dialog-position', `Project ${visibleProjects.findIndex(p => p.id === project.id) + 1} / ${visibleProjects.length}`);
    const list = $('dialog-contributions');
    list.replaceChildren();
    project.contributions.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
    fillMetrics($('dialog-metrics'), project.metrics);
    const link = $('dialog-link');
    link.href = project.url;
    link.textContent = project.category === 'design' ? 'Read full case study ↗' : 'Explore my role ↗';
    renderScreen();
    dialog.scrollTop = 0;
  }
  document.querySelectorAll('[data-quick]').forEach(button => {
    button.addEventListener('click', () => {
      const project = projects.find(p => p.id === button.dataset.quick);
      if (!project || typeof dialog.showModal !== 'function') return;
      opener = button;
      renderProject(project);
      dialog.showModal();
      document.body.classList.add('modal-open');
      $('close-project').focus();
    });
    if (typeof dialog.showModal === 'function') button.hidden = false;
  });
  $('close-project').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  $('next-screen').addEventListener('click', () => { screenIndex = (screenIndex + 1) % activeProject.screens.length; renderScreen(); });
  $('previous-screen').addEventListener('click', () => { screenIndex = (screenIndex - 1 + activeProject.screens.length) % activeProject.screens.length; renderScreen(); });
  $('next-project').addEventListener('click', () => {
    const items = projects.filter(p => activeFilter === 'all' || p.category === activeFilter);
    const index = items.findIndex(p => p.id === activeProject.id);
    renderProject(items[(index + 1) % items.length]);
    $('close-project').focus();
  });

  const tabs = Array.from(document.querySelectorAll('.company-list [role="tab"]'));
  function selectCompany(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = $(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', item.id);
      panel.tabIndex = 0;
    });
    if (focus) tab.focus({ preventScroll: true });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCompany(tab));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
      else if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); selectCompany(tabs[next], true);
    });
  });
  $('dialog-link').addEventListener('click', () => {
    if (!activeProject || activeProject.category !== 'growth') return;
    selectCompany($(`tab-${activeProject.id}`));
    dialog.close();
    // Focus the destination after native modal focus restoration.
    requestAnimationFrame(() => $(`job-${activeProject.id}`).focus({ preventScroll: true }));
  });
  document.querySelectorAll('.work-card[data-category="growth"] .text-link').forEach(link => {
    link.addEventListener('click', () => selectCompany($(`tab-${link.closest('.work-card').dataset.project}`)));
  });
  selectCompany(tabs[0]);
  document.querySelector('.company-list').hidden = false;
  document.querySelector('.filter-row').hidden = false;
  document.documentElement.classList.add('enhanced');
})();
