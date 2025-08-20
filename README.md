# 💰 TechForge - API SGDP (Système de Gestion des Dépenses Personnelles)

## 📖 Description du Projet

TechForge SGDP est une API REST moderne développée avec Django et Django REST Framework pour la gestion et le suivi des dépenses personnelles et familiales. Ce système permet aux utilisateurs de gérer leurs finances de manière efficace, que ce soit individuellement ou en groupe familial.

### 🎯 Fonctionnalités Principales

- **Gestion des utilisateurs** : Création, authentification et gestion des profils utilisateurs
- **Groupes familiaux** : Possibilité de créer et gérer des groupes pour les dépenses partagées
- **Catégorisation** : Organisation des transactions par catégories personnalisables
- **Suivi des transactions** : Enregistrement détaillé des revenus et dépenses
- **Gestion des soldes** : Suivi automatique des soldes individuels et de groupe
- **Justificatifs** : Upload et gestion des pièces justificatives
- **API REST complète** : Interface API pour intégration avec des applications frontend

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
├── env/                   # Environnement virtuel Python
└── db.sqlite3            # Base de données SQLite
```

## 🛠️ Technologies Utilisées

- **Backend** : Django 5.2.5
- **API** : Django REST Framework 3.16.1
- **Base de données** : SQLite (par défaut, configurable)
- **Langage** : Python 3.12
- **Architecture** : REST API

## 📋 Prérequis

- Python 3.10+
- pip (gestionnaire de paquets Python)
- Git (pour le clonage du repository)

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
pip install django==5.2.5
pip install djangorestframework==3.16.1
pip install sqlparse==0.5.3
```

### 4. Configuration de la base de données

```bash
# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur (optionnel)
python manage.py createsuperuser
```

### 5. Lancer le serveur de développement

```bash
python manage.py runserver
```

Le serveur sera accessible à l'adresse : `http://127.0.0.1:8000/`

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
curl -X GET http://127.0.0.1:8000/users/

# Créer une nouvelle transaction
curl -X POST http://127.0.0.1:8000/transactions/ \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 50.00,
    "date": "2025-08-20",
    "description": "Courses alimentaires",
    "type": "debit",
    "categorie": 1,
    "user": 1
  }'
```

## 🗄️ Modèles de Données

### User

- Gestion des utilisateurs avec soldes individuels
- Authentification et profils personnalisés

### GroupeFamilial

- Groupes pour dépenses partagées
- Solde collectif du groupe

### Categorie

- Catégorisation des transactions
- Types : revenus ou dépenses

### MembreGroupe

- Association utilisateur-groupe
- Rôles et soldes individuels dans le groupe

### Transaction

- Enregistrement des mouvements financiers
- Support des justificatifs

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
