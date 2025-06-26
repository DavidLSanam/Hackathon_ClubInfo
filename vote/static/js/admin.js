document.addEventListener('DOMContentLoaded', () => {
    // Initialise les animations au chargement
    animateProgressBars();
    setupButtonHoverEffects();
    setupFormAnimations();
    verifyProgressBars();
    checkPeriodStatus();
    setupTabs();
    setupVoteTypeSelector();

    const showMessage = (message, success = true) => {
        const toast = document.createElement('div');
        toast.className = `toast ${success ? 'toast-success' : 'toast-error'}`;
        toast.innerHTML = `<span>${success ? '✅' : '❌'} ${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    };

    function setupVoteTypeSelector() {
        const voteTypeBtns = document.querySelectorAll('.vote-type-btn');
        
        voteTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const voteType = btn.getAttribute('data-vote-type');
                updateUIForVoteType(voteType);
                history.pushState(null, '', `?vote_type=${voteType}`);
            });
        });
        
        // Initialiser avec le type de vote actuel
        const currentVoteType = new URLSearchParams(window.location.search).get('vote_type') || 'aes';
        updateUIForVoteType(currentVoteType);
    }
    
    function updateUIForVoteType(voteType) {
        // Mettre à jour le bouton actif
        document.querySelectorAll('.vote-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.vote-type-btn[data-vote-type="${voteType}"]`).classList.add('active');
        
        // Mettre à jour le titre des statistiques
        const statsTitle = document.querySelector('.stats-card h2');
        if (statsTitle) {
            let titleText = '📊 Statistiques globales - ';
            if (voteType === 'aes') titleText += 'Bureau AES';
            else if (voteType === 'club') titleText += 'Présidents de Clubs';
            else titleText += 'Responsables de Classe';
            statsTitle.textContent = titleText;
        }
    }

    // Gestion des onglets
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Désactive tous les boutons et contenus du même parent
                const parent = button.closest('.admin-card');
                parent.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Active le bouton et le contenu sélectionné
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Charger la liste des admins quand l'onglet est cliqué
        document.querySelector('[data-tab="liste-admin"]')?.addEventListener('click', loadAdminList);
    }

    // Gestion des électeurs
    document.getElementById('add-voter-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        try {
            const response = await fetch('/ajouter-electeur/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(form))
            });

            const data = await response.json();
            if (data.success) {
                showMessage(data.message, true);
                form.reset();
            } else {
                throw new Error(data.message || 'Erreur lors de l\'ajout');
            }
        } catch (error) {
            showMessage(`Échec: ${error.message}`, false);
        } finally {
            button.classList.remove('loading');
        }
    });

    document.getElementById('delete-voter-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        try {
            const response = await fetch('/supprimer-electeur/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(form))
            });

            const data = await response.json();
            if (data.success) {
                showMessage(data.message, true);
                form.reset();
            } else {
                throw new Error(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            showMessage(`Échec: ${error.message}`, false);
        } finally {
            button.classList.remove('loading');
        }
    });

    // Gestion des candidats Bureau AES
    document.getElementById('add-aes-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatFormSubmit(e, '/ajouter-candidat/', 'aes');
    });

    document.getElementById('delete-aes-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatDeleteSubmit(e, '/supprimer-candidat/', 'aes');
    });

    // Gestion des candidats Présidents de club
    document.getElementById('add-club-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatFormSubmit(e, '/ajouter-candidat/', 'club');
    });

    document.getElementById('delete-club-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatDeleteSubmit(e, '/supprimer-candidat/', 'club');
    });

    // Gestion des candidats Responsables de classe
    document.getElementById('add-classe-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatFormSubmit(e, '/ajouter-candidat/', 'classe');
    });

    document.getElementById('delete-classe-candidat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCandidatDeleteSubmit(e, '/supprimer-candidat/', 'classe');
    });

    // Gestion des admins
    document.getElementById('generate-admin-matricules-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const displayDiv = document.getElementById('generated-admin-codes');
        button.classList.add('loading');
        
        try {
            const response = await fetch('/generer-matricules-admin/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(form))
            });

            const data = await response.json();
            if (data.success) {
                showMessage(`${data.quantite} codes admin générés avec succès`, true);
                
                // Afficher les codes générés
                displayDiv.innerHTML = '<h4>Codes générés :</h4>';
                data.codes.forEach(code => {
                    const codeDiv = document.createElement('div');
                    codeDiv.className = 'code-item';
                    codeDiv.innerHTML = `
                        <span>${code}</span>
                        <button class="copy-btn" data-code="${code}">Copier</button>
                    `;
                    displayDiv.appendChild(codeDiv);
                });
                
                // Ajouter les événements de copie
                document.querySelectorAll('.copy-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const code = e.target.getAttribute('data-code');
                        navigator.clipboard.writeText(code);
                        showMessage(`Code ${code} copié !`, true);
                    });
                });
                
                // Recharger la liste des admins
                loadAdminList();
            } else {
                throw new Error(data.message || 'Erreur lors de la génération');
            }
        } catch (error) {
            showMessage(`Échec: ${error.message}`, false);
        } finally {
            button.classList.remove('loading');
        }
    });

    document.getElementById('delete-admin-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        try {
            const response = await fetch('/supprimer-admin/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json' // Explicitement demander du JSON
                },
                body: new URLSearchParams(new FormData(form))
            });

            // Vérifier d'abord le type de contenu
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Réponse non-JSON reçue du serveur');
            }

            const data = await response.json();
            
            if (data.success) {
                showMessage(data.message, true);
                form.reset();
                loadAdminList();
            } else {
                throw new Error(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            showMessage(`Échec: ${error.message}`, false);
            
            // Afficher plus de détails en debug
            if (process.env.NODE_ENV === 'development') {
                const response = await fetch('/supprimer-admin/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(new FormData(form))
                });
                const text = await response.text();
                console.error('Réponse brute du serveur:', text);
            }
        } finally {
            button.classList.remove('loading');
        }
    });

    // Fonction générique pour la soumission des formulaires candidats
    async function handleCandidatFormSubmit(e, url, type) {
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        try {
            const formData = new FormData(form);
            formData.append('type', type);
            
            // Ajout des champs spécifiques selon le type
            if (type === 'club') {
                const clubSelect = form.querySelector('select[name="club"]');
                if (clubSelect) formData.append('club', clubSelect.value);
                
                const sloganInput = form.querySelector('input[name="slogan"]');
                if (sloganInput) formData.append('slogan', sloganInput.value);
                
                const programmeInput = form.querySelector('textarea[name="programme"]');
                if (programmeInput) formData.append('programme', programmeInput.value);
            } 
            else if (type === 'classe') {
                const posteSelect = form.querySelector('select[name="poste"]');
                if (posteSelect) formData.append('poste', posteSelect.value);
                
                const classeSelect = form.querySelector('select[name="classe"]');
                if (classeSelect) formData.append('classe', classeSelect.value);
                
                const programmeInput = form.querySelector('textarea[name="programme"]');
                if (programmeInput) formData.append('programme', programmeInput.value);
            }
            else if (type === 'aes') {
                const posteSelect = form.querySelector('select[name="poste"]');
                if (posteSelect) formData.append('poste', posteSelect.value);
                
                const classeSelect = form.querySelector('select[name="classe"]');
                if (classeSelect) formData.append('classe', classeSelect.value);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                showMessage(data.message, true);
                form.reset();
            } else {
                throw new Error(data.message || `Erreur lors de l'ajout du candidat ${type}`);
            }
        } catch (error) {
            showMessage(`Échec: ${error.message}`, false);
        } finally {
            button.classList.remove('loading');
        }
    }

    // Fonction générique pour la suppression des candidats
    async function handleCandidatDeleteSubmit(e, url, type) {
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        button.classList.add('loading');
        
        try {
            const formData = new FormData(form);
            formData.append('type', type);
            
            // Ajout du matricule si présent
            const matriculeInput = form.querySelector('input[name="matricule"]');
            if (matriculeInput && matriculeInput.value) {
                formData.append('matricule', matriculeInput.value);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData)
            });

            const data = await response.json();
            if (data.success) {
                showMessage(data.message, true);
                form.reset();
            } else {
                throw new Error(data.message || `Erreur lors de la suppression du candidat ${type}`);
            }
        } catch (error) {
            showMessage(`Échec: ${error.message}`, false);
        } finally {
            button.classList.remove('loading');
        }
    }
});

