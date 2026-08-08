import { demoProjects, supabase_url, supabase_key } from './projects-data.js';

/** @typedef {import('./project-types.js').Project} Project */

/**
 * Charge les projets affichés sur le site.
 *
 * Cette fonction constitue la frontière de données de la page. Lors du branchement
 * à Supabase, seule son implémentation devra être remplacée par la requête réelle.
 *
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
  try {
    const response = await fetch(
      `${supabase_url}/rest/v1/projects?select=id,title,description,languages,owner,owner_username,members,difficulty,verified&verified=eq.true`,
      {
        headers: {
          apikey: supabase_key,
          Authorization: `Bearer ${supabase_key}`,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Supabase responded with ${response.status}`);
    }

    const projects = await response.json();

    if (!Array.isArray(projects)) {
      throw new Error('Unexpected response format from Supabase');
    }

    return projects.map((project) => {
      const languages = Array.isArray(project.languages) ? project.languages : [];
      const members = Array.isArray(project.members) ? project.members : [];
      const ownerUsername = project.owner_username || project.ownerUsername || project.owner || '';
      const accent = ((String(project.id || project.owner)
        .split('')
        .reduce((sum, character) => sum + character.charCodeAt(0), 0) % 6) + 1);

      return {
        ...project,
        ownerUsername,
        languages,
        members,
        memberCount: members.length,
        accent,
      };
    });
  } catch (error) {
    console.warn('Échec de la récupération Supabase, utilisation des données locales', error);

    return demoProjects.map((project) => ({
      ...project,
      languages: Array.isArray(project.languages) ? [...project.languages] : [],
      members: Array.isArray(project.members) ? [...project.members] : [],
      memberCount: Array.isArray(project.members) ? project.members.length : 0,
      accent: project.accent || 1,
    }));
  }
}
