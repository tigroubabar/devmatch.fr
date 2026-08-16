/**
 * @typedef {Object} Project
 * @property {string} id Identifiant unique du projet.
 * @property {string} title Nom public du projet.
 * @property {string} description Résumé affiché dans la liste.
 * @property {string} difficulty Valeur textuelle de difficulté, de "1" à "5".
 * @property {boolean} verified Indique si le projet est vérifié.
 * @property {boolean} [openSource] Indique si le projet est open source.
 * @property {string} owner Nom public du créateur.
 * @property {string} [ownerUsername] Pseudo ou nom à afficher (si disponible, chargé depuis la colonne `owner_username`).
 * @property {string[]} members Liste des membres de l'équipe.
 * @property {number} memberCount Nombre de membres dans l'équipe.
 * @property {1|2|3|4|5|6} accent Variante visuelle de l'avatar.
 */

export {};
