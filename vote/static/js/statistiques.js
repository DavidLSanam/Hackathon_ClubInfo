document.addEventListener('DOMContentLoaded', () => {
  const posteSelect = document.getElementById('posteSelect');
  const classSelect = document.getElementById('classSelect');
  const filiereSelect = document.getElementById('filiereSelect');
  const afficherBtn = document.getElementById('afficherBtn');
  const voteChartCtx = document.getElementById('voteChart').getContext('2d');

  const selectWrapperClasse = document.getElementById('selectWrapperClasse');
  const selectWrapperFiliere = document.getElementById('selectWrapperFiliere');

  let currentChart = null;

  // Toggle affichage selects classe/filiere selon radio
  const radios = document.querySelectorAll('input[name="viewType"]');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'classe' && radio.checked) {
        selectWrapperClasse.style.display = 'block';
        selectWrapperFiliere.style.display = 'none';
      } else if (radio.value === 'filiere' && radio.checked) {
        selectWrapperClasse.style.display = 'none';
        selectWrapperFiliere.style.display = 'block';
      }
    });
  });

  function drawChart(labels, votes, title) {
    if (currentChart) currentChart.destroy();

    currentChart = new Chart(voteChartCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de votes',
          data: votes,
          backgroundColor: '#00796b',
          borderRadius: 5,
          borderWidth: 1,
          borderColor: '#004d40',
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: title,
            font: { size: 18, weight: 'bold' },
            color: '#004d40',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#00796b' }
          },
          x: {
            ticks: { color: '#00796b' }
          }
        }
      }
    });
  }

  afficherBtn.addEventListener('click', () => {
    const poste = posteSelect.value;
    if (!poste) {
      alert('Veuillez choisir un poste.');
      return;
    }

    const viewType = document.querySelector('input[name="viewType"]:checked').value;

    if (viewType === 'classe') {
      const classe = classSelect.value;
      if (!classe) {
        alert('Veuillez choisir une classe.');
        return;
      }
      const data = statsParClasse[poste][classe];
      if (!data || data.labels.length === 0) {
        alert("Pas de données pour ce choix.");
        return;
      }
      drawChart(data.labels, data.votes, `Votes pour ${poste} - Classe ${classe}`);

    } else if (viewType === 'filiere') {
      const filiere = filiereSelect.value;
      if (!filiere) {
        alert('Veuillez choisir une filière.');
        return;
      }
      const data = statsParFiliere[poste][filiere];
      if (!data || data.labels.length === 0) {
        alert("Pas de données pour ce choix.");
        return;
      }
      drawChart(data.labels, data.votes, `Votes pour ${poste} - Filière ${filiere}`);
    }
  });

  // Affichage du tableau "filières les plus représentées dans le bureau"
  function fillBureauTable() {
    const tbody = document.querySelector('#bureauTable tbody');
    tbody.innerHTML = '';

    // Pour chaque poste, trouver le candidat ayant le max votes (tous filieres confondues)
    for (const poste in votesParFiliere) {
      // votesParFiliere[poste] est une liste d'objets {poste__nom, candidat__nom, total}
      // Mais ici votesParFiliere est un objet avec filieres clés, donc on restructure :

      // votesParFiliere = { filiere1: [...], filiere2: [...], ...}
      // Il faut parcourir toutes filieres, puis sélectionner max par poste

      // On va d'abord construire une map poste -> {candidat, filiere, total}
    }

    // Cette logique est à faire côté Python plutôt que JS (car JS n’a pas bien structuré le votesParFiliere).
    // Sinon on peut faire un traitement simplifié côté JS en combinant votesParFiliere.

    // Je te propose de créer côté Django une variable JSON 'bureau_top' que tu prépares dans ta vue
    // et la passer ici pour le tableau.

    // Exemple : 
    // bureau_top = [
    //   {"poste": "Président", "candidat": "Alice", "filiere": "Informatique", "votes": 34},
    //   {"poste": "Secrétaire", "candidat": "Bob", "filiere": "Gestion", "votes": 28},
    //   ...
    // ]

  }

  fillBureauTable();
});
