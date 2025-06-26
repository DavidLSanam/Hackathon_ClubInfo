// Gestion du mode sombre/clair
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById("dark-mode-toggle");
    const html = document.documentElement;
    
    // Vérifier le préférence système ou le stockage local
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Appliquer le thème sauvegardé ou le thème système
    html.setAttribute('data-theme', savedTheme);
    
    // Mettre à jour l'icône du bouton
    updateToggleIcon(savedTheme);

    toggle.addEventListener("click", () => {
        const currentTheme = html.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        // Changer le thème
        html.setAttribute("data-theme", newTheme);
        
        // Sauvegarder le choix dans le localStorage
        localStorage.setItem('theme', newTheme);
        
        // Mettre à jour l'icône
        updateToggleIcon(newTheme);
    });

    // Fonction pour mettre à jour l'icône du bouton
    function updateToggleIcon(theme) {
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
    }

    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateToggleIcon(newTheme);
        }
    });
});