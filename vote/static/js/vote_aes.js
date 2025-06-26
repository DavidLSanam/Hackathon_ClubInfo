document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("confirmation-modal");
    const confirmerBtn = document.getElementById("confirmer-vote");
    const annulerBtn = document.getElementById("annuler-vote");
    const nomCandidatEl = document.getElementById("nom-candidat");

    let currentButton = null;

    // Ouvrir la modale quand on clique sur un bouton de vote
    document.querySelectorAll(".vote-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentButton = button;
            nomCandidatEl.textContent = button.getAttribute("data-candidat-nom");
            modal.classList.remove("hidden");
        });
    });

    // Annuler le vote (fermer la modale)
    annulerBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        currentButton = null;
    });

    // Confirmer le vote
    confirmerBtn.addEventListener("click", () => {
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

        // Mise à jour immédiate du bouton sélectionné
        currentButton.textContent = "Enregistrement...";
        currentButton.style.backgroundColor = "#ffc107"; // Jaune

        fetch("/voter/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ poste_id: posteId, candidat_id: candidatId }),
        })
        .then(response => response.json())
        .then(data => {
            currentButton.textContent = "Vote enregistré ✅";
            currentButton.style.backgroundColor = "#28a745";

            // Mettre à jour les barres de progression
            if (data.results) {
                for (const [id, percent] of Object.entries(data.results)) {
                    const bar = document.getElementById(`bar-${id}`);
                    if (bar) {
                        bar.style.width = `${percent}%`;
                        bar.textContent = `${percent}%`;
                    }
                }
                updateLeaderBadges(data.results);
            }
        })
        .catch(error => {
            currentButton.textContent = "Erreur ❌";
            currentButton.style.backgroundColor = "#dc3545"; // Rouge
            console.error("Erreur lors du vote :", error);
        });
    });

    // Récupération du token CSRF
    function getCSRFToken() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }
});


// Tooltips
document.querySelectorAll(".vote-btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
        const tooltip = btn.parentElement.querySelector(".tooltip");
        if (tooltip) tooltip.style.opacity = 1;
    });
    btn.addEventListener("mouseleave", () => {
        const tooltip = btn.parentElement.querySelector(".tooltip");
        if (tooltip) tooltip.style.opacity = 0;
    });
});

// Vibration au clic (sur mobile)
document.querySelectorAll(".vote-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (navigator.vibrate) navigator.vibrate(50);
    });
});

// Badge "Leader"
function updateLeaderBadges(results) {
    const postes = {};
    document.querySelectorAll(".card").forEach(card => {
        const posteId = card.getAttribute("data-poste-id");
        const candidatId = card.querySelector(".vote-btn").getAttribute("data-candidat-id");
        if (!postes[posteId]) postes[posteId] = [];
        postes[posteId].push({ id: candidatId, element: card });
    });

    for (const [posteId, candidats] of Object.entries(postes)) {
        let leader = candidats[0];
        for (const c of candidats) {
            if ((results[c.id] || 0) > (results[leader.id] || 0)) {
                leader = c;
            }
        }

        candidats.forEach(c => {
            c.element.classList.remove("leader-badge");
        });
        leader.element.classList.add("leader-badge");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("confirmation-modal");
    const confirmerBtn = document.getElementById("confirmer-vote");
    const annulerBtn = document.getElementById("annuler-vote");
    const nomCandidatEl = document.getElementById("nom-candidat");
    const select = document.getElementById("poste-select");

    let currentButton = null;

    // Filtrage dynamique par poste
    select.addEventListener("change", () => {
        const selectedId = select.value;
        document.querySelectorAll(".poste").forEach(poste => {
            if (selectedId === "all" || poste.dataset.posteId === selectedId) {
                poste.style.display = "block";
            } else {
                poste.style.display = "none";
            }
        });
    });

    // Modale
    document.querySelectorAll(".vote-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentButton = button;
            nomCandidatEl.textContent = button.dataset.candidatNom;
            modal.classList.remove("hidden");
        });
    });

    annulerBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        currentButton = null;
    });

    confirmerBtn.addEventListener("click", () => {
        if (!currentButton) return;

        modal.classList.add("hidden");

        const posteId = currentButton.dataset.posteId;
        const candidatId = currentButton.dataset.candidatId;

        document.querySelectorAll(`.vote-btn[data-poste-id="${posteId}"]`).forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });

        currentButton.textContent = "Enregistrement...";

        fetch("/voter/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ poste_id: posteId, candidat_id: candidatId }),
        })
        .then(response => response.json())
        .then(data => {
            currentButton.textContent = "Vote enregistré ✅";
            currentButton.style.backgroundColor = "#28a745";

            if (data.results) {
                for (const [id, percent] of Object.entries(data.results)) {
                    const bar = document.getElementById(`bar-${id}`);
                    if (bar) {
                        bar.style.width = `${percent}%`;
                        bar.textContent = `${percent}%`;
                    }
                }
                updateLeaderBadges(data.results);
            }
        })
        .catch(error => {
            currentButton.textContent = "Erreur ❌";
            currentButton.style.backgroundColor = "#dc3545";
            console.error("Erreur lors du vote :", error);
        });
    });

    function getCSRFToken() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        return cookie ? cookie.split('=')[1] : '';
    }

    // Tooltip & vibration
    document.querySelectorAll(".vote-btn").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            const tooltip = btn.parentElement.querySelector(".tooltip");
            if (tooltip) tooltip.style.opacity = 1;
        });
        btn.addEventListener("mouseleave", () => {
            const tooltip = btn.parentElement.querySelector(".tooltip");
            if (tooltip) tooltip.style.opacity = 0;
        });
        btn.addEventListener("click", () => {
            if (navigator.vibrate) navigator.vibrate(50);
        });
    });

    function updateLeaderBadges(results) {
        const postes = {};
        document.querySelectorAll(".card").forEach(card => {
            const posteId = card.dataset.posteId;
            const candidatId = card.querySelector(".vote-btn").dataset.candidatId;
            if (!postes[posteId]) postes[posteId] = [];
            postes[posteId].push({ id: candidatId, element: card });
        });

        for (const [posteId, candidats] of Object.entries(postes)) {
            let leader = candidats[0];
            for (const c of candidats) {
                if ((results[c.id] || 0) > (results[leader.id] || 0)) {
                    leader = c;
                }
            }
            candidats.forEach(c => c.element.classList.remove("leader-badge"));
            leader.element.classList.add("leader-badge");
        }
    }
});
