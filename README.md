# 💰 E-Finance - API de Gestion Financière Personnelle et Familiale

## 📖 Description du Projet

E-Finance est une API REST moderne et complète développée avec Django et Django REST Framework pour la gestion et le suivi des finances personnelles et familiales. Ce système permet aux utilisateurs de gérer leurs finances de manière efficace, que ce soit individuellement ou en groupe, avec des fonctionnalités avancées de reporting et d'analyse.

### 🎯 Fonctionnalités Principales

- **Authentification JWT** : Système d'authentification sécurisé avec JSON Web Tokens
- **Gestion des utilisateurs** : Profils utilisateurs personnalisés avec reset de mot de passe par email
- **Groupes familiaux** : Création et gestion de groupes pour les dépenses partagées avec rôles (admin/membre)
- **Catégorisation intelligente** : Organisation des transactions par catégories personnalisables avec statistiques
- **Suivi des transactions** : Enregistrement détaillé avec upload de preuves/justificatifs
- **Gestion automatique des soldes** : Suivi en temps réel des soldes individuels et de groupe
- **Pagination avancée** : Pagination personnalisée avec nombre total de pages
- **Statistiques et rapports** : Analyses détaillées par catégorie, période et type
- **API REST complète** : Interface RESTful avec ViewSets et permissions granulaires
- **Frontend React intégré** : Interface utilisateur moderne avec Material-UI

## 🏗️ Architecture du Projet

```
E-finance/
├── api/                          # Application principale Django
│   ├── models/                   # Modèles de données
│   │   ├── user.py              # Utilisateur personnalisé
│   │   ├── group.py             # Groupes familiaux
│   │   ├── category.py          # Catégories de transactions
│   │   ├── member.py            # Membres de groupes
│   │   ├── transaction.py       # Transactions financières
│   │   └── password_reset.py    # Reset de mot de passe
│   ├── views/                   # Contrôleurs API
│   │   ├── auth.py              # Authentification JWT
│   │   ├── user.py              # Gestion utilisateurs
│   │   ├── group.py             # Gestion groupes
│   │   ├── category.py          # Gestion catégories + stats
│   │   ├── member.py            # Gestion membres
│   │   └── transaction.py       # Gestion transactions + stats
│   ├── serializers/             # Sérialiseurs DRF
│   ├── permissions/             # Permissions personnalisées
│   ├── manager/                 # Managers personnalisés
│   ├── encryption/              # Chiffrement et sécurité
│   ├── filters/                 # Filtres personnalisés
│   └── pagination.py            # Pagination personnalisée
├── core/                        # Configuration Django
├── logs/                        # Configuration des logs
├── media/                       # Fichiers uploadés
├── static/front/                # Frontend React
│   ├── src/
│   │   ├── layouts/
│   │   │   ├── dashboard/       # Tableau de bord
│   │   │   ├── categories/      # Gestion catégories
│   │   │   ├── transactions/    # Gestion transactions
│   │   │   └── authentication/  # Authentification
│   │   ├── components/          # Composants réutilisables
│   │   └── routes.js           # Configuration des routes
└── requirements.txt
```

## 🛠️ Technologies Utilisées

### Backend

- **Framework** : Django 5.2.6
- **API** : Django REST Framework 3.15.2
- **Authentification** : SimpleJWT (JWT tokens)
- **Base de données** : PostgreSQL / SQLite
- **Upload de fichiers** : Support multipart/form-data
- **Email** : SMTP pour reset de mot de passe
- **Filtrage** : django-filter avec recherche avancée
- **Documentation** : drf-yasg (Swagger/OpenAPI)
- **CORS** : django-cors-headers

### Frontend

- **Framework** : React.js
- **UI Library** : Material-UI (@mui/material)
- **Routing** : React Router
- **Icons** : Material Icons

### Outils de développement

- **Python** : 3.12.3
- **Variables d'environnement** : python-decouple
- **Logs** : Configuration personnalisée avec formatage coloré

## 📋 Prérequis

