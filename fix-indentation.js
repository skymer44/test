/**
 * Script pour corriger définitivement l'indentation HTML
 */

const fs = require('fs');

// Lire le fichier index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Corriger les problèmes d'indentation spécifiques
htmlContent = htmlContent.replace(
    /            <section id="([^"]+)" class="concert-section">\s*<div class="concert-header">/g,
    `            <section id="$1" class="concert-section">
                <div class="concert-header"`
);

// Corriger l'indentation des piece-links
htmlContent = htmlContent.replace(
    /                    <div class="piece-links">\s*<a href="/g,
    `                    <div class="piece-links">
                        <a href="`
);

// Uniformiser les fermetures de piece-links
htmlContent = htmlContent.replace(
    /<\/a>\s*<\/div>/g,
    `</a>
                    </div>`
);

// Corriger les liens multiples dans piece-links
htmlContent = htmlContent.replace(
    /(<a href="[^"]*"[^>]*>[^<]*<\/a>)\s*(<a href="[^"]*"[^>]*>[^<]*<\/a>)/g,
    `$1
                        $2`
);

htmlContent = htmlContent.replace(
    /(<a href="[^"]*"[^>]*>[^<]*<\/a>)\s*(<a href="[^"]*"[^>]*>[^<]*<\/a>)\s*(<a href="[^"]*"[^>]*>[^<]*<\/a>)/g,
    `$1
                        $2
                        $3`
);

// Écrire le fichier corrigé
fs.writeFileSync('index.html', htmlContent);

console.log('✅ Indentation HTML corrigée !');
