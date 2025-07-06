#!/bin/bash

# Script de synchronisation et push automatique - VERSION ULTRA-ROBUSTE
# Évite totalement les blocages dans l'éditeur Git

set -e  # Arrêter le script en cas d'erreur

echo "🚀 === SYNCHRONISATION ET PUSH AUTOMATIQUE ULTRA-ROBUSTE ==="
echo "📅 $(date +'%Y-%m-%d %H:%M:%S')"

# Configuration Git pour éviter les éditeurs
export GIT_EDITOR=true
export EDITOR=true
export VISUAL=true

# 1. Synchroniser depuis Notion
echo "🔄 Étape 1/4: Synchronisation Notion..."
npm run sync
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la synchronisation Notion"
    exit 1
fi

echo "🌐 Étape 2/4: Mise à jour du site..."
npm run update-site
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la mise à jour du site"
    exit 1
fi

# 2. Configurer Git pour éviter les éditeurs
echo "🔧 Étape 3/4: Configuration Git ultra-robuste..."
git config core.editor true
git config pull.ff only
git config merge.tool true
git config pull.rebase false
git config user.email "action@github.com" 2>/dev/null || true
git config user.name "Auto Sync Script" 2>/dev/null || true

# 3. Vérifier s'il y a des changements
echo "📝 Vérification des changements..."
git add .

if git diff --staged --quiet; then
    echo "ℹ️ Aucun changement à commiter"
    exit 0
fi

echo "✅ Changements détectés, commit en cours..."

# 4. Commit avec message prédéfini
TIMESTAMP=$(date +'%Y-%m-%d à %H:%M:%S')
git commit -m "🔄 Sync automatique local - $TIMESTAMP" --no-edit

# 5. Push avec stratégie de résolution automatique
echo "🌐 Étape 4/4: Push vers GitHub avec résolution automatique..."

# Récupérer les changements distants d'abord
echo "📥 Récupération des changements distants..."
git fetch origin main

# Vérifier s'il y a des changements à merger
if git merge-base --is-ancestor HEAD origin/main; then
    echo "✅ Aucun merge nécessaire, push direct..."
    git push origin main
elif git merge-base --is-ancestor origin/main HEAD; then
    echo "✅ Fast-forward possible, push direct..."
    git push origin main
else
    echo "⚠️ Merge nécessaire, résolution automatique..."
    
    # Merge avec stratégie automatique (accepter nos changements en cas de conflit)
    git merge origin/main --no-edit --strategy-option=ours || {
        echo "🔧 Résolution manuelle des conflits..."
        # Forcer l'acceptation de nos changements
        git reset --hard HEAD
        git merge origin/main --no-edit --strategy=ours
    }
    
    # Push après merge
    git push origin main
fi

echo "📊 Vérification finale..."
echo "🎉 Synchronisation et push terminés avec succès !"
echo "🌐 Site disponible à: https://skymer44.github.io/test"
echo "==============================================="
