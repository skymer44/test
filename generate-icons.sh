#!/bin/bash

# Script pour générer les icônes PWA
# Nécessite ImageMagick (brew install imagemagick)

# Couleurs et style
BG_COLOR="#667eea"
TEXT_COLOR="white"
ICON_NAME="🎵"

echo "🎨 Génération des icônes PWA pour Programme Musical 2026..."

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick n'est pas installé. Installez-le avec : brew install imagemagick"
    exit 1
fi

# Créer le dossier icons s'il n'existe pas
mkdir -p icons

# Tailles d'icônes requises
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "📱 Génération icône ${size}x${size}..."
    
    # Calculer la taille de l'emoji (80% de la taille de l'icône)
    emoji_size=$((size * 8 / 10))
    
    # Créer l'icône avec un fond de couleur et l'emoji centré
    convert -size ${size}x${size} xc:"$BG_COLOR" \
            -gravity center \
            -pointsize $emoji_size \
            -fill white \
            -font "Apple Color Emoji" \
            -annotate +0+0 "$ICON_NAME" \
            "icons/icon-${size}x${size}.png"
done

echo "✅ Icônes PWA générées avec succès dans le dossier icons/"
echo "📋 Icônes créées :"
ls -la icons/

# Créer également une favicon
echo "🔗 Génération de la favicon..."
convert icons/icon-192x192.png -resize 32x32 favicon.ico
convert icons/icon-192x192.png -resize 16x16 icons/favicon-16x16.png
convert icons/icon-192x192.png -resize 32x32 icons/favicon-32x32.png

echo "✅ Favicon générée !"
