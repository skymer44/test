# 🎵 Programme Musical 2026 - Site Web

## 📅 Synchronisation automatique Notion

### ⏰ Mise à jour automatique
- **2 fois par jour** : 6h30 et 22h30 (heure française)
- **Déclenchement manuel** : Interface GitHub Actions

### 🔧 Mise à jour manuelle

**Via GitHub :**
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