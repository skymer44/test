/**
 * UTILITAIRES POUR L'ANALYSE AUTOMATIQUE DE DOCUMENTS
 * 
 * Ce fichier contient les fonctions que GitHub Copilot utilise pour analyser
 * automatiquement les nouveaux documents PDF et appliquer les changements au site.
 */

// Fonction principale pour traiter un nouveau document
async function processNewDocument(pdfText, filename = "nouveau-document.pdf") {
    console.log("🔄 Traitement du nouveau document:", filename);
    
    try {
        // 1. Analyser le nouveau document
        const analysisResult = window.PDFAnalyzer.analyzePDFText(pdfText);
        console.log("📊 Analyse terminée, confiance:", analysisResult.metadata.confidence + "%");
        
        // 2. Comparer avec la baseline
        const changes = window.PDFAnalyzer.compareWithBaseline(analysisResult);
        console.log("🔍 Comparaison terminée");
        
        // 3. Générer le rapport
        const report = window.PDFAnalyzer.generateAnalysisReport(analysisResult, changes);
        console.log("📄 Rapport généré");
        
        // 4. Retourner les résultats pour application manuelle
        return {
            success: true,
            analysis: analysisResult,
            changes: changes,
            report: report,
            recommendations: generateUpdateRecommendations(changes)
        };
        
    } catch (error) {
        console.error("❌ Erreur lors du traitement:", error);
        return {
            success: false,
            error: error.message,
            report: "Échec de l'analyse du document"
        };
    }
}

// Générer des recommandations de mise à jour spécifiques
function generateUpdateRecommendations(changes) {
    const recommendations = [];
    
    // Recommandations pour nouveaux concerts
    if (changes.concerts.added.length > 0) {
        recommendations.push({
            type: "ADD_CONCERT",
            action: "Ajouter une nouvelle section de concert",
            data: changes.concerts.added,
            priority: "HIGH"
        });
    }
    
    // Recommandations pour nouvelles pièces
    if (changes.pieces.added.length > 0) {
        recommendations.push({
            type: "ADD_PIECES",
            action: "Ajouter de nouvelles pièces musicales",
            data: changes.pieces.added,
            priority: "HIGH"
        });
    }
    
    // Recommandations pour suppressions
    if (changes.pieces.removed.length > 0) {
        recommendations.push({
            type: "REMOVE_PIECES",
            action: "Supprimer des pièces musicales",
            data: changes.pieces.removed,
            priority: "MEDIUM"
        });
    }
    
    // Recommandations pour modifications
    if (changes.pieces.modified.length > 0) {
        recommendations.push({
            type: "UPDATE_PIECES",
            action: "Mettre à jour les informations des pièces",
            data: changes.pieces.modified,
            priority: "MEDIUM"
        });
    }
    
    return recommendations;
}

// Fonction pour formater les changements en instructions HTML
function formatHtmlInstructions(changes) {
    const instructions = [];
    
    // Instructions pour ajouter des concerts
    changes.concerts.added.forEach(concert => {
        instructions.push({
            type: "html",
            action: "add_section",
            location: "before_empty_sections",
            content: generateConcertHtml(concert)
        });
    });
    
    // Instructions pour ajouter des pièces
    changes.pieces.added.forEach(piece => {
        instructions.push({
            type: "html",
            action: "add_piece",
            location: `section#${piece.concertId} .pieces-grid`,
            content: generatePieceHtml(piece)
        });
    });
    
    // Instructions pour supprimer des pièces
    changes.pieces.removed.forEach(piece => {
        instructions.push({
            type: "html",
            action: "remove_piece",
            selector: `section#${piece.concertId} .piece-card:has(h3:contains("${piece.title}"))`
        });
    });
    
    return instructions;
}

