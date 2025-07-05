# 🔐 Configuration des Secrets GitHub

Pour que la synchronisation automatique fonctionne sur GitHub, vous devez ajouter votre clé Notion dans les secrets.

## 📋 Instructions

1. **Allez sur votre repository GitHub** : `https://github.com/skymer44/test`

2. **Cliquez sur "Settings"** (en haut à droite)

3. **Dans le menu de gauche, cliquez sur "Secrets and variables" > "Actions"**

4. **Cliquez sur "New repository secret"**

5. **Créez le secret** :
   - **Name** : `NOTION_TOKEN`
   - **Value** : `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`

6. **Cliquez sur "Add secret"**

## ✅ Test de la synchronisation

Une fois le secret ajouté :

1. **Allez dans l'onglet "Actions"** de votre repository
2. **Cliquez sur "🎵 Notion Sync - Programme Musical 2026"**
3. **Cliquez sur "Run workflow"** pour tester

## 🔄 Fréquence de synchronisation

Le système est configuré pour synchroniser :
- **Toutes les 30 minutes** (synchronisation rapide)
- **Tous les jours à 8h et 18h** (synchronisation complète)
- **Manuellement** quand vous le souhaitez

## 🚨 Important

- Gardez votre clé Notion secrète
- Ne la partagez jamais publiquement
- Si vous pensez qu'elle a été compromise, générez-en une nouvelle dans Notion

## 🎯 Statut actuel

✅ **Synchronisation locale fonctionnelle**
✅ **8 bases de données connectées**
✅ **16 pièces synchronisées**
✅ **Site web mis à jour automatiquement**

🔄 **À faire** : Ajouter le secret GitHub pour l'automatisation complète
