import { DEMO_PROJECTS, SUPABASE_ANON_KEY, SUPABASE_URL } from './projects.js';

function cloneFallbackProjects() {
  return DEMO_PROJECTS.map((project) => ({
    ...project,
    languages: [...project.languages],
    members: [...project.members],
    memberCount: project.members.length,
  }));
}

function normalizeProject(project) {
  const languages = Array.isArray(project.languages) ? project.languages : [];
  const members = Array.isArray(project.members) ? project.members : [];
  const ownerUsername = project.owner_username || project.ownerUsername || project.owner || '';
  const accentSeed = String(project.id || project.owner || '')
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return {
    ...project,
    languages,
    members,
    ownerUsername,
    memberCount: members.length,
    accent: (accentSeed % 6) + 1,
    openSource: project.open_source === true || String(project.open_source).toLowerCase() === 'true',
  };
}

export async function getProjects({ signal, timeoutMs = 7000 } = {}) {
  const requestController = new AbortController();
  const cancelRequest = () => requestController.abort(signal?.reason);
  const timeoutId = window.setTimeout(() => requestController.abort('timeout'), timeoutMs);
  signal?.addEventListener('abort', cancelRequest, { once: true });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=id,title,description,languages,owner,owner_username,members,difficulty,verified,open_source&verified=eq.true`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
        signal: requestController.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Supabase responded with ${response.status}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects)) {
      throw new Error('Unexpected response format from Supabase');
    }

    return projects.map(normalizeProject);
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn('Échec de la récupération Supabase, utilisation des données locales', error);
    return cloneFallbackProjects();
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', cancelRequest);
  }
}
