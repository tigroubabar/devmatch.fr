
import { supabase } from "./supabase-client.js";

const loginBtn = document.getElementById("loginBtn");
const profileBtn = document.getElementById("profileBtn");
const profileAvatar = document.getElementById("profileAvatar");
const profileMenu = document.getElementById("profileMenu");
const profileName = document.getElementById("profileName");
const logoutBtn = document.getElementById("logoutBtn");
const warning = document.getElementById("warning");
const myProjectsBtn = document.getElementById("myProjectsBtn");

myProjectsBtn.addEventListener("click", () => {
  window.location.href = "/mes-projets/";
});

function closeProfileMenu() {
  profileMenu.hidden = true;
  profileBtn.setAttribute("aria-expanded", "false");
}

function updateProfile(user) {
  const connected = !!user;

  loginBtn.hidden = connected;
  profileBtn.hidden = !connected;

  if (connected) {
    profileAvatar.src =
      user.user_metadata?.avatar_url || "/assets/logo.png";
    profileName.textContent =
      user.user_metadata?.global_name ||
      user.user_metadata?.custom_claims?.global_name ||
      user.user_metadata?.preferred_username ||
      user.user_metadata?.username ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      "Compte Discord";

  } else {
    profileAvatar.removeAttribute("src");
    profileName.textContent = "";
    closeProfileMenu();
  }
}

loginBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    alert("Impossible de lancer la connexion Discord : " + error.message);
  }
});

profileBtn.addEventListener("click", () => {
  const isOpen = profileBtn.getAttribute("aria-expanded") === "true";
  profileMenu.hidden = isOpen;
  profileBtn.setAttribute("aria-expanded", String(!isOpen));
});

logoutBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("Erreur lors de la déconnexion : " + error.message);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-menu-container")) {
    closeProfileMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProfileMenu();
  }
});





async function updateServerWarning(user) {
  warning.hidden = true;

  if (!user) return;

  const discordId = user.user_metadata?.provider_id;

  if (!discordId) {
    console.error("Identifiant Discord introuvable.");
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("on_server")
    .eq("user_id", discordId)
    .maybeSingle();

  if (error) {
    console.error("Erreur de lecture du statut :", error);
    return;
  }

  if (!data) {
    console.warn("Aucun profil trouvé dans la table users.");
    return;
  }

  warning.hidden = data.on_server;
}

supabase.auth.onAuthStateChange((_event, session) => {
  updateProfile(session?.user ?? null);

  setTimeout(() => {
    updateServerWarning(session?.user ?? null);
  }, 0);
});

const { data: { session }, error: sessionError } =
  await supabase.auth.getSession();

if (sessionError) {
  console.error("Erreur de session :", sessionError);
} else {
  updateProfile(session?.user ?? null);
  await updateServerWarning(session?.user ?? null);
}
