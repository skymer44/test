# 🏗️ ARCHITECTURE DU SITE - Programme Musical 2026 📚

## 📋 Vue d'ensemble

Ce site utilise une **architecture à séparation nette** entre structure et données :
- **HTML statique** : Structure fixe, jamais modifiée automatiquement
- **Données JSON** : Contenu dynamique synchronisé depuis Notion
- **Génération côté client** : JavaScript assemble HTML + JSON en temps réel

## 🔄 Flux de données

```
Notion (bases de données)
    ↓ (GitHub Actions - 2x/jour ou manuel)
scripts/notion-sync.js 
    ↓ (génère JSON)
data/*.json
    ↓ (chargement côté client)
scripts/programme-loader.js
    ↓ (injection HTML)
Site web final
```

## 📁 Structure des fichiers

### **Fichiers principaux (JAMAIS modifiés automatiquement)**
```
index.html              # Structure HTML statique avec conteneurs vides
styles.css              # Styles CSS
script.js               # Fonctionnalités générales (onglets, modal, etc.)
```

### **Scripts de génération dynamique**
```
scripts/
├── programme-loader.js # Génère le HTML des sections depuis JSON
├── notion-sync.js      # Synchronise Notion → JSON
└── smart-mapper.js     # Mapping automatique des propriétés Notion
```

### **Données dynamiques (modifiées automatiquement)**
```
data/
├── pieces.json         # Pièces musicales depuis Notion
├── events.json         # Événements/répétitions depuis Notion
└── concerts.json       # Concerts depuis Notion
```

### **Configuration déploiement**
```
.github/workflows/
└── notion-sync-v2.yml  # Workflow GitHub Actions

netlify.toml            # Configuration Netlify
package.json            # Dépendances Node.js
```

## 🎯 Comment fonctionne la synchronisation

### **1. Collecte des données Notion**
- `scripts/notion-sync.js` se connecte à l'API Notion
- Récupère toutes les bases de données configurées
- Convertit les propriétés Notion en format standard
- Sauvegarde en JSON dans `data/`

### **2. Génération côté client**
- `scripts/programme-loader.js` s'exécute dans le navigateur
- Charge les fichiers JSON via fetch()
- Génère automatiquement les sections HTML
- Injecte le contenu dans les conteneurs vides d'`index.html`

### **3. Mapping automatique des noms**
- Les noms des bases Notion deviennent automatiquement les titres de sections
- Les slugs sont générés automatiquement : "Concert du 11 d'avril" → "concert-du-11-davril"
- Pas de configuration manuelle nécessaire pour ajouter de nouvelles bases

## ⚡ Déclencheurs de synchronisation

### **Automatique**
- **Programmé** : 6h30 et 22h30 (heure française) - cron `30 6,22 * * *`
- **Sur modification code** : Si `scripts/notion-sync.js` ou `scripts/smart-mapper.js` changent

### **Manuel**
- **GitHub Interface** : Actions → Run workflow
- **Terminal local** : `npm run sync`

## 🔧 Fonctionnement technique détaillé

### **index.html - Structure statique**
```html
<div id="programmes-content">
    <!-- Le contenu sera injecté ici par programme-loader.js -->
</div>
```

### **programme-loader.js - Génération dynamique**
```javascript
// 1. Charge les données JSON
const data = await fetch('data/pieces.json');

// 2. Organise par sections (bases Notion)
const sections = this.organizePiecesBySection(data.pieces);

// 3. Génère le HTML pour chaque section
const html = this.generateSectionsHTML(sections);

// 4. Injecte dans le DOM
document.getElementById('programmes-content').innerHTML = html;
```

### **Mapping automatique des propriétés**
```
Notion → JSON
─────────────
"Pièce" → "title"
"Compositeur / Arrangeur" → "composer" 
"Durée" → "duration"
"Info sup'" → "info"
"Lien de l'arrangement audio" → "links.audio"
"Lien de l'oeuvre originale" → "links.original"
"Lien achat" → "links.purchase"
```

## 🛡️ Gestion des conflits et erreurs

### **Prévention des conflits Git**
- ✅ **HTML/CSS/JS** : Modifiés uniquement par le développeur
- ✅ **JSON** : Modifiés uniquement par GitHub Actions
- ✅ **Séparation nette** : Aucune intersection possible

### **Gestion des doublons**
```javascript
// Détection basée sur titre + compositeur
const pieceKey = `${piece.title?.toLowerCase()?.trim()}-${piece.composer?.toLowerCase()?.trim() || ''}`;
if (seenPieces.has(pieceKey)) {
    console.warn(`Doublon ignoré: "${piece.title}"`);
    return; // Skip
}
```

### **Cache et mise à jour**
```javascript
// Cache bust automatique
const cacheBuster = `?t=${Date.now()}`;
const response = await fetch(url + cacheBuster);

// Vérification périodique des mises à jour (5 min)
setInterval(() => this.checkForUpdates(), 5 * 60 * 1000);
```

## 🌐 Déploiement

### **Netlify (Production)**
- **URL** : https://fichemusicien.site
- **Déclenchement** : Automatique à chaque push GitHub
- **Délai** : ~2-3 minutes après synchronisation Notion

### **GitHub Actions**
- **Workflow** : `.github/workflows/notion-sync-v2.yml`
- **Action** : Synchronise JSON uniquement, pas d'HTML
- **Commit** : Automatique avec message horodaté

## 🎵 Structure des données JSON

### **pieces.json**
```json
{
  "pieces": [{
    "title": "Nom de la pièce",
    "composer": "Compositeur/Arrangeur", 
    "duration": "MM:SS",
    "info": "Informations supplémentaires",
    "links": {
      "audio": "URL YouTube arrangement",
      "original": "URL YouTube original", 
      "purchase": "URL achat partition"
    },
    "source": {
      "notion": true,
      "database": "Nom de la base Notion",
      "pageId": "ID unique Notion",
      "lastModified": "2025-07-08T12:00:00Z",
      "order": 1
    }
  }],
  "metadata": {
    "syncDate": "2025-07-08T12:00:00Z",
    "totalPieces": 42
  }
}
```

## 🔍 Points d'attention pour développeurs

### **NE PAS modifier**
- Fichiers dans `data/` (écrasés par la synchronisation)
- Structure des conteneurs dans `index.html` (IDs utilisés par programme-loader.js)
- Configuration Notion dans `notion-sync.js` (bases configurées)

### **Modifier librement**
- Styles CSS dans `styles.css`
- Fonctionnalités générales dans `script.js` 
- Template HTML dans `programme-loader.js`
- Layout dans `index.html` (hors conteneurs de contenu)

### **Pour ajouter une nouvelle base Notion**
1. Créer la base dans Notion
2. La partager avec l'intégration "Programme 2026 integration"
3. Aucune configuration code nécessaire (détection automatique)

### **Pour déboguer**
- Console navigateur : Logs détaillés de `programme-loader.js`
- GitHub Actions : Logs de synchronisation
- Terminal local : `npm run sync` pour test

---

**🎯 Cette architecture garantit une séparation claire, évite les conflits Git et permet une évolutivité maximale avec un minimum de configuration.**

<!-- Version de test: 2025-07-08 -->