- Python 3.10+
- Node.js 16+ (pour le frontend)
- pip (gestionnaire de paquets Python)
- npm ou yarn (pour le frontend)
- Git
- PostgreSQL (recommandé) ou SQLite (développement)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Nirdans/techforge-backend.git
cd cd techforge-backend
```

### 2. Configuration du Backend

#### Créer et activer l'environnement virtuel

```bash
# Création de l'environnement virtuel
python -m venv env

# Activation (Linux/Mac)
source env/bin/activate

# Activation (Windows)
env\Scripts\activate
```

#### Installer les dépendances

```bash
pip install -r requirements.txt
```

#### Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Configuration de sécurité
SECRET_KEY=votre_cle_secrete_django_tres_longue_et_securisee
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données PostgreSQL (recommandé)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=e_finance_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432

# Configuration email (pour reset de mot de passe)
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@votre-domaine.com
EMAIL_HOST_PASSWORD=votre_mot_de_passe_email
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=E-Finance <noreply@votre-domaine.com>
```

#### Configuration de la base de données

```bash
# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser
```

### 3. Configuration du Frontend (optionnel)

```bash
cd static/front

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

### 4. Lancer le serveur

```bash
# Backend Django
python manage.py runserver

# Le serveur sera accessible à :
# API : http://127.0.0.1:8000/api/v1/
# Admin : http://127.0.0.1:8000/admin/
# Swagger : http://127.0.0.1:8000/swagger/
```

## 📡 API Documentation

### Base URL

```
http://127.0.0.1:8000/api/v1/
```

### 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

```bash
# Connexion et récupération du token
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/
  -H "Content-Type: application/json"
  -d '{
    "email": "user@example.com",
    "password": "motdepasse"
  }'

# Réponse
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Utilisation du token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  http://127.0.0.1:8000/api/v1/categories/
```

### 📚 Endpoints Principaux

| Endpoint                         | Méthodes         | Description                       | Pagination |
| -------------------------------- | ---------------- | --------------------------------- | ---------- |
| **Authentification**             |
| `/auth/login/`                   | POST             | Connexion utilisateur             | -          |
| `/auth/logout/`                  | POST             | Déconnexion                       | -          |
| `/auth/password-reset/request/`  | POST             | Demande reset mot de passe        | -          |
| `/auth/password-reset/validate/` | POST             | Validation code reset             | -          |
| `/auth/password-reset/confirm/`  | POST             | Confirmation nouveau mot de passe | -          |
| **Utilisateurs**                 |
| `/users/`                        | GET, POST        | Liste/Création utilisateurs       | ✅         |
| `/users/{id}/`                   | GET, PUT, DELETE | Détail utilisateur                | -          |
| `/users/profile/`                | GET, PUT         | Profil utilisateur connecté       | -          |
| **Catégories**                   |
| `/categories/`                   | GET, POST        | Liste/Création catégories         | ✅         |
| `/categories/{id}/`              | GET, PUT, DELETE | Détail catégorie                  | -          |
| `/categories/stats/`             | GET              | Statistiques catégories           | -          |
| `/categories/most_used/`         | GET              | Catégories les plus utilisées     | -          |
| `/categories/by_type/`           | GET              | Catégories par type               | -          |
| **Transactions**                 |
| `/transactions/`                 | GET, POST        | Liste/Création transactions       | ✅         |
| `/transactions/{id}/`            | GET, PUT, DELETE | Détail transaction                | -          |
| `/transactions/stats/`           | GET              | Statistiques transactions         | -          |
| `/transactions/by_category/`     | GET              | Transactions par catégorie        | -          |
| **Groupes**                      |
| `/groups/`                       | GET, POST        | Liste/Création groupes            | ✅         |
| `/groups/{id}/`                  | GET, PUT, DELETE | Détail groupe                     | -          |
| `/groups/{id}/members/`          | GET              | Membres du groupe                 | -          |

### 📊 Structure de Pagination

Toutes les listes paginées retournent :

```json
{
  "count": 25,              // Total d'éléments
  "total_pages": 9,         // Nombre total de pages
  "current_page": 1,        // Page actuelle
  "page_size": 3,          // Éléments par page
  "next": "http://127.0.0.1:8000/api/v1/transactions/?page=2",
  "previous": null,
  "results": [...]         // Données de la page
}
```

### 💡 Exemples d'utilisation

#### Créer une transaction avec preuve

```bash
# Avec fichier de preuve (multipart/form-data)
curl -X POST http://127.0.0.1:8000/api/v1/transactions/
  -H "Authorization: Bearer YOUR_TOKEN"
  -F "amount=150.00"
  -F "date=2025-01-15T10:00:00Z"
  -F "description=Achat avec facture"
  -F "type=expense"
  -F "category=1"
  -F "preuve=@facture.pdf"

