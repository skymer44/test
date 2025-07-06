#!/bin/bash

# Script de synchronisation et push automatique - VERSION CORRIGÉE
# Résout automatiquement les conflits Git récurrents

set -e  # Arrêter le script en cas d'erreur

echo "🚀 === SYNCHRONISATION ET PUSH AUTOMATIQUE CORRIGÉE ==="
echo "📅 $(date +'%Y-%m-%d %H:%M:%S')"

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

# 2. Configurer Git
echo "🔧 Étape 3/4: Configuration Git..."
git config pull.rebase false 2>/dev/null || true
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

# 4. Commit
TIMESTAMP=$(date +'%Y-%m-%d à %H:%M:%S')
git commit -m "🔄 Sync automatique local - $TIMESTAMP

✨ Mise à jour depuis Notion:
- Données synchronisées
- Site web régénéré
- Organisation intelligente appliquée"

# 5. Push avec gestion simple des conflits
echo "🌐 Étape 4/4: Push vers GitHub..."

# Tentative de push direct
if git push origin main; then
    echo "✅ Push réussi !"
else
    echo "⚠️ Conflit détecté, résolution automatique..."
    
    # Pull avec stratégie pour accepter nos changements en cas de conflit
    git pull origin main --strategy-option=ours || {
        echo "🔧 Résolution manuelle des conflits..."
        # Accepter tous nos changements
        git checkout --ours .
        git add .
        git commit -m "🔀 Résolution automatique conflits - $TIMESTAMP" || true
    }
    
    # Nouveau push
    if git push origin main; then
        echo "✅ Push réussi après résolution des conflits !"
    else
        echo "❌ Échec du push même après résolution"
        exit 1
    fi
fi

echo "📊 Vérification finale..."
git status --porcelain | head -5
echo "🎉 Synchronisation et push terminés avec succès !"
echo "🌐 Site disponible à: https://skymer44.github.io/test"
echo "==============================================="
