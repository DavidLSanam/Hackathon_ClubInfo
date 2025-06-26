# vote/context_processors.py
from .models import Voter

def voter_context(request):
    voter = None
    voter_id = request.session.get('voter_id')
    if voter_id:
        try:
            voter = Voter.objects.get(id=voter_id)
        except Voter.DoesNotExist:
            pass
    return {'voter': voter}
