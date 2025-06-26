from .models import Voter

class VoterMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        voter_id = request.session.get('voter_id')
        if voter_id:
            try:
                request.voter = Voter.objects.get(id=voter_id)
            except Voter.DoesNotExist:
                pass
        return self.get_response(request)