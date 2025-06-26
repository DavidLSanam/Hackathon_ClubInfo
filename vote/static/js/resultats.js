document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────
  // TRI DES CANDIDATS ET TABLEAU GLOBAL DES RÉSULTATS
  // ─────────────────────────────────────────────────────
  candidates.sort((a, b) => b.votes - a.votes);
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const tableBody = document.getElementById('results-body');
  candidates.forEach((c, index) => {
    const pourcentage = ((c.votes / totalVotes) * 100).toFixed(1) + "%";
    const row = document.createElement('tr');
    if (index < 3) row.style.backgroundColor = ['#b2dfdb', '#c8e6c9', '#dcedc8'][index];
    row.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>${c.name}</td>
      <td>${c.poste}</td>
      <td>${c.votes}</td>
      <td>${pourcentage}</td>
    `;
    tableBody.appendChild(row);
  });

  // ─────────────────────────────────────────────────────
  // GRAPH BAR GLOBAL POUR TOUS LES CANDIDATS
  // ─────────────────────────────────────────────────────
  const labels = candidates.map(c => c.name);
  const data = candidates.map(c => c.votes);
  const topColors = ['#00796b', '#43a047', '#66bb6a'];

  const ctx = document.getElementById('barChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nombre de votes',
        data: data,
        backgroundColor: candidates.map((_, i) => topColors[i] || '#b2dfdb'),
        borderColor: '#004d40',
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y} votes`
          }
        },
        title: {
          display: true,
          text: 'Répartition des votes par candidat',
          color: '#004d40',
          font: { size: 20, weight: 'bold' }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutElastic'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10,
            color: '#00796b'
          }
        },
        x: {
          ticks: { color: '#00796b' }
        }
      }
    }
  });

  // ─────────────────────────────────────────────────────
  // SÉLECTION DYNAMIQUE : PAR POSTE ET TYPE DE VUE
  // ─────────────────────────────────────────────────────
  const posteSel = document.getElementById("posteSelect");
  const vueSel   = document.getElementById("viewSelect");
  const btn      = document.getElementById("afficherBtn");

  const hideAll = () => {
    document.querySelectorAll("[id^='chart-box-poste-'],[id^='table-box-poste-']")
            .forEach(div => div.style.display = "none");
  };

  btn.addEventListener("click", () => {
    const poste = posteSel.value;
    const vue = vueSel.value;

    if (!poste) {
      alert("Veuillez choisir un poste d’abord 🙂");
      return;
    }

    hideAll();

    if (vue === "graphique") {
      const chartBox = document.getElementById('chart-box-' + poste);
      chartBox.style.display = 'block';

      const canvas = chartBox.querySelector('canvas');
      if (!canvas.chartInitialized) {
        const labels = JSON.parse(chartBox.dataset.labels);
        const votes = JSON.parse(chartBox.dataset.votes);
        const posteNom = chartBox.dataset.poste;

        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Votes',
              data: votes,
              backgroundColor: [
                "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
                "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab"
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: "Résultats du poste : " + posteNom
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });

        canvas.chartInitialized = true;
      }
    }

    if (vue === "classement") {
      const tableBox = document.getElementById('table-box-' + poste);
      if (tableBox) {
        tableBox.classList.remove("fadeShow");
        void tableBox.offsetWidth; // Redémarre l’animation
        tableBox.classList.add("fadeShow");
        tableBox.style.display = "block";
      }
    }
  });
});
