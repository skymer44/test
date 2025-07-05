#!/bin/bash

# Script de synchronisation et push automatique
# Résout automatiquement les conflits Git récurrents

echo "🚀 === SYNCHRONISATION ET PUSH AUTOMATIQUE ==="
echo "📅 $(date +'%Y-%m-%d %H:%M:%S')"

# 1. Synchroniser depuis Notion
echo "🔄 Étape 1/5: Synchronisation Notion..."
npm run full-sync
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la synchronisation Notion"
    exit 1
fi

# 2. Configurer Git pour éviter les problèmes de pull
echo "🔧 Étape 2/5: Configuration Git..."
git config pull.rebase false
git config user.email "action@github.com" 2>/dev/null || git config user.email "user@local.dev"
git config user.name "Auto Sync Script" 2>/dev/null || git config user.name "Local User"

# 3. Ajouter tous les changements
echo "📝 Étape 3/5: Ajout des changements..."
git add .

# 4. Vérifier s'il y a des changements à commiter
if [ -n "$(git status --porcelain)" ]; then
    echo "✅ Changements détectés, commit en cours..."
    
    # Créer un commit avec timestamp
    TIMESTAMP=$(date +'%Y-%m-%d à %H:%M:%S')
    git commit -m "🔄 Sync automatique local - $TIMESTAMP

✨ Mise à jour depuis Notion:
- Données synchronisées
- Site web régénéré
- Organisation intelligente appliquée"

    # 5. Push avec gestion automatique des conflits
    echo "🌐 Étape 4/5: Push vers GitHub avec résolution automatique des conflits..."
    
    # Première tentative de push
    if git push; then
        echo "✅ Push réussi du premier coup!"
    else
        echo "⚠️ Conflit détecté, résolution automatique..."
        
        # Pull avec merge automatique
        git pull --strategy=ours || {
            echo "🔧 Résolution manuelle des conflits..."
            
            # En cas de conflits, garder nos versions (plus récentes)
            git status --porcelain | grep "^UU" | cut -c4- | while read file; do
                echo "📄 Résolution conflit: $file"
                git checkout --ours "$file"
                git add "$file"
            done
            
            # Finaliser le merge
            git commit -m "🔀 Résolution automatique conflits - $TIMESTAMP" || true
        }
        
        # Nouveau push après résolution
        if git push; then
            echo "✅ Push réussi après résolution des conflits!"
        else
            echo "❌ Échec du push même après résolution"
            exit 1
        fi
    fi
    
    echo "📊 Étape 5/5: Vérification finale..."
    git status
    echo "🎉 Synchronisation et push terminés avec succès!"
    
else
    echo "ℹ️ Aucun changement à commiter"
fi

echo "🌐 Site disponible à: https://skymer44.github.io/test"
echo "==============================================="
