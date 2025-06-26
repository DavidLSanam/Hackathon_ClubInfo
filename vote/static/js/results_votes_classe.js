document.addEventListener('DOMContentLoaded', function() {
    // Animation des sections
    document.querySelectorAll('.poste-section').forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('visible');
        }, index * 200);
    });

    // Filtrage des résultats
    const posteFilter = document.getElementById('poste-filter');
    const classeFilter = document.getElementById('classe-filter');
    
    function filterResults() {
        const selectedPoste = posteFilter.value;
        const selectedClasse = classeFilter.value;
        
        document.querySelectorAll('.poste-section').forEach(section => {
            const isPosteVisible = selectedPoste === 'all' || section.id === selectedPoste;
            
            let hasVisibleClasse = false;
            section.querySelectorAll('.classe-result').forEach(classe => {
                const isClasseVisible = selectedClasse === 'all' || 
                                       classe.classList.contains(selectedClasse);
                
                if (isPosteVisible && isClasseVisible) {
                    classe.style.display = 'block';
                    hasVisibleClasse = true;
                } else {
                    classe.style.display = 'none';
                }
            });
            
            section.style.display = hasVisibleClasse ? 'block' : 'none';
        });
    }
    
    posteFilter.addEventListener('change', filterResults);
    classeFilter.addEventListener('change', filterResults);
    
    // Initialiser les graphiques
    initializeCharts();
});

function initializeCharts() {
    // Ici vous devrez implémenter la logique pour initialiser les graphiques
    // avec une bibliothèque comme Chart.js
    // Exemple simplifié :
    
    document.querySelectorAll('.results-chart canvas').forEach(canvas => {
        // Extraire les données nécessaires pour ce graphique
        // (vous devrez peut-être les inclure dans le contexte Django)
        const ctx = canvas.getContext('2d');
        
        // Exemple de graphique (à adapter avec vos données réelles)
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Candidat 1', 'Candidat 2', 'Candidat 3'],
                datasets: [{
                    label: 'Votes',
                    data: [12, 19, 3],
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(67, 97, 238, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}