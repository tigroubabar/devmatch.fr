import { getProjects } from './projects-service.js';
import { discordInvite } from './projects-data.js';

const grid = document.getElementById('projectsGrid');
const state = document.getElementById('projectsState');
const modal = document.getElementById('projectDetailsModal');
const modalTitle = document.getElementById('projectDetailsTitle');
const modalDescription = document.getElementById('projectDetailsDescription');
const modalTags = document.getElementById('projectDetailsTags');
const modalMeta = document.getElementById('projectDetailsMeta');
const modalLongDescription = document.getElementById('projectDetailsLongDescription');
const closeModalButton = document.getElementById('closeProjectDetails');

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

function showProjectDetails(project) {
  if (!modal || !modalTitle || !modalDescription || !modalTags || !modalMeta || !modalLongDescription) return;

  const owner = project.ownerUsername || project.owner || project.author || 'Anonyme';
  const count = typeof project.memberCount === 'number'
    ? project.memberCount
    : Array.isArray(project.members)
      ? project.members.length
      : 0;
  const openSourceLabel = project.openSource ? '🔓 Open Source' : '🔒 Propriétaire';

  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;
  modalTags.innerHTML = [
    ...(project.languages || []).map((language) => `<span class="tag tag-lang">${escapeHtml(language)}</span>`),
    `<span class="tag tag-diff-stars">${escapeHtml(difficultyStars(project.difficulty))}</span>`,
    `<span class="tag tag-open-source">${openSourceLabel}</span>`,
  ].join('');
  modalMeta.textContent = `${owner} · ${memberLabel(count)}`;
  modalLongDescription.textContent = project.long_description || 'Aucune description détaillée disponible.';
  modal.showModal();
}

function setupProjectDetails() {
  if (!grid || !modal) return;

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project-details]');
    if (!button) return;

    const project = button._project;
    if (project) showProjectDetails(project);
  });

  closeModalButton?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
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
        <button class="btn btn-secondary btn-full" type="button" data-project-details>Voir les détails</button>
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
    grid.querySelectorAll('[data-project-details]').forEach((button, index) => {
      button._project = projects[index];
    });
    state.hidden = true;
    window.DevMatch?.observeReveal(grid.querySelectorAll('.reveal'));
  } catch (error) {
    grid.replaceChildren();
    setState('Impossible de charger les projets. Réessaie plus tard.', 'error');
    console.error('Erreur pendant le chargement des projets :', error);
  }
}

setupProjectDetails();
renderProjects();
