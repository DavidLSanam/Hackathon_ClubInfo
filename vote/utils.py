from django.shortcuts import redirect
from .models import Voter, AccessControl
from django.contrib import messages
from functools import wraps

def matricule_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        voter_id = request.session.get('voter_id')
        if not voter_id:
            messages.error(request, "Vous devez être connecté avec votre matricule.")
            return redirect('login')
        try:
            voter = Voter.objects.get(id=voter_id)
            request.voter = voter  # injecte voter dans la requête
        except Voter.DoesNotExist:
            messages.error(request, "Voter introuvable.")
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper


def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Vérifie d'abord la session admin (nouveau système)
        if 'admin_id' in request.session or 'admin_matricule' in request.session:
            return view_func(request, *args, **kwargs)
        
        # Ensuite vérifie l'ancien système (Voter admin)
        if 'voter_id' in request.session:
            try:
                voter = Voter.objects.get(id=request.session['voter_id'])
                if voter.is_admin:
                    return view_func(request, *args, **kwargs)
            except Voter.DoesNotExist:
                pass
        
        # Si aucun des deux ne fonctionne, rediriger vers la page de connexion
        return redirect('login')  # Ou retourner une erreur 403

    return _wrapped_view

def check_access(access_name):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            try:
                control = AccessControl.objects.get(name=access_name)
                if not control.is_open:
                    messages.error(request, control.closed_message)
                    return redirect(control.redirect_url)
                return view_func(request, *args, **kwargs)
            except AccessControl.DoesNotExist:
                # Si le contrôle n'existe pas, on laisse passer par défaut
                return view_func(request, *args, **kwargs)
        return wrapper
    return decorator