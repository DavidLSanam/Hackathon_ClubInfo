document.addEventListener('DOMContentLoaded', function() {
    // Configuration de Handlebars

    Handlebars.registerHelper('addOne', function(value) {
        return value + 1;
    });

    const templateSource = document.getElementById('ranking-template').innerHTML;
    const template = Handlebars.compile(templateSource);

    
    
    // Charger les données
    const resultsData = {
        clubs: JSON.parse(document.getElementById('clubs-data').textContent),
        participation: JSON.parse(document.getElementById('participation-data').textContent),
        timeline: JSON.parse(document.getElementById('timeline-data').textContent)
    };

    // Initialisation des graphiques
    let votesChart, clubsChart, filiereChart, timelineChart;
    initCharts();
    updateRanking();
    updateParticipationStats();

    // Écouteurs d'événements
    document.getElementById('apply-filters').addEventListener('click', function() {
        updateRanking();
        updateParticipationStats();
    });

    function initCharts() {
        // Graphique des votes par candidat (premier club par défaut)
        if (resultsData.clubs.length > 0) {
            updateVotesChart(resultsData.clubs[0].id);
        }
        
        // Graphique des votes par club
        const clubsCtx = document.getElementById('clubsChart').getContext('2d');
        clubsChart = new Chart(clubsCtx, {
            type: 'bar',
            data: {
                labels: resultsData.clubs.map(c => c.nom),
                datasets: [{
                    label: 'Total des votes',
                    data: resultsData.clubs.map(c => c.total_votes),
                    backgroundColor: '#6a11cb',
                    borderColor: '#4a0da3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de votes'
                        }
                    }
                }
            }
        });

        // Graphique de participation par filière
        const filiereCtx = document.getElementById('filiereChart').getContext('2d');
        filiereChart = new Chart(filiereCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(resultsData.participation.byFiliere),
                datasets: [{
                    label: 'Participation (%)',
                    data: Object.values(resultsData.participation.byFiliere).map(f => f.percentage),
                    backgroundColor: '#6a11cb',
                    borderColor: '#4a0da3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Pourcentage (%)'
                        }
                    }
                }
            }
        });

        // Graphique d'évolution temporelle
        const timelineCtx = document.getElementById('timelineChart').getContext('2d');
        timelineChart = new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: resultsData.timeline.labels,
                datasets: [{
                    label: 'Votes cumulés',
                    data: resultsData.timeline.data,
                    fill: true,
                    backgroundColor: 'rgba(106, 17, 203, 0.1)',
                    borderColor: '#6a11cb',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de votes'
                        }
                    }
                }
            }
        });
    }

    function updateVotesChart(clubId) {
        const club = resultsData.clubs.find(c => c.id == clubId);
        if (!club) return;
        
        const ctx = document.getElementById('votesChart').getContext('2d');
        
        // Détruire le graphique existant
        if (votesChart) votesChart.destroy();
        
        // Couleurs pour les candidats
        const backgroundColors = [
            '#6a11cb', '#2575fc', '#00c6ff', '#0072ff', '#00b4db', '#0083b0',
            '#6a11cb', '#2575fc', '#00c6ff', '#0072ff', '#00b4db', '#0083b0'
        ];
        
        votesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: club.candidates.map(c => c.nom),
                datasets: [{
                    data: club.candidates.map(c => c.vote_count),
                    backgroundColor: backgroundColors.slice(0, club.candidates.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Répartition des votes - ${club.nom}`,
                        font: { size: 16 }
                    },
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} votes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateRanking() {
        const selectedClub = document.getElementById('club-select').value;
        let candidatesToDisplay = [];
        
        if (selectedClub === 'all') {
            // Afficher tous les candidats de tous les clubs
            resultsData.clubs.forEach(club => {
                club.candidates.forEach(candidate => {
                    candidatesToDisplay.push({
                        name: candidate.nom,
                        club_nom: club.nom,
                        votes: candidate.vote_count,
                        photo_url: candidate.photo_url || '/static/img/default-profile.png'
                    });
                });
            });
            candidatesToDisplay.sort((a, b) => b.votes - a.votes);
        } else {
            // Afficher les candidats du club sélectionné
            const club = resultsData.clubs.find(c => c.id == selectedClub);
            if (club) {
                candidatesToDisplay = club.candidates.map(candidate => ({
                    name: candidate.nom,
                    club_nom: club.nom,
                    votes: candidate.vote_count,
                    photo_url: candidate.photo_url || '/static/img/default-profile.png'
                }));
                updateVotesChart(club.id);
            }
        }
        
        // Mettre à jour le classement
        const rankingContainer = document.getElementById('candidates-ranking');
        rankingContainer.innerHTML = template(candidatesToDisplay);
    }

    function updateParticipationStats() {
        const filiere = document.getElementById('filiere-select').value;
        let statsHtml = '';
        
        if (filiere === 'all') {
            statsHtml = `
                <div class="stat-item">
                    <div class="stat-value">${resultsData.participation.global.percentage}%</div>
                    <div class="stat-label">Participation globale</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${resultsData.participation.global.voters}</div>
                    <div class="stat-label">Votants</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${resultsData.participation.global.total}</div>
                    <div class="stat-label">Inscrits</div>
                </div>
            `;
        } else {
            const filiereData = resultsData.participation.byFiliere[filiere];
            statsHtml = `
                <div class="stat-item">
                    <div class="stat-value">${filiereData.percentage}%</div>
                    <div class="stat-label">Participation ${filiere}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${filiereData.voters}</div>
                    <div class="stat-label">Votants</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${filiereData.total}</div>
                    <div class="stat-label">Inscrits</div>
                </div>
            `;
        }
        
        document.getElementById('participation-stats').innerHTML = statsHtml;
    }
});