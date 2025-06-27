// static/js/generer_codes.js
document.addEventListener('DOMContentLoaded', function() {
    // Stockage du formulaire à soumettre
    let currentForm = null;
    
    // Gestion des confirmations
    document.querySelectorAll('.btn-confirm').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const message = this.getAttribute('data-message');
            currentForm = this.closest('form');
            
            document.getElementById('confirmMessage').textContent = message;
            
            // Initialisation du modal Bootstrap
            const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
            modal.show();
        });
    });
    
    // Confirmation de suppression
    document.getElementById('confirmButton').addEventListener('click', function() {
        if (currentForm) {
            currentForm.querySelector('input[name="confirmation"]').value = 'true';
            currentForm.submit();
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        modal.hide();
    });
});

// Confirmation avant suppression
document.querySelectorAll('form[onsubmit]').forEach(form => {
    form.onsubmit = function() {
        const message = this.getAttribute('onsubmit').match(/return confirm\('(.+)'\)/)[1];
        return confirm(message);
    };
});