from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string


class PasswordResetCode(models.Model):
    """
    Modèle pour stocker les codes de réinitialisation de mot de passe
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_codes'
    )
    code = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Code de réinitialisation"
        verbose_name_plural = "Codes de réinitialisation"
        
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        if not self.expires_at:
            # Le code expire après 15 minutes
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)
    
    def generate_code(self):
        """Génère un code à 6 caracteres unique"""
        while True:
            code = ''.join(random.choices(string.digits, k=6))
            if not PasswordResetCode.objects.filter(code=code, is_used=False).exists():
                return code
    
    def is_expired(self):
        """Vérifie si le code a expiré"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Vérifie si le code est valide (non utilisé et non expiré)"""
        return not self.is_used and not self.is_expired()
    
    def __str__(self):
        return f"Code {self.code} pour {self.user.email}"
