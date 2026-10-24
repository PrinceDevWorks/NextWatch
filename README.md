# NextWatch 🎬

A modern, serverless Movie & TV Show recommendation web application built with **React**, **Vite (TypeScript)**, **Tailwind CSS**, and **Firebase** (Google Sign-In & Cloud Firestore), powered by the **TMDB (The Movie Database) API** and hosted on **GitHub Pages**.

---

## 🌟 Key Features

1. **Google Sign-In Authentication**: Instant, secure client-side authentication via Firebase Auth Google Provider.
2. **First-Time User Onboarding**: New users are prompted to search and curate exactly 5 favorite movies or TV shows to calibrate their taste profile.
3. **Smart Discovery Feed**:
   - Filter between **"Movies"**, **"TV Shows"**, or **"Both"**.
   - Real-time search with instant debounced queries across the TMDB catalog.
   - Dual view modes: **Responsive Grid View** and **Single-Card Focus Mode**.
4. **Quick-Action 4-Way Reactions**:
   - React with **"Watched"**, **"Seems Good"**, **"Maybe"**, or **"Nah"**.
   - Each reaction updates Firestore subcollection `users/{uid}/reactions/{tmdbId}`.
   - Reacted items are immediately filtered out from the discovery feed in real-time.
5. **Activity & History Drawer**: Review all past reactions, sort by category, or remove a reaction to restore a title back to your discovery feed.
6. **Zero-Configuration Fallback / Demo Mode**: Built-in mock data and demo user profiles enable full local evaluation even before adding API keys.

---

## 🧱 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **Routing**: React Router DOM (HashRouter for foolproof GitHub Pages navigation)
- **Backend (Serverless)**: Firebase Authentication & Cloud Firestore
- **Media Data**: The Movie Database (TMDB) API v3 / v4
- **CI/CD & Hosting**: GitHub Pages with automated GitHub Actions workflow (`deploy.yml`)

---

## 📁 Project Structure

```
NextWatch/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated build & deploy to GitHub Pages
├── public/
│   ├── favicon.svg             # App vector icon
│   └── 404.html                # SPA redirect helper for GitHub Pages
├── src/
│   ├── api/
│   │   ├── mockData.ts         # High-fidelity sample media data fallback
│   │   └── tmdb.ts             # TMDB API client (trending, search, details, image helper)
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx # Route guard enforcing authentication & onboarding
│   │   ├── layout/
│   │   │   └── Navbar.tsx      # App header with branding, user info & reaction drawer
│   │   └── media/
│   │       ├── FilterBar.tsx   # Filter toggle ("Both", "Movies", "TV"), search & view mode
│   │       ├── MediaCard.tsx   # Media card with poster, rating, badges & overview
│   │       ├── ReactionButtons.tsx # Watched, Seems Good, Maybe, Nah buttons
│   │       └── ReactionDrawer.tsx  # Slide-over drawer with reaction history & removal
│   ├── context/
│   │   └── AuthContext.tsx     # Firebase Auth + Firestore user state & reactions provider
│   ├── pages/
│   │   ├── Login.tsx           # Landing page with Google Sign-In & feature overview
│   │   ├── Onboarding.tsx      # Step 1: Select exactly 5 favorite movies/shows
│   │   └── MainFeed.tsx        # Discovery feed with real-time filtering & reactions
│   ├── services/
│   │   ├── firebase.ts         # Firebase App, Auth & Firestore initialization
│   │   └── firestore.ts        # Database helpers for user profile and reactions subcollection
│   ├── types/
│   │   └── index.ts            # TypeScript definitions (MediaItem, UserProfile, UserReaction)
│   ├── App.tsx                 # Main application routes & providers
│   ├── index.css               # Tailwind CSS base styles & scrollbar customization
│   └── main.tsx                # React DOM root entry
├── .env.example                # Example environment variable template
├── firestore.rules             # Production Cloud Firestore security rules
├── package.json                # Dependencies and build scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration with Tailwind CSS & base path
```

---

## 🗄️ Firestore Database Schema

### 1. User Profile Document
`users/{uid}`:
```json
{
  "email": "user@example.com",
  "displayName": "Movie Explorer",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "onboardingCompleted": true,
  "top5": [157336, 27205, 1399, 66732, 1396],
  "updatedAt": "2026-10-23T18:00:00Z"
}
```

### 2. User Reaction Document
`users/{uid}/reactions/{tmdbId}`:
```json
{
  "mediaType": "movie",
  "reaction": "seems_good",
  "timestamp": "serverTimestamp()",
  "title": "Interstellar",
  "poster_path": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
}
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/PrinceDevWorks/NextWatch.git
cd NextWatch
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the variables:
```ini
# TMDB API Key (https://www.themoviedb.org/settings/api)
VITE_TMDB_API_KEY=your_tmdb_api_key

# Firebase Web App Config (https://console.firebase.google.com/)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Firestore Security Rules
Deploy the following rules in your [Firebase Console](https://console.firebase.google.com/) -> Firestore Database -> Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /reactions/{tmdbId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🌐 Deploying to GitHub Pages

1. In your GitHub repository, navigate to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add your repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_TMDB_API_KEY`
3. In **Settings** -> **Pages**, set **Source** to **GitHub Actions**.
4. Push to `main` branch. The included `.github/workflows/deploy.yml` workflow will automatically test, build, and deploy your site to `https://<username>.github.io/NextWatch/`.
