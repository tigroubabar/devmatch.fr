import { supabase } from "./supabase-client.js";

const createdProjects = document.getElementById("createdProjects");
const joinedProjects = document.getElementById("joinedProjects");

function showMessage(container, message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

function renderProjects(container, projects, emptyMessage) {
  if (!projects.length) {
    showMessage(container, emptyMessage);
    return;
  }

  const cards = projects.map((project) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginTop = "14px";

    const title = document.createElement("h3");
    title.textContent = project.title || "Projet sans titre";
    card.append(title);

    if (project.description) {
      const description = document.createElement("p");
      description.textContent = project.description;
      card.append(description);
    }

    const languages = project.languages ?? project.language;
    if (languages && (Array.isArray(languages) ? languages.length : true)) {
      const languageText = document.createElement("p");
      languageText.style.color = "var(--muted)";
      languageText.textContent = `Langages : ${
        Array.isArray(languages) ? languages.join(", ") : languages
      }`;
      card.append(languageText);
    }

    return card;
  });

  container.replaceChildren(...cards);
}

async function loadMyProjects() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      showMessage(createdProjects, "Connecte-toi avec Discord pour voir tes projets.");
      showMessage(joinedProjects, "Connecte-toi avec Discord pour voir tes projets.");
      return;
    }

    const discordId = user.user_metadata?.provider_id;

    if (!discordId) {
      throw new Error("Identifiant Discord introuvable.");
    }

    const [createdResult, joinedResult] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("owner", discordId)
        .eq("verified", true),
      supabase
        .from("projects")
        .select("*")
        .contains("members", [discordId])
        .eq("verified", true)
        .neq("owner", discordId),
    ]);

    if (createdResult.error) {
      console.error("Erreur lors du chargement des projets créés :", createdResult.error);
      showMessage(createdProjects, "Impossible de charger tes projets créés.");
    } else {
      renderProjects(
        createdProjects,
        createdResult.data ?? [],
        "Tu n'as pas encore de projet vérifié.",
      );
    }

    if (joinedResult.error) {
      console.error("Erreur lors du chargement des projets rejoints :", joinedResult.error);
      showMessage(joinedProjects, "Impossible de charger les projets auxquels tu participes.");
    } else {
      renderProjects(
        joinedProjects,
        joinedResult.data ?? [],
        "Tu ne participes pas encore à d'autres projets vérifiés.",
      );
    }
  } catch (error) {
    console.error("Impossible de charger tes projets :", error);
    showMessage(createdProjects, "Impossible de charger tes projets créés.");
    showMessage(joinedProjects, "Impossible de charger les projets auxquels tu participes.");
  }
}

loadMyProjects();
