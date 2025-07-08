// Icônes PNG de base en base64 pour PWA
const fs = require('fs');

// Créer des icônes PNG de base en utilisant Canvas ASCII art (fallback)
function createPNGIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    // Pour chaque taille, créer un fichier placeholder
    sizes.forEach(size => {
        const placeholder = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" ry="${Math.round(size * 0.15)}" fill="url(#bgGradient)"/>
    <circle cx="${size/2}" cy="${size/2 - size*0.05}" r="${size*0.15}" fill="white"/>
    <rect x="${size/2 - size*0.01}" y="${size/2 - size*0.2}" width="${size*0.02}" height="${size*0.25}" fill="white"/>
    <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" fill="white" opacity="0.9"
          font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">2026</text>
</svg>`).toString('base64')}`;
        
        // Écrire le fichier de données
        fs.writeFileSync(`icons/icon-${size}x${size}.data`, placeholder);
    });
    
    console.log('📱 Fichiers de données des icônes créés');
    console.log('ℹ️  Ces fichiers peuvent être utilisés temporairement en attendant la création des vraies icônes PNG');
}

createPNGIcons();
