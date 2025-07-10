#!/bin/bash

# Script pour générer les icônes PWA à partir du logo SVG

# Vérifier si rsvg-convert est installé
if ! command -v rsvg-convert &> /dev/null; then
    echo "rsvg-convert n'est pas installé. Installation via Homebrew..."
    brew install librsvg
fi

# Créer le dossier icons s'il n'existe pas
mkdir -p icons

# Générer les différentes tailles d'icônes
echo "Génération des icônes PWA..."

# Icône 192x192 (requis pour PWA)
rsvg-convert -w 192 -h 192 logo.svg > icons/icon-192x192.png

# Icône 512x512 (requis pour PWA)
rsvg-convert -w 512 -h 512 logo.svg > icons/icon-512x512.png

# Icônes supplémentaires pour une meilleure compatibilité
rsvg-convert -w 72 -h 72 logo.svg > icons/icon-72x72.png
rsvg-convert -w 96 -h 96 logo.svg > icons/icon-96x96.png
rsvg-convert -w 128 -h 128 logo.svg > icons/icon-128x128.png
rsvg-convert -w 144 -h 144 logo.svg > icons/icon-144x144.png
rsvg-convert -w 152 -h 152 logo.svg > icons/icon-152x152.png
rsvg-convert -w 384 -h 384 logo.svg > icons/icon-384x384.png

# Favicon
rsvg-convert -w 32 -h 32 logo.svg > icons/favicon-32x32.png
rsvg-convert -w 16 -h 16 logo.svg > icons/favicon-16x16.png

echo "Icônes générées avec succès dans le dossier icons/"
