# PhotoFlow

PhotoFlow est une application web de partage de photos moderne, inspirée d'Instagram, développée avec Next.js 15 (frontend) et Express/MongoDB (backend).

## Fonctionnalités principales

- Authentification sécurisée (inscription, connexion, mot de passe oublié, vérification email)
- Création, édition et suppression de posts avec upload d'image (Cloudinary)
- Fil d'actualité (feed) en temps réel
- Commentaires, likes, sauvegarde de posts
- Système de follow/unfollow entre utilisateurs
- Profil utilisateur avec édition et affichage des posts/sauvegardes
- Notifications (Sonner)
- UI responsive et moderne (Tailwind CSS, Lucide React)

## Stack technique

- **Frontend** : Next.js 15 (app directory), React 19, Redux Toolkit, TypeScript, Tailwind CSS, Lucide React, Sonner
- **Backend** : Express.js, MongoDB/Mongoose, Cloudinary, JWT, bcryptjs
- **Autres** : redux-persist, axios, @radix-ui/react, ESLint, dotenv

## Structure du projet

```
photo_flow/
├── backend/
│   ├── app.js, server.js, config.env
│   ├── controllers/, models/, routes/, utils/
│   └── config/ (db, cors, cloudinary...)
├── frontend/
│   ├── app/ (Next.js app directory)
│   ├── components/ (UI, helpers, home, auth, profile...)
│   ├── store/ (Redux slices)
│   ├── types.d.ts, server.ts, globals.css
│   └── package.json, README.md
└── README.md (ce fichier)
```

## Installation & Lancement

### Prérequis

- Node.js >= 18
- MongoDB local ou Atlas
- Un compte Cloudinary

### Variables d'environnement

- `backend/config.env` :
  - `PORT=8000`
  - `DATABASE=...` (URI MongoDB)
  - `JWT_SECRET=...`
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_API_KEY=...`
  - `CLOUDINARY_API_SECRET=...`
- `frontend/.env.local` :
  - `NEXT_PUBLIC_BACKEND_API=http://localhost:8000/api/v1`

### Démarrage

Dans deux terminaux séparés :

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Accède à [http://localhost:3000](http://localhost:3000)

## Scripts utiles

- `npm run dev` : Démarrage en mode développement
- `npm run build` : Build production (frontend)
- `npm run start` : Lancer le build (frontend)
- `npm run lint` : Linter le code

## API REST (exemples)

- `POST   /api/v1/users/signup` — Inscription
- `POST   /api/v1/users/login` — Connexion
- `POST   /api/v1/posts/create-post` — Créer un post
- `GET    /api/v1/posts/all` — Feed
- `DELETE /api/v1/posts/delete-post/:id`— Supprimer un post
- `PATCH  /api/v1/posts/like-dislike/:id` — Like/Dislike
- `POST   /api/v1/posts/comment/:id` — Ajouter un commentaire
- `PATCH  /api/v1/users/follow-unfollow/:id` — Suivre/Se désabonner

## Bonnes pratiques & Architecture

- Séparation stricte frontend/backend
- Gestion d’état centralisée (Redux Toolkit)
- Gestion des erreurs et loading centralisée (handleAuthRequest)
- UI réactive, feedback utilisateur (Sonner)
- Sécurité : JWT, bcryptjs, CORS, helmet, sanitization
- Code typé (TypeScript côté front)

## Déploiement

- Frontend : Vercel (Next.js)
- Backend : Railway, Render, ou VPS

---

> Projet réalisé par Didi518 — 2025
