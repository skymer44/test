#!/bin/bash

# Script de résolution intelligente des conflits
# Garde les modifications GitHub pour les données, garde les modifications locales pour la documentation

echo "🔄 === RÉSOLUTION INTELLIGENTE DES CONFLITS ==="
echo "📅 $(date +'%Y-%m-%d %H:%M:%S')"

# 1. Créer une sauvegarde des fichiers de documentation locaux
echo "💾 Sauvegarde des fichiers de documentation..."
mkdir -p temp_docs_backup
cp -f *.md temp_docs_backup/ 2>/dev/null || true
cp -f scripts/sync-and-push-*.sh temp_docs_backup/ 2>/dev/null || true
cp -f scripts/test-env.sh temp_docs_backup/ 2>/dev/null || true

# 2. Reset vers l'état GitHub (garde les données à jour)
echo "🔄 Reset vers l'état GitHub (garde les données Notion à jour)..."
git reset --hard origin/main

# 3. Restaurer les fichiers de documentation
echo "📚 Restauration des fichiers de documentation..."
cp -f temp_docs_backup/*.md . 2>/dev/null || true
cp -f temp_docs_backup/sync-and-push-*.sh scripts/ 2>/dev/null || true
cp -f temp_docs_backup/test-env.sh scripts/ 2>/dev/null || true

# 4. Mettre à jour package.json avec les nouvelles commandes
echo "📦 Mise à jour du package.json..."

# Créer une version temporaire du package.json avec les nouvelles commandes
cat > package_temp.json << 'EOF'
{
  "name": "programme-musical-2026",
  "version": "1.0.0",
  "description": "Synchronisation Notion pour Programme Musical 2026",
  "main": "scripts/notion-sync.js",
  "scripts": {
    "sync": "node scripts/notion-sync.js",
    "guide": "node scripts/notion-guide.js",
    "test": "node scripts/test-notion.js",
    "test-env": "./scripts/test-env.sh",
    "test-sync": "node test-sync.js",
    "list-db": "node scripts/list-databases.js",
    "update-site": "node scripts/intelligent-update-site.js",
    "full-sync": "npm run sync && npm run update-site",
    "auto-sync": "./scripts/sync-and-push-ultra.sh",
    "auto-sync-fixed": "./scripts/sync-and-push-fixed.sh",
    "auto-sync-old": "./scripts/sync-and-push.sh",
    "start": "python3 -m http.server 8000"
  },
  "dependencies": {
    "@notionhq/client": "^4.0.0"
  },
  "keywords": [
    "notion",
    "music",
    "synchronization",
    "github-actions"
  ],
  "author": "Programme Musical 2026",
  "license": "MIT"
}
EOF

mv package_temp.json package.json

# 5. Rendre les scripts exécutables
echo "🔧 Configuration des permissions..."
chmod +x scripts/sync-and-push-*.sh 2>/dev/null || true
chmod +x scripts/test-env.sh 2>/dev/null || true

# 6. Nettoyer
rm -rf temp_docs_backup

echo "✅ Résolution terminée !"
echo ""
echo "📊 État final :"
echo "✅ Données Notion : mises à jour depuis GitHub"
echo "✅ Documentation : conservée depuis local"
echo "✅ Scripts : nouveaux scripts ultra-robustes ajoutés"
echo "✅ Package.json : mis à jour avec nouvelles commandes"
echo ""
echo "🚀 Vous pouvez maintenant :"
echo "   git add ."
echo "   git commit -m '📚 Ajout documentation et scripts ultra-robustes'"
echo "   git push origin main"
echo ""
