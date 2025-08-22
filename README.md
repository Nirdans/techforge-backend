# 💰 TechForge - API SGDP (Système de Gestion des Dépenses Personnelles)

## 📖 Description du Projet

TechForge SGDP est une API REST moderne développée avec Django et Django REST Framework pour la gestion et le suivi des dépenses personnelles et familiales. Ce système permet aux utilisateurs de gérer leurs finances de manière efficace, que ce soit individuellement ou en groupe familial.

### 🎯 Fonctionnalités Principales

- **Gestion des utilisateurs** : Création, authentification et gestion des profils utilisateurs avec modèle d'utilisateur personnalisé
- **Groupes familiaux** : Possibilité de créer et gérer des groupes pour les dépenses partagées
- **Catégorisation** : Organisation des transactions par catégories personnalisables (revenus/dépenses)
- **Suivi des transactions** : Enregistrement détaillé des revenus et dépenses avec justificatifs
- **Gestion des soldes** : Suivi automatique des soldes individuels et de groupe avec devise personnalisable
- **Justificatifs** : Upload et gestion des pièces justificatives pour les transactions
- **API REST complète** : Interface API RESTful avec ViewSets pour intégration frontend
- **Base de données flexible** : Support PostgreSQL et SQLite avec configuration par variables d'environnement

## 🏗️ Architecture du Projet

```
backend/
├── api/                    # Application principale
│   ├── models/            # Modèles de données
│   │   ├── user.py
│   │   ├── groupe_familial.py
│   │   ├── categorie.py
│   │   ├── membre_groupe.py
│   │   └── transaction.py
│   ├── views/             # Contrôleurs API
│   │   ├── user_views.py
│   │   ├── groupe_familial_views.py
│   │   ├── categorie_views.py
│   │   ├── membre_groupe_views.py
│   │   └── transaction_views.py
│   ├── serializers/       # Sérialiseurs DRF
│   │   ├── user_serializer.py
│   │   ├── groupe_familial_serializer.py
│   │   ├── categorie_serializer.py
│   │   ├── membre_groupe_serializer.py
│   │   └── transaction_serializer.py
│   └── migrations/        # Migrations de base de données
├── core/                  # Configuration Django
```

## 🛠️ Technologies Utilisées

- **Backend** : Django 5.2.5
- **API** : Django REST Framework 3.16.1
- **Base de données** : PostgreSQL (production) / SQLite (développement)
- **Langage** : Python 3.12
- **Architecture** : REST API avec ViewSets
- **Gestion des variables d'environnement** : python-decouple
- **Parsing SQL** : sqlparse 0.5.3
- **ASGI** : asgiref 3.9.1

## 📋 Prérequis

- Python 3.10+
- pip (gestionnaire de paquets Python)
- Git (pour le clonage du repository)
- PostgreSQL (optionnel, pour production)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Nirdans/techforge-backend.git
cd techforge-backend
```

### 2. Créer et activer l'environnement virtuel

```bash
# Création de l'environnement virtuel
python -m venv env

# Activation (Linux/Mac)
source env/bin/activate

# Activation (Windows)
env\Scripts\activate
```

### 3. Installer les dépendances

```bash
# Installation à partir du fichier requirements.txt
pip install -r requirements.txt

# Ou installation manuelle des packages principaux
pip install django==5.2.5
pip install djangorestframework==3.16.1
pip install python-decouple
pip install psycopg2-binary
pip install sqlparse==0.5.3
```

### 4. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Configuration de sécurité
SECRET_KEY=votre_cle_secrete_django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Pour PostgreSQL (production)
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=nom_de_votre_base
# DB_USER=utilisateur_postgres
# DB_PASSWORD=mot_de_passe
# DB_HOST=localhost
# DB_PORT=5432
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

### Endpoints principaux

| Endpoint              | Méthodes               | Description                   |
| --------------------- | ---------------------- | ----------------------------- |
| `/api/`               | GET                    | Endpoint de test API          |
| `/users/`             | GET, POST, PUT, DELETE | Gestion des utilisateurs      |
| `/groupes-familiaux/` | GET, POST, PUT, DELETE | Gestion des groupes familiaux |
| `/categories/`        | GET, POST, PUT, DELETE | Gestion des catégories        |
| `/membres-groupe/`    | GET, POST, PUT, DELETE | Gestion des membres de groupe |
| `/transactions/`      | GET, POST, PUT, DELETE | Gestion des transactions      |

### Exemples d'utilisation

```bash
# Tester l'API
curl -X GET http://127.0.0.1:8000/api/

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
| `/api/`               | GET                    | Endpoint de test              |
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
    "groupe_familial": null
  }'
```

## 🗄️ Modèles de Données

### User (Modèle d'utilisateur personnalisé)

- **Hérite de** : `AbstractUser` (Django)
- **Champs supplémentaires** :
  - `devise` : Devise préférée de l'utilisateur (CharField)
  - `solde` : Solde personnel (DecimalField, max_digits=10, decimal_places=2)
- **Fonctionnalités** : Authentification, profils personnalisés, gestion des soldes

### GroupeFamilial

- **Description** : Groupes pour dépenses partagées
- **Fonctionnalités** : Solde collectif du groupe, gestion multi-utilisateurs

### Categorie

- **Description** : Catégorisation des transactions
- **Types supportés** : "income" (revenus) / "expense" (dépenses)
- **Champs** : nom, description, type

### MembreGroupe

- **Description** : Association utilisateur-groupe avec rôles
- **Fonctionnalités** : Gestion des rôles et soldes individuels dans le groupe

### Transaction

- **Description** : Enregistrement des mouvements financiers
- **Champs principaux** :
  - `montant` : Montant de la transaction
  - `date` : Date de la transaction
  - `description` : Description détaillée
  - `type` : "income" ou "expense"
  - `justificatif` : Fichier de justification (optionnel)
  - Relations : `user`, `categorie`, `groupe_familial` (optionnel)

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test

# Lancer les tests avec verbosité
python manage.py test --verbosity=2
```

## 📁 Structure des Dossiers

Le projet suit une architecture modulaire :

- **models/** : Modèles de données séparés par entité
- **views/** : ViewSets REST organisés par modèle
- **serializers/** : Sérialiseurs pour l'API REST
- Chaque dossier contient un `__init__.py` pour l'importation Python

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Nirdans** - [GitHub](https://github.com/Nirdans)

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub ou contactez l'équipe de développement.

---

_Développé avec ❤️ pour une gestion financière simplifiée_