# Sans preuve (JSON)
curl -X POST http://127.0.0.1:8000/api/v1/transactions/
  -H "Authorization: Bearer YOUR_TOKEN"
  -H "Content-Type: application/json"
  -d '{
    "amount": 50.00,
    "date": "2025-01-15T10:00:00Z",
    "description": "Café du matin",
    "type": "expense",
    "category": 1
  }'
```

#### Obtenir des statistiques

```bash
# Statistiques des catégories
curl -H "Authorization: Bearer YOUR_TOKEN"
  "http://127.0.0.1:8000/api/v1/categories/stats/"

# Transactions d'une période
curl -H "Authorization: Bearer YOUR_TOKEN"
  "http://127.0.0.1:8000/api/v1/transactions/stats/?start_date=2025-01-01&end_date=2025-01-31"
```

#### Filtrage et recherche

```bash
# Rechercher des transactions
curl -H "Authorization: Bearer YOUR_TOKEN"
  "http://127.0.0.1:8000/api/v1/transactions/?search=café&type=expense"

# Filtrer par catégorie
curl -H "Authorization: Bearer YOUR_TOKEN"
  "http://127.0.0.1:8000/api/v1/transactions/?category=1&ordering=-date"
```

### 5. Configuration de la base de données

```bash
# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (recommandé)
python manage.py createsuperuser
```

### 6. Lancer le serveur de développement

```bash
python manage.py runserver
```

Le serveur sera accessible à l'adresse : `http://127.0.0.1:8000/`

## 📡 Endpoints API

### Base URL

```
http://127.0.0.1:8000/api/v1/
```

### Exemples d'utilisation

```bash
# Tester l'API
curl -X GET http://127.0.0.1:8000/api/v1/test/

# Lister tous les utilisateurs
curl -X GET http://127.0.0.1:8000/api/v1/users/

# Créer un utilisateur
curl -X POST http://127.0.0.1:8000/api/v1/users/
  -H "Content-Type: application/json"
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "motdepasse123",
    "first_name": "John",
    "last_name": "Doe",
    "devise": "EUR",
    "solde": 1000.00
  }'

# Créer une nouvelle transaction
curl -X POST http://127.0.0.1:8000/api/v1/transactions/
  -H "Content-Type: application/json"
  -d '{
    "montant": 100.50,
    "date": "2025-08-22",
    "description": "Courses alimentaires",
    "type": "expense",
    "categorie": 1,
    "justificatif": null,
    "user": 1,
    "groupe_familial": null
  }'

# Créer une catégorie
curl -X POST http://127.0.0.1:8000/api/v1/categories/
  -H "Content-Type: application/json"
  -d '{
    "nom": "Alimentation",
    "description": "Dépenses alimentaires",
    "type": "expense"
  }'
```

Le serveur sera accessible à l'adresse : `http://127.0.0.1:8000/api/v1`

## 📡 Endpoints API

### Endpoints principaux

| Endpoint              | Méthode                | Description                   |
| --------------------- | ---------------------- | ----------------------------- |
| `/test/`              | GET                    | Endpoint de test              |
| `/users/`             | GET, POST, PUT, DELETE | Gestion des utilisateurs      |
| `/groupes-familiaux/` | GET, POST, PUT, DELETE | Gestion des groupes familiaux |
| `/categories/`        | GET, POST, PUT, DELETE | Gestion des catégories        |
| `/membres-groupe/`    | GET, POST, PUT, DELETE | Gestion des membres de groupe |
| `/transactions/`      | GET, POST, PUT, DELETE | Gestion des transactions      |

