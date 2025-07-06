# 🔧 Guide de Dépannage - Programme Musical 2026

## ✅ PROBLÈME RÉSOLU - Blocage dans l'éditeur Git

### 🚨 Cause identifiée :
Le script se bloquait dans l'éditeur Git (vim) lors des merges, attendant un message de commit.

### 🛠️ Solutions appliquées :

#### 1. **Configuration Git permanente**
```bash
git config --global core.editor "true"
git config pull.ff only
```

#### 2. **Nouveau script ultra-robuste**
```bash
npm run auto-sync
```
*Utilise maintenant `sync-and-push-ultra.sh` qui évite tous les éditeurs*

### 🚨 Si vous êtes actuellement bloqué :

Dans le terminal avec les tildes (~) et "MERGE_MSG" :
1. **Appuyez sur `Esc`**
2. **Tapez `:wq`** puis **Entrée**
3. **Ou `Ctrl+C`** pour forcer l'arrêt

### 🔧 Nettoyage après blocage :
```bash
cd /Users/remilecomte/Downloads/test
git merge --abort
git status
```

#### 2. **Exécuter les étapes manuellement**
Si le problème persiste, vous pouvez exécuter chaque étape séparément :

```bash
# Étape 1: Synchroniser depuis Notion
npm run sync

# Étape 2: Mettre à jour le site web
npm run update-site

# Étape 3: Commit et push manuels
git add .
git commit -m "🔄 Sync manuel - $(date)"
git push origin main
```

#### 3. **Vérifier l'état du système**
```bash
# Vérifier les processus en cours
ps aux | grep node

# Arrêter tous les processus Node.js si nécessaire
killall node

# Vérifier l'état Git
git status
```

### 🚨 En cas de blocage total

#### Arrêter un script qui boucle :
```bash
# Dans le terminal, appuyez sur Ctrl+C
# Ou dans un autre terminal :
killall node
```

#### Nettoyer l'état Git :
```bash
# Annuler les changements non commitées
git reset --hard HEAD

# Remettre à jour depuis le remote
git pull origin main
```

### 📊 Commandes de diagnostic

#### Vérifier les fichiers de données :
```bash
# Voir le contenu des données Notion
cat data/pieces.json | jq '.pieces | length'

# Voir les sauvegardes récentes
ls -la data/backup-*.json | tail -5
```

#### Tester la synchronisation seule :
```bash
# Seulement la sync Notion (sans mise à jour du site)
npm run sync

# Seulement la mise à jour du site (sans sync)
npm run update-site
```

### 🔍 Causes courantes du problème

1. **Script shell en boucle** : L'ancien `sync-and-push.sh` avait une logique défaillante
2. **Processus Node.js zombie** : Un processus précédent bloqué
3. **Conflit Git non résolu** : Le script reste bloqué sur un conflit
4. **API Notion timeout** : Une requête à l'API Notion qui ne répond pas

### ✅ Nouvelle architecture (sans boucle)

La commande `npm run auto-sync` utilise maintenant :
- ✅ `set -e` pour arrêter en cas d'erreur
- ✅ Vérification simple des changements avec `git diff --staged --quiet`
- ✅ Stratégie de résolution de conflit claire avec `--strategy-option=ours`
- ✅ Exit explicite quand aucun changement n'est détecté

### 📞 Support

Si le problème persiste, vérifiez :
1. Que vous utilisez bien `npm run auto-sync` (et non `auto-sync-old`)
2. Qu'aucun processus Node.js ne tourne en arrière-plan
3. Que votre connexion internet est stable pour l'API Notion

---
*Guide créé le $(date) - Version corrigée*
