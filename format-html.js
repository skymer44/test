/**
 * Script pour reformater le HTML et corriger les incohérences
 */

const fs = require('fs');

// Lire le fichier index.html
let htmlContent = fs.readFileSync('index.html', 'utf8');

// Regex pour matcher les liens mal formatés (tout sur une ligne)
const badLinksRegex = /<div class="piece-links">(<a href[^>]*>[^<]*<\/a>)+<\/div>/g;

// Fonction pour reformater les liens
function formatLinks(match) {
    // Extraire tous les liens
    const linkRegex = /<a href[^>]*>[^<]*<\/a>/g;
    const links = match.match(linkRegex) || [];
    
    if (links.length === 0) return match;
    
    // Reformater avec des retours à la ligne et indentation
    let formatted = '                    <div class="piece-links">\n';
    links.forEach(link => {
        formatted += '                        ' + link + '\n';
    });
    formatted += '                    </div>';
    
    return formatted;
}

// Appliquer la correction
htmlContent = htmlContent.replace(badLinksRegex, formatLinks);

// Corriger d'autres incohérences
htmlContent = htmlContent.replace(/class="links"/g, 'class="piece-links"');

// Corriger les structure des en-têtes de section
htmlContent = htmlContent.replace(
    /<div class="concert-header">\s*<h2 class="concert-title">([^<]+)<\/h2>\s*<span class="piece-count">([^<]+)<\/span>\s*<button class="pdf-download-btn" data-section="([^"]+)" title="[^"]*">\s*📄 Télécharger PDF\s*<\/button>\s*<\/div>/g,
    (match, title, count, section) => {
        return `                <div class="concert-header">
                    <h2 class="concert-title">${title}</h2>
                    <span class="piece-count">${count}</span>
                    <button class="pdf-download-btn" data-section="${section}" title="Télécharger ce programme en PDF">
                        📄 Télécharger PDF
                    </button>
                </div>`;
    }
);

// Écrire le fichier corrigé
fs.writeFileSync('index.html', htmlContent);

console.log('✅ HTML reformaté avec succès !');