### Exemples d'utilisation

```bash
# Lister tous les utilisateurs
curl -X GET http://127.0.0.1:8000/api/v1/users/

# Créer une nouvelle transaction
curl -X POST http://127.0.0.1:8000/api/v1/transactions/ \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 100,
    "date": "2025-08-20",
    "description": "Courses alimentaires",
    "type": "expense", or "income"
    "categorie": 1, (Loyer (expense))
    "justificatif": null, type= file
    "user": 1,
    "group": null
  }'
```

## 🗄️ Modèles de Données

### User (Utilisateur personnalisé)

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)  # Email comme identifiant
    password_hash = models.CharField(max_length=255)  # Hash sécurisé
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    solde = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
```

**Fonctionnalités** :

- Authentification par email
- Reset de mot de passe par email avec code de validation
- Gestion automatique des soldes
- Profil personnalisable

### Group (Groupe familial)

```python
class Group(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Fonctionnalités** :

- Solde collectif automatiquement mis à jour
- Gestion des membres avec rôles (admin/membre)
- Statistiques de groupe

### Category (Catégorie)

```python
class Category(models.Model):
    TYPE_CHOICES = [('income', 'Income'), ('expense', 'Expense')]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, null=True, blank=True)
```

**Fonctionnalités** :

- Catégories personnelles et de groupe
- Statistiques avancées (transactions, montants, pourcentages)
- Manager personnalisé avec méthodes de filtrage

### Transaction (Transaction financière)

```python
class Transaction(models.Model):
    TYPE_CHOICES = [('income', 'Income'), ('expense', 'Expense')]

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField()
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    category = models.ForeignKey(Category, null=True, blank=True)
    preuve = models.FileField(upload_to='transaction_proofs/', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, null=True, blank=True)
```

**Fonctionnalités** :

- Upload de preuves/justificatifs
- Mise à jour automatique des soldes
- Validation des données (montant positif, date cohérente)
- Filtrage et recherche avancés

### Member (Membre de groupe)

```python
class Member(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('member', 'Member')]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    description = models.TextField(blank=True)
    amount_perso = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
```

**Fonctionnalités** :

- Gestion des rôles et permissions
- Solde personnel dans le groupe
- Historique des contributions

## 🔒 Sécurité et Permissions

### Système de permissions personnalisées

- **IsOwnerOrAdmin** : Propriétaire ou superutilisateur
- **IsGroupMemberOrAdmin** : Membre du groupe ou admin
- **Validation des données** : Validation côté serveur stricte
- **Chiffrement** : Mots de passe hashés, tokens JWT sécurisés

### Gestion des erreurs

```python
# Exemple de réponse d'erreur
{
    "error": "Impossible de supprimer la catégorie \"Loyer\". Elle contient 6 transaction(s).",
    "detail": "Vous devez d'abord supprimer ou réassigner toutes les transactions de cette catégorie.",
    "category_id": 1,
    "transaction_count": 6
}
```

### Outils de qualité de code

- **Validation des données** : Serializers DRF avec validation personnalisée
- **Logs structurés** : Configuration de logging avec formatage coloré
- **Documentation automatique** : Swagger/OpenAPI avec drf-yasg
- **Gestion des erreurs** : Réponses d'erreur standardisées

## 📊 Fonctionnalités Avancées

### Statistiques et Analytics

- **Statistiques par catégorie** : Montants, compteurs, pourcentages
- **Analyses temporelles** : Revenus/dépenses par période
- **Rapports de groupe** : Performance collective
- **Catégories les plus utilisées** : Avec limites configurables

### Upload et gestion de fichiers

- **Preuves de transaction** : PDF, images, documents
- **Stockage sécurisé** : Dans le dossier media/transaction_proofs/
- **Validation des fichiers** : Types et tailles autorisés

### Recherche et filtrage

- **Recherche full-text** : Dans descriptions, noms de catégories
- **Filtres multiples** : Type, catégorie, date, groupe
- **Tri personnalisé** : Par date, montant, nom
- **Pagination intelligente** : Avec métadonnées complètes

## 🚀 Déploiement

### Variables d'environnement de production

```env
# Sécurité
SECRET_KEY=votre_cle_secrete_production_tres_longue
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com

# Base de données
DB_ENGINE=django.db.backends.postgresql
DB_NAME=e_finance_prod
DB_USER=e_finance_user
DB_PASSWORD=mot_de_passe_securise
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.votre-domaine.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@votre-domaine.com
EMAIL_HOST_PASSWORD=mot_de_passe_email
EMAIL_USE_TLS=True
```

### Commandes de déploiement

```bash
# Collecte des fichiers statiques
python manage.py collectstatic --noinput

# Migrations
python manage.py migrate

# Création d'un superutilisateur
python manage.py createsuperuser
```

## 📈 Roadmap

### Version actuelle (v1.0)

- ✅ API REST complète
- ✅ Authentification JWT
- ✅ Gestion des groupes familiaux
- ✅ Upload de preuves
- ✅ Statistiques avancées
- ✅ Frontend React

### Prochaines versions

- 🔄 Notifications push
- 🔄 Export PDF des rapports
- 🔄 API mobile dédiée
- 🔄 Intégration bancaire
- 🔄 Budgets et objectifs
- 🔄 Dashboard temps réel

## 🤝 Contribution

1. **Fork** le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commiter** les changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Guidelines de contribution

- Suivre les conventions de nommage Python (PEP 8)
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les nouvelles API endpoints
- Maintenir la compatibilité avec les versions existantes

## 📝 Changelog

### v1.0.0 (2025-01-16)

- 🎉 **Initial release**
- ✨ API REST complète avec Django REST Framework
- 🔐 Authentification JWT avec reset de mot de passe
- 👥 Gestion des groupes familiaux avec rôles
- 📊 Statistiques et rapports avancés
- 📎 Upload de preuves de transaction
- 🎨 Interface React avec Material-UI
- 📖 Documentation Swagger/OpenAPI

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

```
MIT License

Copyright (c) 2025 Sandrin DOSSOU

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Auteur

**Sandrin DOSSOU** (@Nirdans)

- 🌐 GitHub: [https://github.com/Nirdans](https://github.com/Nirdans)
- 📧 Email: contact@sandrindossou.com
- 💼 LinkedIn: [Sandrin DOSSOU](https://linkedin.com/in/sandrin-dossou)

## � Remerciements

- [Django](https://djangoproject.com/) - Framework web Python
- [Django REST Framework](https://www.django-rest-framework.org/) - API REST pour Django
- [Material-UI](https://mui.com/) - Composants React
- [PostgreSQL](https://postgresql.org/) - Base de données
- La communauté open source pour les outils et ressources

## �📞 Support

Pour toute question, problème ou suggestion :

1. 🐛 **Issues** : Ouvrir une issue sur GitHub
2. 💬 **Discussions** : Utiliser les GitHub Discussions
3. 📧 **Contact direct** : contact@sandrindossou.com
4. 📖 **Documentation** : Consulter la documentation Swagger à `/swagger/`

## 🔗 Liens Utiles

- 📚 [Documentation API (Swagger)](http://127.0.0.1:8000/swagger/)
- 🎮 [Admin Django](http://127.0.0.1:8000/admin/)
- 🖥️ [Frontend React](http://127.0.0.1:3000/)
- 📋 [Issues GitHub](https://github.com/Nirdans/techforge-backend/issues)
- 🔄 [Pull Requests](https://github.com/Nirdans/techforge-backend/pulls)

---

<div align="center">

**🚀 Développé avec ❤️ pour simplifier la gestion financière personnelle et familiale**

[![Made with Django](https://img.shields.io/badge/Made%20with-Django-092E20?style=for-the-badge&logo=django)](https://djangoproject.com/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

</div>
