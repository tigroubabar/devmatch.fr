/** @typedef {import('./project-types.js').Project} Project */

/** @type {ReadonlyArray<Project>} */

const supabase_url = "https://ydycfgsglxutfsojymnn.supabase.co";
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeWNmZ3NnbHh1dGZzb2p5bW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTg4NTksImV4cCI6MjEwMTMzNDg1OX0.G79z9vLH1gMR3f_deZt3hc36zbttYMGZ7AiNzF6xRBE";

export const demoProjects = Object.freeze([
  {
    id: 'nova',
    title: "Nova — suivi",
    description: "Application mobile de suivi d'habitudes avec rappels et fonctionnement hors ligne.",
    languages: ['Flutter', 'Supabase'],
    difficulty: '3',
    verified: true,
    owner: 'lea.codes',
    ownerUsername: 'lea.codes',
    members: ['lea.codes', 'alex', 'morgane'],
    accent: 1,
  },
  {
    id: 'pixelforge',
    title: 'Pixelforge — éditeur de sprites',
    description: 'Éditeur de pixel art dans le navigateur destiné à la création de ressources de jeu.',
    languages: ['TypeScript', 'Canvas'],
    difficulty: '2',
    verified: true,
    owner: 'max_dev',
    ownerUsername: 'max_dev',
    members: ['max_dev', 'nina'],
    accent: 2,
  },
  {
    id: 'cartel',
    title: 'Cartel — outil de veille en ligne de commande',
    description: 'Outil qui résume les nouveautés publiées sur une liste de dépôts GitHub.',
    languages: ['Rust'],
    difficulty: '5',
    verified: true,
    owner: 'tigroubabar',
    ownerUsername: 'tigroubabar',
    members: ['tigroubabar'],
    accent: 3,
  },
  {
    id: 'lentille',
    title: 'Lentille — galerie photo auto-hébergée',
    description: 'Galerie personnelle pour classer des photos par lieu et par conditions de lumière.',
    languages: ['Python', 'React'],
    difficulty: '3',
    verified: true,
    owner: 'nadia.k',
    ownerUsername: 'nadia.k',
    members: ['nadia.k', 'clara', 'mathieu', 'hugo'],
    accent: 4,
  },
  {
    id: 'sillage',
    title: 'Sillage — journal de développement',
    description: 'Extension de navigateur qui enregistre les changements d’un projet pour préparer un journal de versions.',
    languages: ['JavaScript'],
    difficulty: '2',
    verified: true,
    owner: 'yohan_b',
    ownerUsername: 'yohan_b',
    members: ['yohan_b', 'anais'],
    accent: 5,
  },
  {
    id: 'boussole',
    title: 'Boussole — assistant de revue de code',
    description: "Assistant de revue de code qui analyse les demandes de fusion avant la validation par un membre de l'équipe.",
    languages: ['Python'],
    difficulty: '5',
    verified: true,
    owner: 'sofia.dev',
    ownerUsername: 'sofia.dev',
    members: ['sofia.dev', 'leo', 'sarah'],
    accent: 6,
  },
]);

export { supabase_url, supabase_key };
