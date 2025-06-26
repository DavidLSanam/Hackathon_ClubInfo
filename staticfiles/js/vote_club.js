document.addEventListener('DOMContentLoaded', function() {
    // Variables pour stocker la sélection en cours
    let selectedCandidate = null;
    let selectedClub = null;
    
    // Récupérer les éléments du DOM
    const confirmationModal = document.getElementById('confirmationModal');
    const programModal = document.getElementById('programModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const confirmVoteBtn = document.getElementById('confirmVote');
    const cancelVoteBtn = document.getElementById('cancelVote');
    
    // Récupérer les données stockées dans le HTML
    const voteData = document.getElementById('vote-data');
    const submitUrl = voteData.dataset.submitUrl;
    const csrfToken = voteData.dataset.csrfToken;

    // Créer le conteneur de messages s'il n'existe pas
    function ensureMessagesContainer() {
        let messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) {
            messagesContainer = document.createElement('div');
            messagesContainer.className = 'messages-container';
            document.body.appendChild(messagesContainer);
        }
        return messagesContainer;
    }

    // Gestion des boutons de vote
    document.querySelectorAll('.vote-button').forEach(button => {
        button.addEventListener('click', function() {
            const candidateId = this.dataset.candidateId;
            const candidateCard = this.closest('.candidate-card');
            const candidateName = candidateCard.querySelector('.candidate-name').textContent;
            const clubCard = this.closest('.club-card');
            const clubName = clubCard.querySelector('.club-name').textContent;
            const clubId = clubCard.dataset.clubId;
            
            // Stocker les sélections
            selectedCandidate = candidateId;
            selectedClub = clubId;
            
            // Mettre à jour le modal de confirmation
            document.getElementById('candidateName').textContent = candidateName;
            document.getElementById('clubName').textContent = clubName;
            
            // Afficher le modal
            confirmationModal.style.display = 'block';
        });
    });
    
    // Gestion des boutons de programme
    document.querySelectorAll('.program-button').forEach(button => {
        button.addEventListener('click', function() {
            const program = this.dataset.program;
            document.getElementById('programText').innerHTML = 
                program || "<p>Ce candidat n'a pas encore fourni de programme.</p>";
            programModal.style.display = 'block';
        });
    });
    
    // Fermer les modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            confirmationModal.style.display = 'none';
            programModal.style.display = 'none';
        });
    });
    
    // Fermer en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
        if (event.target === programModal) {
            programModal.style.display = 'none';
        }
    });
    
    // Confirmation de vote
    confirmVoteBtn.addEventListener('click', async function() {
        if (!selectedCandidate || !selectedClub) {
            showAlert("Veuillez sélectionner un candidat avant de voter", 'error');
            return;
        }

        // Désactiver le bouton pendant le traitement
        const originalText = this.textContent;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

        try {
            const success = await submitVote(selectedCandidate, selectedClub);
            if (success) {
                setTimeout(() => {
                    confirmationModal.style.display = 'none';
                }, 1500);
            }
        } finally {
            // Réactiver le bouton
            this.disabled = false;
            this.textContent = originalText;
        }
    });

    // Annulation de vote
    cancelVoteBtn.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    // Fonction pour soumettre le vote
    async function submitVote(candidateId, clubId) {
        try {
            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    candidate_id: candidateId,
                    club_id: clubId
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Erreur lors de l\'enregistrement du vote');
            }

            showAlert('✅ Votre vote a été enregistré avec succès !', 'success');
            disableVoteButtons(clubId);
            return true;
        } catch (error) {
            console.error("Erreur:", error);
            showAlert(`❌ ${error.message}`, 'error');
            return false;
        }
    }

    function disableVoteButtons(clubId) {
        const selector = `.club-card[data-club-id="${clubId}"] .vote-button`;
        document.querySelectorAll(selector).forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
            btn.innerHTML = '<i class="fas fa-check"></i> Déjà voté';
        });
    }
    
    // Fonction pour afficher des messages d'alerte
    function showAlert(message, type) {
        const messagesContainer = ensureMessagesContainer();
        
        // Supprimer les anciennes alertes
        messagesContainer.innerHTML = '';

        // Créer la nouvelle alerte
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = message;
        
        // Ajouter l'alerte
        messagesContainer.appendChild(alertDiv);
        
        // Animation d'apparition
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);

        // Supprimer l'alerte après 5 secondes
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                if (alertDiv.parentNode === messagesContainer) {
                    messagesContainer.removeChild(alertDiv);
                }
            }, 300);
        }, 5000);
    }
});