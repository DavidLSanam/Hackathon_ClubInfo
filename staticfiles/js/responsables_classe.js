document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de vote chargé !"); // Debug initial

    // Elements
    const voteForm = document.querySelector('.vote-process');
    const submitBtn = document.getElementById('submit-votes');
    const modal = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-votes');
    const modifyBtn = document.getElementById('modify-votes');
    const closeModal = document.querySelector('.modal-close');
    const successAnimation = document.getElementById('success-animation');
    
    // State
    const selectedVotes = {};
    let canSubmit = false;
    
    // Vérification des éléments critiques
    if (!confirmBtn || !submitBtn || !modal) {
        console.error("Éléments manquants dans le DOM !");
        return;
    }

    // Initialize animations
    initAnimations();
    
    // Candidate card click handler
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('click', function() {
            const posteSection = this.closest('.poste-section');
            const posteId = posteSection?.querySelector('.vote-btn')?.dataset.posteId;
            
            if (!posteId) {
                console.warn("Aucun posteId trouvé pour cette carte");
                return;
            }
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                delete selectedVotes[posteId];
            } else {
                posteSection.querySelectorAll('.candidate-card').forEach(c => {
                    c.classList.remove('active');
                });
                this.classList.add('active');
                selectedVotes[posteId] = this.dataset.candidateId;
            }
            
            updateProgressTracker();
            checkSubmissionStatus();
        });
    });
    
    // Submit button handler
    submitBtn.addEventListener('click', function() {
        if (this.classList.contains('disabled')) return;
        
        const summaryContent = Object.keys(selectedVotes).map(posteId => {
            const card = document.querySelector(`.candidate-card[data-candidate-id="${selectedVotes[posteId]}"]`);
            if (!card) {
                console.error(`Carte non trouvée pour candidateId: ${selectedVotes[posteId]}`);
                return '';
            }
            
            const posteName = card.closest('.poste-section').querySelector('h3').textContent;
            const candidateName = card.querySelector('h4').textContent;
            
            return `
                <div class="vote-summary-item">
                    <h4>${posteName}</h4>
                    <p>${candidateName}</p>
                </div>
            `;
        }).join('');
        
        document.getElementById('votes-summary').innerHTML = summaryContent;
        modal.classList.add('active');
    });
    
    // Confirm vote handler - VERSION CORRIGÉE
    confirmBtn.addEventListener('click', async function() {
        console.log("Tentative d'envoi des votes..."); // Debug
        
        // Vérification finale
        const posteSections = document.querySelectorAll('.poste-section');
        if (Object.keys(selectedVotes).length !== posteSections.length) {
            alert("Vous devez sélectionner un candidat pour chaque poste !");
            return;
        }

        // Récupération sécurisée du token CSRF
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                         document.cookie.match(/csrftoken=([^;]+)/)?.[1];
        
        if (!csrfToken) {
            console.error("ERREUR: Aucun token CSRF trouvé !");
            alert("Erreur de sécurité. Veuillez recharger la page.");
            return;
        }

        // Préparation des données
        const formData = new FormData();
        formData.append('csrfmiddlewaretoken', csrfToken);
        
        Object.keys(selectedVotes).forEach(posteId => {
            formData.append(`poste_${posteId}`, selectedVotes[posteId]);
        });

        // Activation du loader
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'block';
        confirmBtn.disabled = true;

        try {
            console.log("Envoi des données:", Array.from(formData.entries())); // Debug
            
            const response = await fetch(VOTE_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log("Réponse reçue, status:", response.status); // Debug
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("Données reçues:", data); // Debug

            if (!data.success) {
                throw new Error(data.message || "Erreur inconnue du serveur");
            }

            // Succès
            modal.classList.remove('active');
            successAnimation.classList.add('active');
            
            setTimeout(() => {
                window.location.href = MERCI_URL;
            }, 2000);

        } catch (error) {
            console.error("Échec de l'envoi:", error);
            alert(`Échec de l'envoi: ${error.message}`);
            
            // Reset UI
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            confirmBtn.disabled = false;
        }
    });
    
    // Gestionnaires d'événements restants
    modifyBtn.addEventListener('click', () => modal.classList.remove('active'));
    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    // Helper functions
    function initAnimations() {
        document.querySelectorAll('.poste-section').forEach((section, index) => {
            section.style.setProperty('--order', index);
        });
        
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                bar.style.width = '100%';
            });
        }, 300);
    }
    
    function updateProgressTracker() {
        document.querySelectorAll('.poste-section').forEach(section => {
            const posteId = section.querySelector('.vote-btn')?.dataset.posteId;
            const progressBar = section.querySelector('.progress-fill');
            
            if (selectedVotes[posteId]) {
                progressBar.style.width = '100%';
                progressBar.style.backgroundColor = 'var(--success)';
            } else {
                progressBar.style.width = '0%';
                progressBar.style.backgroundColor = 'white';
            }
        });
    }
    
    function checkSubmissionStatus() {
        const posteSections = document.querySelectorAll('.poste-section');
        const allSelected = posteSections.length === Object.keys(selectedVotes).length;
        
        submitBtn.classList.toggle('disabled', !allSelected);
        canSubmit = allSelected;
        
        if (allSelected) {
            submitBtn.classList.add('celebrate');
            setTimeout(() => submitBtn.classList.remove('celebrate'), 1000);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
});