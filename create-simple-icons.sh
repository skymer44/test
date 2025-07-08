#!/bin/bash

# Script simple pour créer des icônes de base colorées
echo "🎨 Création d'icônes PWA simples..."

mkdir -p icons

# Créer une icône de base avec du texte
for size in 72 96 128 144 152 192 384 512; do
    echo "📱 Création icône ${size}x${size}..."
    
    # Créer un SVG temporaire
    cat > "icons/temp-${size}.svg" << EOF
<svg width="$size" height="$size" viewBox="0 0 $size $size" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
        </linearGradient>
    </defs>
    <rect width="$size" height="$size" rx="$(echo "$size * 0.15" | bc -l | cut -d. -f1)" fill="url(#bg)"/>
    <circle cx="$(echo "$size / 2" | bc -l | cut -d. -f1)" cy="$(echo "$size / 2 - $size * 0.1" | bc -l | cut -d. -f1)" r="$(echo "$size * 0.15" | bc -l | cut -d. -f1)" fill="white"/>
    <rect x="$(echo "$size / 2 - $size * 0.01" | bc -l | cut -d. -f1)" y="$(echo "$size / 2 - $size * 0.25" | bc -l | cut -d. -f1)" width="$(echo "$size * 0.02" | bc -l | cut -d. -f1)" height="$(echo "$size * 0.3" | bc -l | cut -d. -f1)" fill="white"/>
    <text x="$(echo "$size / 2" | bc -l | cut -d. -f1)" y="$(echo "$size * 0.85" | bc -l | cut -d. -f1)" text-anchor="middle" fill="white" font-family="Arial" font-size="$(echo "$size * 0.08" | bc -l | cut -d. -f1)" font-weight="bold">2026</text>
</svg>
EOF

    # Si nous avons rsvg-convert (librsvg), l'utiliser
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $size -h $size "icons/temp-${size}.svg" > "icons/icon-${size}x${size}.png"
        rm "icons/temp-${size}.svg"
    else
        # Sinon, garder le SVG comme fallback
        mv "icons/temp-${size}.svg" "icons/icon-${size}x${size}.svg"
        echo "ℹ️  Créé en SVG (installer librsvg pour conversion PNG)"
    fi
done

echo "✅ Icônes créées dans le dossier icons/"