// Animation des barres de progression
function animateProgressBars() {
    document.querySelectorAll('.progress').forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0';
        bar.style.transition = 'width 1s ease-out';
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 100);
    });
}

// Effets de survol pour les boutons
function setupButtonHoverEffects() {
    const buttons = document.querySelectorAll('button, .admin-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
    });
}

// Animations pour les formulaires
function setupFormAnimations() {
    const forms = document.querySelectorAll('.admin-card form');
    forms.forEach(form => {
        form.style.opacity = '0';
        form.style.transform = 'translateY(20px)';
        form.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            form.style.opacity = '1';
            form.style.transform = 'translateY(0)';
        }, 200);
    });
}

// Vérification de l'état des périodes
function checkPeriodStatus() {
    fetch('/api/period-status/')
        .then(res => {
            if (!res.ok) throw new Error('Erreur réseau');
            return res.json();
        })
        .then(data => {
            const btnOpenCandidatures = document.querySelector('button[onclick="toggleCandidatures(true)"]');
            const btnCloseCandidatures = document.querySelector('button[onclick="toggleCandidatures(false)"]');
            
            if (data.candidatures_ouvertes) {
                btnOpenCandidatures.style.backgroundColor = '#4CAF50';
                btnCloseCandidatures.style.backgroundColor = '';
            } else {
                btnCloseCandidatures.style.backgroundColor = '#F44336';
                btnOpenCandidatures.style.backgroundColor = '';
            }

            const btnOpenVotes = document.querySelector('button[onclick="toggleVotes(true)"]');
            const btnCloseVotes = document.querySelector('button[onclick="toggleVotes(false)"]');
            
            if (data.votes_ouverts) {
                btnOpenVotes.style.backgroundColor = '#4CAF50';
                btnCloseVotes.style.backgroundColor = '';
            } else {
                btnCloseVotes.style.backgroundColor = '#F44336';
                btnOpenVotes.style.backgroundColor = '';
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification du statut des périodes:', error);
        });
}

// Ouvrir/Fermer candidatures (avec animation)
async function toggleCandidatures(open) {
    const button = document.querySelector(`button[onclick="toggleCandidatures(${open})"]`);
    button.classList.add('loading');
    
    try {
        const response = await fetch('/controler-periode/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${open ? 'open_candidatures' : 'close_candidatures'}`
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Action échouée');
        }

        showMessage(data.message, true);
        checkPeriodStatus();
        
    } catch (error) {
        console.error('Erreur:', error);
        showMessage(`Échec de l'opération: ${error.message}`, false);
    } finally {
        button.classList.remove('loading');
    }
}

// Ouvrir/Fermer votes (avec animation)
async function toggleVotes(open) {
    const button = document.querySelector(`button[onclick="toggleVotes(${open})"]`);
    button.classList.add('loading');
    
    try {
        const response = await fetch('/controler-periode/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${open ? 'open_votes' : 'close_votes'}`
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Action échouée');
        }

        showMessage(data.message, true);
        checkPeriodStatus();
        
    } catch (error) {
        console.error('Erreur:', error);
        showMessage(`Échec de l'opération: ${error.message}`, false);
    } finally {
        button.classList.remove('loading');
    }
}

// Fonction utilitaire pour CSRF
function getCSRFToken() {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken'))?.split('=')[1];
}

function verifyProgressBars() {
    document.querySelectorAll('.progress').forEach(bar => {
        const taux = parseFloat(bar.dataset.taux);
        const votants = parseInt(bar.dataset.votants);
        const inscrits = parseInt(bar.dataset.inscrits);
        
        console.log(`Classe: ${bar.parentElement.parentElement.querySelector('.classe').textContent}, 
                    Taux: ${taux}%, 
                    Votants: ${votants}, 
                    Inscrits: ${inscrits}`);
        
        if (taux > 100) {
            console.error('Taux > 100% détecté !');
            bar.style.backgroundColor = '#ff0000';
        }
    });
}

// Fonction pour charger la liste des admins
async function loadAdminList() {
    const container = document.getElementById('admin-list');
    const loading = document.getElementById('admin-list-loading');
    
    try {
        const response = await fetch('/liste-admins/');
        const data = await response.json();
        
        if (data.success && data.admins.length > 0) {
            loading.style.display = 'none';
            container.innerHTML = '';
            
            data.admins.forEach(admin => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${admin.matricule}</span>
                    <button class="copy-btn" data-code="${admin.matricule}">Copier</button>
                    <button class="delete-btn" data-code="${admin.matricule}">Supprimer</button>
                `;
                container.appendChild(li);
            });
            
            // Gestion des boutons de suppression
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const code = e.target.getAttribute('data-code');
                    try {
                        const response = await fetch('/supprimer-admin/', {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCSRFToken(),
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: `matricule=${encodeURIComponent(code)}`
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            showMessage(result.message, true);
                            loadAdminList(); // Recharger la liste
                        } else {
                            throw new Error(result.message);
                        }
                    } catch (error) {
                        showMessage(`Échec: ${error.message}`, false);
                    }
                });
            });
            
            // Gestion des boutons de copie
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const code = e.target.getAttribute('data-code');
                    navigator.clipboard.writeText(code);
                    showMessage(`Code ${code} copié !`, true);
                });
            });
        } else {
            loading.textContent = 'Aucun administrateur enregistré';
        }
    } catch (error) {
        console.error('Erreur:', error);
        loading.textContent = 'Erreur lors du chargement';
    }
}