import { getProjects } from './projects-service.js';

const grid = document.getElementById('projectsGrid');
const state = document.getElementById('projectsState');

const difficultyLabels = Object.freeze({
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
});

const statusLabels = Object.freeze({
  open: 'Ouvert',
  full: 'Complet',
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;',
  }[character]));
}

function setState(message, kind = 'loading') {
  state.hidden = false;
  state.classList.toggle('is-error', kind === 'error');
  state.innerHTML = kind === 'loading'
    ? '<span class="loading-dot" aria-hidden="true"></span><span>Chargement des projets…</span>'
    : `<span>${escapeHtml(message)}</span>`;
}

function memberLabel(count) {
  return `${count} ${count > 1 ? 'membres' : 'membre'}`;
}

function projectTemplate(project) {
  const difficulty = difficultyLabels[project.difficulty] || difficultyLabels.moyen;
  const status = statusLabels[project.status] || statusLabels.open;
  const statusClass = project.status === 'full' ? 'tag-status-full' : 'tag-status-open';
  const difficultyClass = `tag-diff-${difficulty.toLowerCase()}`;
  const accent = Number.isInteger(project.accent) && project.accent >= 1 && project.accent <= 6
    ? project.accent
    : 1;
  const languageTags = project.languages
    .map((language) => `<span class="tag tag-lang">${escapeHtml(language)}</span>`)
    .join('');

  return `
    <article class="card project-card reveal">
      <div class="top">
        <h3>${escapeHtml(project.title)}</h3>
        <span class="tag ${statusClass}">${status}</span>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <div class="tags">
        ${languageTags}
        <span class="tag ${difficultyClass}">${difficulty}</span>
      </div>
      <div class="meta">
        <div class="author"><span class="dot accent-${accent}" aria-hidden="true"></span>${escapeHtml(project.author)}</div>
        <span>${escapeHtml(memberLabel(project.memberCount))}</span>
      </div>
    </article>
  `;
}

async function renderProjects() {
  if (!grid || !state) return;
  setState('', 'loading');

  try {
    const projects = await getProjects();

    if (!projects.length) {
      grid.replaceChildren();
      setState('Aucun projet n’est publié pour le moment.', 'empty');
      return;
    }

    grid.innerHTML = projects.map(projectTemplate).join('');
    state.hidden = true;
    window.DevMatch?.observeReveal(grid.querySelectorAll('.reveal'));
  } catch (error) {
    grid.replaceChildren();
    setState('Impossible de charger les projets. Réessaie plus tard.', 'error');
    console.error('Erreur pendant le chargement des projets :', error);
  }
}

renderProjects();
