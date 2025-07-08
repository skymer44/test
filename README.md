# 🎵 Programme Musical 2026 - Site Web

Site web de programme musical avec synchronisation automatique Notion. 🎼

## 🚀 Utilisation rapide

### Mise à jour manuelle
```bash
npm run sync    # Synchroniser depuis Notion
npm start       # Serveur local (port 8000)
```

### Mise à jour via GitHub
1. Aller sur `github.com/skymer44/test`
2. Actions → "🎵 Notion Sync pour Netlify" → Run workflow

### Mise à jour automatique
- **6h30** et **22h30** chaque jour (automatique)

## 🏗️ Architecture

**Voir le fichier `ARCHITECTURE.md` pour la documentation technique complète.**

- HTML statique + JSON dynamiques
- Synchronisation Notion automatique
- Génération côté client
- Déploiement Netlify automatique

## 🌐 URLs
- **Production** : https://fichemusicien.site
- **Local** : http://localhost:8000

---

📖 **Documentation technique détaillée** → `ARCHITECTURE.md`
1. Aller sur `github.com/skymer44/test`
2. Onglet "Actions" → "🎵 Notion Sync pour Netlify"
3. "Run workflow" → "Run workflow"

**Via terminal local :**
```bash
npm run sync
```

### 🏗️ Architecture
- **HTML statique** : Structure fixe, jamais modifiée automatiquement
- **Données JSON** : Synchronisées depuis Notion vers `data/`
- **Génération dynamique** : `programme-loader.js` génère le contenu côté client
- **Déploiement** : Netlify automatique depuis GitHub

### 🌐 URLs
- **Production** : https://fichemusicien.site (Netlify)
- **Local** : http://localhost:8000 (`npm start`)

### 📊 Bases Notion synchronisées
- Concert du 11 d'avril avec Eric Aubier
- Programme fête de la musique
- Ma région virtuose
- Pièces qui n'ont pas trouvé leur concert
- + 9 autres bases configurées

## �️ Développement

### Commandes principales
```bash
npm install     # Installation des dépendances
npm start       # Serveur local (port 8000)
npm run sync    # Synchronisation manuelle Notion
```

### Structure des fichiers
```
├── index.html              # Page principale (structure statique)
├── styles.css              # Styles CSS
├── script.js               # Fonctionnalités principales
├── scripts/
│   ├── programme-loader.js # Chargeur dynamique Notion
│   └── notion-sync.js      # Synchronisation Notion
└── data/                   # Données JSON (auto-générées)
    ├── pieces.json
    ├── events.json
    └── concerts.json
```

## 🎯 Workflow optimisé

### ✅ Problèmes résolus
- ❌ Workflow GitHub Pages supprimé (cause des échecs constants)
- ✅ Déclencheurs optimisés (plus de boucles infinies)
- ✅ Architecture HTML statique + JSON dynamique stable

### � Synchronisation
- **Automatique** : 2x/jour via cron
- **Manuelle** : GitHub Actions ou `npm run sync`
- **Déclenchement sur code** : Uniquement si scripts Notion modifiés

---

**✅ Architecture optimisée pour éviter les conflits Git**  
**🔄 Synchronisation Notion stable et automatique**  
**🚀 Déploiement continu Netlify**