import { signIn, signUp } from "./auth.js";

/**
 * Monte l'écran de connexion / inscription dans `container`.
 * Ne fait rien d'autre que gérer ce formulaire — c'est `onAuthChange`
 * (dans main.js) qui réagit à la connexion réussie et bascule vers l'app.
 */
export function mountAuthScreen(container) {
  let mode = "signin"; // "signin" | "signup"

  render();

  function render() {
    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-question">
          ${mode === "signin" ? "Connexion" : "Créer un compte"}
        </div>
        <div class="quiz-answers">
          <input type="email" id="auth-email" placeholder="Email" autocomplete="email"
            class="answer-btn" style="cursor:text;" />
          <input type="password" id="auth-password" placeholder="Mot de passe"
            autocomplete="${mode === "signin" ? "current-password" : "new-password"}"
            class="answer-btn" style="cursor:text;" />
        </div>
        <button class="btn btn-primary" id="auth-submit">
          ${mode === "signin" ? "Se connecter" : "Créer mon compte"}
        </button>
        <div id="auth-message" style="margin-top:12px; font-size:13px; color:var(--text-muted); text-align:center;"></div>
        <button class="btn" id="auth-toggle" style="background:transparent; color:var(--blue); margin-top:4px;">
          ${mode === "signin" ? "Pas encore de compte ? En créer un" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    `;

    container.querySelector("#auth-toggle").addEventListener("click", () => {
      mode = mode === "signin" ? "signup" : "signin";
      render();
    });

    container.querySelector("#auth-submit").addEventListener("click", handleSubmit);
  }

  async function handleSubmit() {
    const email = container.querySelector("#auth-email").value.trim();
    const password = container.querySelector("#auth-password").value;
    const messageEl = container.querySelector("#auth-message");
    const submitBtn = container.querySelector("#auth-submit");

    if (!email || !password) {
      messageEl.textContent = "Email et mot de passe requis.";
      return;
    }

    submitBtn.disabled = true;
    messageEl.textContent = "Un instant...";

    const { error } =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    submitBtn.disabled = false;

    if (error) {
      messageEl.textContent = traduireErreur(error.message);
      return;
    }

    if (mode === "signup") {
      messageEl.textContent =
        "Compte créé. Si une confirmation par email est activée sur le projet, vérifie ta boîte mail avant de te connecter.";
    }
    // Si la session est ouverte directement (confirmation email désactivée),
    // onAuthChange (dans main.js) prend le relais automatiquement.
  }

  function traduireErreur(message) {
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
    if (message.includes("already registered")) return "Un compte existe déjà avec cet email.";
    if (message.includes("Email not confirmed"))
      return "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et les spams) pour le lien de confirmation.";
    return message;
  }
}
