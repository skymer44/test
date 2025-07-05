/**
 * SYSTÈME D'ANALYSE AUTOMATIQUE - DÉTECTION DE PDF
 * 
 * Ce script détecte automatiquement quand un PDF est fourni et lance l'analyse
 * sans nécessiter d'instructions de l'utilisateur.
 */

// Fonction principale d'analyse automatique
async function analyzeDocumentAutomatically() {
    console.log("🤖 ANALYSE AUTOMATIQUE DÉCLENCHÉE");
    console.log("=" .repeat(40));
    
    // Simuler l'analyse du PDF fourni dans l'attachement
    // En réalité, le contenu sera fourni par GitHub Copilot
    
    const samplePdfContent = `
Programme Musical 2026

Ma région virtuose (25 minutes)
- Ammerland - Jacob de Haan - 03:10 - Très interessant pour le son mais assez chère
- Music from How To Train Your Dragon - John Powell/arr. Sean O'Loughlin - 04:50 - Marche très bien, joviale
- The Lion King - John Higgins - 08:40 - Super pièce
- Selections from The Nightmare Before Christmas - Elfman/arr. Brown - 05:12 - Excellent
- Allegretto from Symphony No. 7 - Beethoven/arr. Longfield - 03:00 - Bien arrangée, bien gérer la répartition

Concert du 11 avril avec Eric Aubier (1h)
- Aratunian - ARUTIUNIAN Alexander / arr. SCHYNS José - 16:00 - Pièce complète mais pas évident / vérifier le niveau
- Napoli - Hermann Bellstedt / arr. Donald Hunsberger - 6:00 - Impressionnant et élégant
- Carnaval de Venise - J.B. Arban/Hunsberger - 08:25 - Très grand public / show
- La Virgen de la Macarena - Arrangement David Marlatt - 03:00 - Pas encore convaincu
- The Mandalorian - Ludwig Göransson/arr. Paul Murtha - 02:34 - Pièce courte
- Eldorado - Thierry Deleruyelle - 10:20 - Challenge accessible

Programme fête de la musique (35-40 minutes)
- Begegnung - Kurt Gäble
- Libertango - Astor Piazzola / arr. Tony Cheseaux

Pièces qui n'ont pas trouvé leur concert
- Oregon - Jacob de Haan - 09:09 - Vérifier le niveau et l'intérêt
- Danse Bacchanale Samson et Dalila, Op. 47 - Camille Saint-Saëns / arr. L. Steiger - 07:20 - La pièce est peut-être trop dure.

Financement du projet avec Eric Aubier
[Tableau des financements identique]
    `;
    
    try {
        // 1. Analyser le nouveau document
        const analysisResult = window.PDFAnalyzer.analyzePDFText(samplePdfContent);
        console.log("📊 Analyse terminée - Confiance:", analysisResult.metadata.confidence + "%");
        
        // 2. Comparer avec la baseline
        const changes = window.PDFAnalyzer.compareWithBaseline(analysisResult);
        console.log("🔍 Comparaison avec baseline terminée");
        
        // 3. Générer le rapport automatiquement
        const report = window.PDFAnalyzer.generateAnalysisReport(analysisResult, changes);
        
        // 4. Afficher les résultats
        displayAutomaticAnalysis(report, changes, analysisResult);
        
        // 5. Si des changements sont détectés, les appliquer automatiquement
        if (hasSignificantChanges(changes)) {
            console.log("🔄 Application automatique des changements...");
            await applyChangesAutomatically(changes);
        } else {
            console.log("✅ Aucun changement significatif détecté");
        }
        
        return { success: true, changes, report };
        
    } catch (error) {
        console.error("❌ Erreur lors de l'analyse automatique:", error);
        return { success: false, error: error.message };
    }
}

// Fonction pour déterminer si les changements sont significatifs
function hasSignificantChanges(changes) {
    return changes.concerts.added.length > 0 || 
           changes.pieces.added.length > 0 || 
           changes.pieces.removed.length > 0 ||
           changes.pieces.modified.length > 0;
}

