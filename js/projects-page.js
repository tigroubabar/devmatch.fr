import { getProjects } from './projects-service.js';
import { discordInvite } from './projects-data.js';

const grid = document.getElementById('projectsGrid');
const state = document.getElementById('projectsState');

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

function difficultyStars(value) {
  const count = Number(value);
  if (Number.isInteger(count) && count >= 1 && count <= 5) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  const fallback = {
    facile: '★☆☆☆☆',
    moyen: '★★★☆☆',
    difficile: '★★★★☆',
  }[String(value).toLowerCase()];

  return fallback || '☆☆☆☆☆';
}

function projectTemplate(project) {
  const stars = difficultyStars(project.difficulty);
  const accent = Number.isInteger(project.accent) && project.accent >= 1 && project.accent <= 6
    ? project.accent
    : 1;
  const languageTags = project.languages
    .map((language) => `<span class="tag tag-lang">${escapeHtml(language)}</span>`)
    .join('');
  const owner = project.ownerUsername || project.owner || project.author || 'Anonyme';
  const count = typeof project.memberCount === 'number'
    ? project.memberCount
    : Array.isArray(project.members)
      ? project.members.length
      : 0;
  const openSourceBadge = project.openSource
    ? '<span class="tag tag-open-source">🔓 Open Source</span>'
    : '<span class="tag tag-open-source">🔒 Propriétaire</span>';

  return `
    <article class="card project-card reveal">
      <div class="top">
        <h3>${escapeHtml(project.title)}</h3>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <div class="tags">
        ${languageTags}
        <span class="tag tag-diff-stars">${escapeHtml(stars)}</span>
        ${openSourceBadge}
      </div>
      <div class="meta">
        <div class="author"><span class="dot accent-${accent}" aria-hidden="true"></span>${escapeHtml(owner)}</div>
        <span>${escapeHtml(memberLabel(count))}</span>
      </div>
      <div class="project-cta">
        <a class="btn btn-primary btn-full" href="${discordInvite}" target="_blank" rel="noopener noreferrer">Rejoindre le projet</a>
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
