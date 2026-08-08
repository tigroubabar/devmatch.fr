import { demoProjects } from './projects-data.js';

/** @typedef {import('./project-types.js').Project} Project */

/**
 * Charge les projets affichés sur le site.
 *
 * Cette fonction constitue la frontière de données de la page. Lors du branchement
 * à Supabase, seule son implémentation devra être remplacée par la requête réelle.
 * Aucune configuration ni clé Supabase n'est nécessaire tant que les données de
 * démonstration sont utilisées.
 *
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
  return demoProjects.map((project) => ({
    ...project,
    languages: [...project.languages],
  }));
}