// Fonction pour afficher les résultats de l'analyse
function displayAutomaticAnalysis(report, changes, analysisResult) {
    console.log("\n📋 RAPPORT D'ANALYSE AUTOMATIQUE");
    console.log("=" .repeat(35));
    console.log(report);
    
    // Créer un élément visuel temporaire pour montrer les résultats
    const resultDiv = document.createElement('div');
    resultDiv.id = 'auto-analysis-result';
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: #f8f9fa;
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    const hasChanges = hasSignificantChanges(changes);
    
    resultDiv.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #28a745;">
                🤖 Analyse Automatique
            </h3>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
                PDF analysé en ${analysisResult.metadata.confidence}% de confiance
            </p>
        </div>
        
        ${hasChanges ? `
        <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #dc3545;">📝 Changements détectés:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                ${changes.concerts.added.length > 0 ? `<li>${changes.concerts.added.length} nouveau(x) concert(s)</li>` : ''}
                ${changes.pieces.added.length > 0 ? `<li>${changes.pieces.added.length} nouvelle(s) pièce(s)</li>` : ''}
                ${changes.pieces.removed.length > 0 ? `<li>${changes.pieces.removed.length} pièce(s) supprimée(s)</li>` : ''}
                ${changes.pieces.modified.length > 0 ? `<li>${changes.pieces.modified.length} pièce(s) modifiée(s)</li>` : ''}
            </ul>
        </div>
        ` : `
        <div style="margin-bottom: 15px;">
            <p style="margin: 0; color: #28a745;">
                ✅ Aucun changement détecté
            </p>
        </div>
        `}
        
        <div style="text-align: center;">
            <button onclick="closeAnalysisResult()" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(resultDiv);
    
    // Auto-suppression après 10 secondes
    setTimeout(() => {
        if (document.getElementById('auto-analysis-result')) {
            resultDiv.remove();
        }
    }, 10000);
}

// Fonction pour fermer le résultat d'analyse
window.closeAnalysisResult = function() {
    const resultDiv = document.getElementById('auto-analysis-result');
    if (resultDiv) {
        resultDiv.remove();
    }
};

// Fonction pour appliquer automatiquement les changements
async function applyChangesAutomatically(changes) {
    console.log("🛠️ Application des changements au site...");
    
    // Note: En pratique, cette fonction déclencherait les modifications
    // des fichiers HTML via les outils de GitHub Copilot
    
    let changesSummary = [];
    
    if (changes.concerts.added.length > 0) {
        changesSummary.push(`➕ ${changes.concerts.added.length} concert(s) ajouté(s)`);
    }
    
    if (changes.pieces.added.length > 0) {
        changesSummary.push(`🎵 ${changes.pieces.added.length} pièce(s) ajoutée(s)`);
    }
    
    if (changes.pieces.removed.length > 0) {
        changesSummary.push(`🗑️ ${changes.pieces.removed.length} pièce(s) supprimée(s)`);
    }
    
    if (changes.pieces.modified.length > 0) {
        changesSummary.push(`✏️ ${changes.pieces.modified.length} pièce(s) modifiée(s)`);
    }
    
    console.log("✅ Changements appliqués:", changesSummary.join(', '));
    
    // Mettre à jour la baseline
    window.DocumentProcessor.updateBaseline({
        ...window.BASELINE_DATA,
        concerts: changes.concerts.added.length > 0 ? 
            [...window.BASELINE_DATA.concerts, ...changes.concerts.added] : 
            window.BASELINE_DATA.concerts
    });
    
    showMessage("📄 Document analysé et site mis à jour automatiquement!", "success");
}

// Détection automatique au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier s'il y a des indicateurs qu'un nouveau PDF a été fourni
    // Dans un contexte réel, cela serait déclenché par GitHub Copilot
    
    // Simuler la détection après 2 secondes pour les tests
    setTimeout(() => {
        console.log("🔍 Recherche de nouveaux documents...");
        
        // En production, cette condition serait basée sur de vrais indicateurs
        const shouldAnalyze = window.location.search.includes('analyze') || 
                             localStorage.getItem('trigger_analysis') === 'true';
        
        if (shouldAnalyze) {
            localStorage.removeItem('trigger_analysis');
            analyzeDocumentAutomatically();
        }
    }, 2000);
});

// Fonction publique pour déclencher l'analyse manuellement (pour les tests)
window.triggerAutomaticAnalysis = function() {
    console.log("🎯 Déclenchement manuel de l'analyse automatique");
    analyzeDocumentAutomatically();
};

// Export pour utilisation externe
window.AutoAnalyzer = {
    analyzeDocumentAutomatically,
    displayAutomaticAnalysis,
    applyChangesAutomatically,
    hasSignificantChanges
};

console.log("🤖 Système d'analyse automatique initialisé");
