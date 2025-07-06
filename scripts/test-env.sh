#!/bin/bash

# Script de test pour vérifier que la synchronisation fonctionne
echo "🧪 === TEST DE LA SYNCHRONISATION ==="
echo "📅 $(date +'%Y-%m-%d %H:%M:%S')"

echo "🔍 Vérification de l'environnement..."

# Vérifier que Node.js fonctionne
if node --version > /dev/null 2>&1; then
    echo "✅ Node.js : $(node --version)"
else
    echo "❌ Node.js non disponible"
    exit 1
fi

# Vérifier que Git fonctionne
if git --version > /dev/null 2>&1; then
    echo "✅ Git : $(git --version)"
else
    echo "❌ Git non disponible"
    exit 1
fi

# Vérifier les fichiers de données
if [ -f "data/pieces.json" ]; then
    PIECES=$(cat data/pieces.json | grep -o '"title"' | wc -l)
    echo "✅ Données actuelles : $PIECES pièces"
else
    echo "⚠️ Aucun fichier de données trouvé"
fi

# Vérifier la configuration Git
EDITOR=$(git config core.editor)
if [ "$EDITOR" = "true" ]; then
    echo "✅ Configuration Git anti-blocage : activée"
else
    echo "⚠️ Configuration Git : $EDITOR (recommandé: true)"
fi

echo ""
echo "🎯 Prêt pour la synchronisation avec :"
echo "   npm run auto-sync"
echo ""
echo "🌐 Site local disponible avec :"
echo "   npm start"
echo "   → http://localhost:8000"
echo ""
echo "==============================================="