// Générer le HTML pour un nouveau concert
function generateConcertHtml(concert) {
    const piecesHtml = concert.pieces.map(piece => generatePieceHtml(piece)).join('\n');
    
    return `
        <!-- ${concert.title} -->
        <section id="${concert.id}" class="concert-section">
            <div class="section-header">
                <h2>${concert.title}${concert.duration ? ` (${concert.duration})` : ''}</h2>
                <button class="pdf-download-btn" data-section="${concert.id}" title="Télécharger ce programme en PDF">
                    📄 Télécharger PDF
                </button>
            </div>
            <div class="pieces-grid">
                ${piecesHtml}
            </div>
        </section>
    `;
}

// Générer le HTML pour une nouvelle pièce
function generatePieceHtml(piece) {
    const linksHtml = generateLinksHtml(piece.links);
    
    return `
                <div class="piece-card">
                    <h3>${piece.title}</h3>
                    ${piece.composer ? `<p><strong>Compositeur:</strong> ${piece.composer}</p>` : ''}
                    ${piece.duration ? `<p><strong>Durée:</strong> ${piece.duration}</p>` : ''}
                    ${piece.info ? `<p><strong>Info:</strong> ${piece.info}</p>` : ''}
                    ${linksHtml ? `<div class="links">${linksHtml}</div>` : ''}
                </div>
    `;
}

// Générer le HTML pour les liens
function generateLinksHtml(links) {
    if (!links || Object.keys(links).length === 0) return '';
    
    const linkTypes = {
        audio: '🎵 Audio',
        original: '🎬 Original',
        purchase: '🛒 Achat',
        video: '🎬 Vidéo'
    };
    
    return Object.entries(links)
        .filter(([type, url]) => url)
        .map(([type, url]) => {
            const label = linkTypes[type] || `🔗 ${type}`;
            return `<a href="${url}" target="_blank">${label}</a>`;
        })
        .join('\n                        ');
}

// Fonction pour sauvegarder la nouvelle baseline après mise à jour
function updateBaseline(newData) {
    // Mettre à jour les métadonnées
    newData.metadata = {
        ...window.BASELINE_DATA.metadata,
        version: incrementVersion(window.BASELINE_DATA.metadata.version),
        lastUpdate: new Date().toISOString()
    };
    
    // Remplacer la baseline actuelle
    window.BASELINE_DATA = newData;
    
    console.log("✅ Baseline mise à jour vers la version", newData.metadata.version);
    
    return newData;
}

// Incrémenter le numéro de version
function incrementVersion(currentVersion) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
}

// Fonction de test pour valider le système
function testAnalysisSystem() {
    console.log("🧪 Test du système d'analyse...");
    
    // Test avec les données actuelles
    const testResult = window.PDFAnalyzer.compareWithBaseline(window.BASELINE_DATA);
    console.log("Résultat du test:", testResult);
    
    if (testResult.concerts.added.length === 0 && 
        testResult.pieces.added.length === 0 && 
        testResult.concerts.removed.length === 0 && 
        testResult.pieces.removed.length === 0) {
        console.log("✅ Système fonctionnel - aucun changement détecté (normal)");
        return true;
    } else {
        console.log("⚠️ Changements détectés lors du test de cohérence");
        return false;
    }
}

// Initialiser les outils d'analyse au chargement
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que tous les scripts soient chargés
    setTimeout(() => {
        if (window.BASELINE_DATA && window.PDFAnalyzer) {
            console.log("🚀 Système d'analyse automatique prêt");
            console.log("📊 Baseline version:", window.BASELINE_DATA.metadata.version);
            console.log("📅 Dernière mise à jour:", new Date(window.BASELINE_DATA.metadata.lastUpdate).toLocaleString('fr-FR'));
            
            // Test de cohérence
            testAnalysisSystem();
        } else {
            console.error("❌ Erreur: Système d'analyse non initialisé correctement");
        }
    }, 500);
});

// Exporter les fonctions pour utilisation dans la console si nécessaire
window.DocumentProcessor = {
    processNewDocument,
    generateUpdateRecommendations,
    formatHtmlInstructions,
    updateBaseline,
    testAnalysisSystem
};

console.log("⚙️ Utilitaires d'analyse automatique chargés");
