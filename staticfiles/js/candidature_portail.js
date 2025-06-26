document.addEventListener('DOMContentLoaded', function() {
    // Gestion du responsive
    function handleResponsive() {
        const triangleContainer = document.querySelector('.triangle-container');
        const screenWidth = window.innerWidth;

        if (screenWidth <= 992) {
            triangleContainer.classList.add('mobile-layout');
        } else {
            triangleContainer.classList.remove('mobile-layout');
        }
    }

    // Initial check
    handleResponsive();
    
    // Check on resize
    window.addEventListener('resize', handleResponsive);

    // Gestion des clics sur les cartes
    const cards = document.querySelectorAll('.candidature-card');
    const modal = document.getElementById('selectionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalAction = document.getElementById('modalAction');
    const closeModal = document.querySelector('.close-modal');

    cards.forEach(card => {
        card.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            let title, content, actionUrl;

            switch(target) {
                case 'aes':
                    title = "Candidature Bureau de l'AES";
                    content = `
                        <p>Postes disponibles :</p>
                        <ul>
                            <li>Président(e) de l'AES</li>
                            <li>Président(e) Junior Entreprise</li>
                            <li>Secrétaire général(e)</li>
                            <li>Trésorier(ère)</li>
                        </ul>
                        <p>Vous serez redirigé vers le formulaire de candidature.</p>
                    `;
                    actionUrl = "/candidature/aes";
                    break;
                
                case 'president':
                    title = "Candidature Président de Club";
                    content = `
                        <p>Clubs disponibles :</p>
                        <ul>
                            <li>Club Informatique</li>
                            <li>Club Anglais</li>
                            <li>Club Leadership</li>
                            <li>Club Presse</li>
                        </ul>
                        <p>Sélectionnez un club pour voir les détails.</p>
                    `;
                    actionUrl = "/candidature/president";
                    break;
                
                case 'responsable':
                    title = "Candidature Responsable de Classe";
                    content = `
                        <p>Représentez votre promotion en tant que :</p>
                        <ul>
                            <li>Responsable de classe</li>
                            <li>Délégué(e) pédagogique</li>
                            <li>Représentant(e) étudiant</li>
                        </ul>
                        <p>Vous serez redirigé vers le formulaire de candidature.</p>
                    `;
                    actionUrl = "/candidature/responsable";
                    break;
            }

            modalTitle.textContent = title;
            modalContent.innerHTML = content;
            modalAction.href = actionUrl;
            modal.style.display = 'flex';
        });
    });

    // Fermeture du modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Animation au chargement
    setTimeout(() => {
        document.querySelector('.portail-header').style.opacity = '1';
        document.querySelector('.portail-header').style.transform = 'translateY(0)';
        
        const cards = document.querySelectorAll('.candidature-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 100);
});