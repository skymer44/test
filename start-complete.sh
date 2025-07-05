#!/bin/bash

# Script de démarrage complet - Programme Musical 2026
# Ce script démarre le serveur proxy ET le serveur web

echo "🚀 ==============================================="
echo "🎵 Démarrage Programme Musical 2026"
echo "🚀 ==============================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "📥 Installez Node.js depuis: https://nodejs.org/"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo "🚀 Démarrage du serveur proxy (port 3001)..."
echo "🌐 Le site sera accessible sur: http://localhost:3001"
echo ""
echo "💡 Pour arrêter: Ctrl+C"
echo "🚀 ==============================================="

# Démarrer le serveur proxy qui sert aussi le site web
npm start
