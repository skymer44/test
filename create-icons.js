const fs = require('fs');
const path = require('path');

// Fonction pour créer des icônes de base si sharp n'est pas disponible
function createBasicIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    // Créer des icônes de fallback très simples
    sizes.forEach(size => {
        const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}" fill="url(#bgGradient)"/>
            <text x="${size/2}" y="${size/2 + size*0.1}" text-anchor="middle" fill="white" 
                  font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">🎵</text>
            <text x="${size/2}" y="${size * 0.9}" text-anchor="middle" fill="white" opacity="0.8"
                  font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">2026</text>
        </svg>`;
        
        fs.writeFileSync(path.join(__dirname, `icons/icon-${size}x${size}.svg`), canvas);
    });
    
    console.log('✅ Icônes SVG créées. Pour les convertir en PNG, utilisez un outil en ligne ou ImageMagick.');
    console.log('💡 Commande ImageMagick : convert icon-192x192.svg icon-192x192.png');
}

// Créer les icônes de fallback
try {
    if (!fs.existsSync('icons')) {
        fs.mkdirSync('icons');
    }
    createBasicIcons();
} catch (error) {
    console.error('❌ Erreur lors de la création des icônes:', error);
}
