document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("confirmation-modal");
    const confirmerBtn = document.getElementById("confirmer-vote");
    const annulerBtn = document.getElementById("annuler-vote");
    const nomCandidatEl = document.getElementById("nom-candidat");

    let currentButton = null;

    // Gestion des clics sur les boutons de vote
    document.querySelectorAll(".vote-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            currentButton = button;
            const candidatNom = button.getAttribute("data-candidat-nom");
            nomCandidatEl.textContent = candidatNom;
            modal.classList.remove("hidden");
        });
    });

    // Annulation du vote
    annulerBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        currentButton = null;
    });

    // Confirmation du vote
    confirmerBtn.addEventListener("click", async () => {
        if (!currentButton) return;

        modal.classList.add("hidden");

        const posteId = currentButton.getAttribute("data-poste-id");
        const candidatId = currentButton.getAttribute("data-candidat-id");
        
        // Désactiver tous les boutons du même poste
        const samePosteButtons = document.querySelectorAll(`.vote-btn[data-poste-id="${posteId}"]`);
        samePosteButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.cursor = "not-allowed";
        });

        // Mise à jour visuelle
        currentButton.textContent = "Enregistrement...";
        currentButton.classList.add("loading");

        try {
            const response = await fetch("/voter/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify({ 
                    poste_id: posteId, 
                    candidat_id: candidatId 
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            
            if (data.success) {
                currentButton.textContent = "✓ Vote enregistré";
                currentButton.classList.remove("loading");
                currentButton.classList.add("voted");

                // Mettre à jour les résultats si disponibles
                if (data.results) {
                    updateResults(data.results);
                }
            } else {
                throw new Error(data.error || "Erreur inconnue");
            }
        } catch (error) {
            console.error("Erreur lors du vote:", error);
            currentButton.textContent = "Erreur ❌";
            currentButton.classList.remove("loading");
            currentButton.classList.add("error");
            
            // Réactiver les boutons en cas d'erreur
            samePosteButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            });
            
            alert("Erreur: " + error.message);
        }
    });

    // Fonction pour récupérer le token CSRF
    function getCSRFToken() {
        return document.getElementById('csrf-token').value;
    }

    // Mise à jour des résultats (optionnel)
    function updateResults(results) {
        // Implémentez la logique de mise à jour des résultats ici
        console.log("Résultats mis à jour:", results);
    }
});