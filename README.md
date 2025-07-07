# 🎵 Programme Musical 2026 - Synchronisation Notion

Système de synchronisation automatique entre vos bases de données Notion et votre site web de programme musical.

## ✅ État de la configuration

Votre intégration Notion est **parfaitement opérationnelle** !

- **18 bases de données** détectées et analysées
- **20 concerts** synchronisés depuis Notion
- **16 pièces musicales** récupérées automatiquement
- **100% de réussite** aux tests de configuration

## 🗃️ Bases de données connectées

### ✅ Parfaitement configurées (100% confiance)
- **Programme fête de la musique** (2 pièces)
- **Concert du 11 d'avril avec Eric Aubier** (6 pièces)
- **Ma région virtuose** (6 pièces)
- **Pièces qui n'ont pas trouvé leur concert** (2 pièces)
- Et 14 autres bases avec mapping automatique

### 🔗 Mapping automatique détecté
- `Pièce` → `title`
- `Compositeur / Arrangeur` → `composer`
- `Durée` → `duration`
- `Info sup'` → `info`
- `Lien de l'arrangement audio` → `links.audio`
- `Lien de l'oeuvre originale` → `links.original`
- `Lien achat` → `links.purchase`

## 🚀 Utilisation

### 1. Déploiement automatique (RECOMMANDÉ)
```bash
# 🚀 COMMANDE UNIQUE - TOUT AUTOMATIQUE
npm run deploy
```
**Cette commande fait TOUT :**
- ✅ Synchronise les données Notion
- ✅ Commit automatique des changements
- ✅ Push vers GitHub
- ✅ Déploiement en production
- ✅ Vérification complète

### 2. Synchronisation manuelle (pour tests)
```bash
# Synchroniser seulement les données depuis Notion
npm run sync
```

### 2. Tests et diagnostics
```bash
# Démarrer le serveur local
npm run start

# Tester la synchronisation seulement
npm run sync
```

### 3. Synchronisation automatique (GitHub Actions)

Votre workflow GitHub Actions est configuré pour :
- **Synchronisation automatique** : tous les jours à 8h et 18h
- **Déclenchement manuel** : depuis l'onglet Actions de votre repository
- **Sauvegarde automatique** : avant chaque synchronisation

## 📁 Structure des fichiers

```
📦 test/
├── 📁 .github/workflows/
│   └── 📄 notion-sync.yml          # Workflow automatique
├── 📁 scripts/
│   ├── 📄 notion-sync.js           # Synchronisation principale
│   ├── 📄 smart-mapper.js          # Mapping intelligent
│   ├── 📄 notion-guide.js          # Guide d'analyse
│   ├── 📄 test-notion.js           # Tests de configuration
│   └── 📄 update-site.js           # Mise à jour du site
├── 📁 data/
│   ├── 📄 concerts.json            # Concerts synchronisés
│   ├── 📄 pieces.json              # Pièces musicales
│   └── 📁 backups/                 # Sauvegardes
├── 📄 index.html                   # Votre site web
└── 📄 package.json                 # Configuration npm
```

## 🔧 Configuration

### Token Notion
Votre token d'intégration : `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`

### Variables d'environnement
Pour GitHub Actions, ajoutez dans les secrets de votre repository :
```
NOTION_TOKEN=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
```

### Partage des bases
Vos bases sont déjà partagées avec l'intégration "Programme 2026 integration".

## 📊 Données synchronisées

### Concerts récupérés
- Aimer from the Musical: Roméo et Juliette (2:50)
- Big Spender (2:24)
- You'll be back (3:20)
- Skyfall (3:30)
- Et 16 autres concerts...

### Pièces synchronisées
- Libertango (Astor Piazzola)
- The Mandalorian (Ludwig Göransson)
- Danse Bacchanale Samson et Dalila (Camille Saint-Saëns)
- Et toutes vos autres pièces...

## 🛠️ Fonctionnalités avancées

### Mapping intelligent
Le système détecte automatiquement :
- Le type de base de données (concerts, pièces, financement)
- Les correspondances entre vos propriétés et la structure du site
- Les nouvelles données à synchroniser

### Sauvegardes automatiques
- Sauvegarde du site avant chaque mise à jour
- Sauvegarde des données Notion
- Historique complet des modifications

### Gestion des erreurs
- Validation des données avant synchronisation
- Messages d'erreur détaillés
- Système de rollback en cas de problème

## 📈 Monitoring

### Logs de synchronisation
```bash
🎵 === SYNCHRONISATION NOTION → SITE WEB ===
📅 05/07/2025 18:02:09
🎯 Type: full
✅ 18 base(s) de données trouvée(s)
🎭 Concerts synchronisés: 20
🎵 Pièces synchronisées: 16
✅ Synchronisation terminée avec succès !
```

### Rapports de test
```bash
🎯 Résultat: 4/4 tests réussis (100%)
✅ Connexion Notion: Opérationnelle
📊 Bases de données: 18 trouvée(s)
🚀 Configuration prête !
```

## 🆘 Dépannage

### Problèmes courants

1. **"Aucune base de données trouvée"**
   - Vérifiez que vos bases sont partagées avec l'intégration
   - Utilisez `npm run guide` pour les instructions

2. **"Token Notion invalide"**
   - Vérifiez la variable d'environnement `NOTION_TOKEN`
   - Régénérez le token si nécessaire

3. **"Aucune donnée synchronisée"**
   - Vérifiez que vos bases contiennent des données
   - Utilisez `npm run test` pour diagnostiquer

### Support
- 📖 Documentation : [Notion API](https://developers.notion.com/)
- 🔧 Tests : `npm run test`
- 📋 Analyse : `npm run guide`

## 🎯 Prochaines étapes

1. **Automatisation complète** : Votre workflow GitHub Actions est prêt
2. **Personnalisation** : Ajustez les mappings dans `scripts/smart-mapper.js`
3. **Extension** : Ajoutez de nouvelles bases de données en les partageant avec l'intégration

---

**🎉 Félicitations ! Votre système de synchronisation Notion est opérationnel et prêt pour une utilisation en production.**
npm run sync 