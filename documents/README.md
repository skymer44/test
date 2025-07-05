# Système de Gestion des Documents - Programme Musical 2026

## 🎯 Vue d'ensemble

Ce système permet de gérer automatiquement les mises à jour du programme musical en comparant les documents PDF successifs et en appliquant automatiquement les changements au site web.

## 🚀 Fonctionnalités principales

### 1. **Stockage automatique des versions**
- Sauvegarde automatique de l'ancien document lors du chargement d'un nouveau
- Historique des versions avec métadonnées (date, fichier, etc.)
- Système de versioning automatique

### 2. **Comparaison intelligente**
- Détection automatique des changements entre versions
- Identification des programmes ajoutés, supprimés ou modifiés
- Analyse des modifications de liens, durées, compositeurs, etc.

### 3. **Application automatique des changements**
- Mise à jour automatique du site web
- Préservation de la structure et du design existant
- Application sélective des changements

### 4. **Interface intuitive**
- Glisser-déposer pour charger les documents
- Visualisation claire des changements
- Contrôles pour appliquer ou annuler les modifications

## 📁 Structure des fichiers

```
documents/
├── index.html              # Interface principale du gestionnaire
├── document-manager.js     # Logique de gestion des documents
├── pdf-extractor.js        # Extraction des données PDF
└── README.md              # Cette documentation
```

## 🔧 Utilisation

### Première utilisation
1. Accédez au gestionnaire via le bouton "⚙️ Admin" sur le site principal
2. Chargez votre document PDF de référence (l'ancien)
3. Le système le stocke comme version de base

### Mise à jour avec un nouveau document
1. Glissez-déposez ou sélectionnez le nouveau document PDF
2. Le système extrait automatiquement les données
3. Une comparaison est effectuée avec la version précédente
4. Les changements sont affichés avec détails
5. Cliquez sur "Appliquer les changements" pour mettre à jour le site

### Types de changements détectés
- ✅ **Programmes ajoutés** : Nouvelles pièces musicales
- ❌ **Programmes supprimés** : Pièces retirées du programme
- 🔄 **Programmes modifiés** : Changements de compositeur, durée, informations, liens

## 📊 Format des données extraites

Le système extrait et structure les informations selon ce format :

```javascript
{
  programmes: [
    {
      id: "piece-title-slug",
      title: "Nom de la pièce",
      section: "ma-region-virtuose",
      compositeur: "Nom du compositeur",
      duree: "03:45",
      info: "Informations sur la pièce",
      links: [
        {
          type: "audio",
          url: "https://youtube.com/...",
          label: "🎵 Audio"
        }
      ]
    }
  ],
  financement: {
    dispositifs: [...],
    totalEstime: 15000,
    derniereMAJ: "2025-07-05T10:00:00Z"
  }
}
```

## 🎨 Sections supportées

Le système reconnaît automatiquement ces sections :
- **Ma région virtuose** (`ma-region-virtuose`)
- **Concert Eric Aubier** (`concert-eric-aubier`)
- **Fête de la musique** (`fete-musique`)
- **Autres pièces** (`autres-pieces`)

## 🔗 Types de liens reconnus

- **🎵 Audio** : Liens YouTube pour l'écoute
- **📝 Détails** : Liens Notion pour les détails
- **🛒 Achat** : Liens vers les partitions (LaFluteDePan, SheetMusicDirect, etc.)
- **🎬 Original** : Versions originales des œuvres

## 💾 Stockage des données

Les données sont stockées localement dans le navigateur (`localStorage`) :
- **Version courante** : Dernier document chargé
- **Version précédente** : Document de référence pour la comparaison
- **Métadonnées** : Dates, noms de fichiers, numéros de version

## 🔄 Workflow type

1. **Réception du nouveau PDF** → Upload dans le gestionnaire
2. **Extraction automatique** → Analyse du contenu du PDF
3. **Comparaison intelligente** → Détection des différences
4. **Validation manuelle** → Vérification des changements
5. **Application automatique** → Mise à jour du site web
6. **Archivage** → Sauvegarde pour future comparaison

## 🛡️ Sauvegarde et récupération

### Export de l'historique
```javascript
// Export automatique en JSON
{
  "current": { /* document actuel */ },
  "previous": { /* document précédent */ },
  "exportDate": "2025-07-05T10:00:00Z"
}
```

### Import d'historique
Possibilité de restaurer un historique depuis un fichier JSON exporté.

## 🚨 Gestion d'erreurs

Le système gère :
- **Fichiers corrompus** : Validation du format PDF
- **Extraction échouée** : Fallback sur extraction manuelle
- **Changements invalides** : Validation avant application
- **Erreurs réseau** : Retry automatique

## 🎯 Avantages

1. **Gain de temps** : Plus besoin de mise à jour manuelle
2. **Réduction d'erreurs** : Comparaison automatique précise
3. **Traçabilité** : Historique complet des changements
4. **Flexibilité** : Possibilité d'annuler ou modifier les changements
5. **Cohérence** : Maintien de la structure du site

## 📈 Extensions futures possibles

- **API Integration** : Connexion directe avec Notion
- **Notifications** : Alertes automatiques de changements
- **Validation collaborative** : Système d'approbation
- **Analytics** : Statistiques sur les modifications
- **Backup cloud** : Sauvegarde automatique en ligne

## 🎵 Spécificités du domaine musical

Le système comprend les particularités des programmes musicaux :
- **Durées** : Format MM:SS ou HH:MM:SS
- **Compositeurs** : Noms avec arrangements (arr.)
- **Sections de concert** : Types de programmation
- **Liens spécialisés** : Partitions, audio, détails

---

*Ce système a été conçu spécifiquement pour faciliter la gestion du Programme Musical 2026 tout en conservant la flexibilité pour d'autres utilisations.*
