/**
 * 🎯 Script de synchronisation automatique Notion → HTML
 * 
 * Ce script s'exécute dans GitHub Actions pour :
 * 1. Récupérer les données depuis les VRAIES bases Notion du Programme 2026
 * 2. Générer un index.html complet
 * 3. Publier automatiquement le site
 */

const axios = require('axios');
const fs = require('fs');

// Capturer toutes les erreurs
process.on('uncaughtException', (error) => {
    console.error('❌ ERREUR NON GÉRÉE:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ PROMISE REJETÉE:', reason);
    process.exit(1);
});

console.log('🔍 Démarrage du script de synchronisation...');
console.log('📋 Node.js version:', process.version);
console.log('📋 Répertoire de travail:', process.cwd());

// Configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!NOTION_TOKEN) {
    console.error('❌ ERREUR: NOTION_TOKEN non défini !');
    process.exit(1);
}

console.log('✅ NOTION_TOKEN défini:', NOTION_TOKEN.substring(0, 10) + '...');

// Les vraies bases de données du Programme 2026
const CONCERT_DATABASES = {
    'Ma région virtuose': process.env.NOTION_DATABASE_MA_REGION || '223fcf9e3abc80c99557c6eaca292645',
    'Concert Eric Aubier': process.env.NOTION_DATABASE_ERIC_AUBIER || '21efcf9e3abc80b68ba7cedabb1ba43e',
    'Fête de la musique': process.env.NOTION_DATABASE_FETE_MUSIQUE || '223fcf9e3abc80d0bc96e6a5c9b64df5',
    'Pièces sans concert': process.env.NOTION_DATABASE_PIECES_SANS_CONCERT || '226fcf9e3abc80d3ae67d880ad2b1ef6',
    'Insertion 60 ans Conservatoire': process.env.NOTION_DATABASE_CONSERVATOIRE || '223fcf9e3abc8053acbbe6a61cf61723',
    'Retour Karaoké': process.env.NOTION_DATABASE_KARAOKE || '226fcf9e3abc80e8b85cd5d08a29d975',
    'Loto': process.env.NOTION_DATABASE_LOTO || '226fcf9e3abc8068bfa6fb619a1633d1',
    'Pièces d\'ajout sans direction': process.env.NOTION_DATABASE_AJOUT_SANS_DIRECTION || '226fcf9e3abc808eae5de811ce3b2903'
};

const FINANCEMENT_DATABASE = process.env.NOTION_DATABASE_FINANCEMENT || 'c91797b562bb4599bb8ed2cc50fd3d0a';

console.log('📋 Bases de données configurées:', Object.keys(CONCERT_DATABASES).length);
console.log('📋 Base financement:', FINANCEMENT_DATABASE.substring(0, 8) + '...');

// Base URL pour l'API Notion
const NOTION_API_BASE = 'https://api.notion.com/v1';

/**
 * Récupère les données d'une base Notion
 */
async function fetchNotionDatabase(databaseId) {
    try {
        console.log(`📥 Récupération de la base ${databaseId.substring(0, 8)}...`);
        
        const response = await axios.post(
            `${NOTION_API_BASE}/databases/${databaseId}/query`,
            {
                page_size: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${NOTION_TOKEN}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 secondes
            }
        );
        
        console.log(`✅ ${response.data.results.length} éléments récupérés pour ${databaseId.substring(0, 8)}`);
        return response.data.results;
        
    } catch (error) {
        console.error(`❌ Erreur lors de la récupération de ${databaseId}:`, error.message);
        if (error.response) {
            console.error(`📋 Status: ${error.response.status}`);
            console.error(`📋 Data:`, error.response.data);
        } else if (error.request) {
            console.error(`📋 Pas de réponse reçue`);
        } else {
            console.error(`📋 Erreur de configuration:`, error.message);
        }
        return [];
    }
}

/**
 * Formate une entrée de programme musical
 */
function formatProgrammeEntry(entry) {
    const properties = entry.properties;
    
    const titre = properties['Pièce']?.title?.[0]?.text?.content || 'Sans titre';
    const compositeur = properties['Compositeur / Arrangeur']?.rich_text?.[0]?.text?.content || 'Compositeur inconnu';
    const duree = properties['Durée']?.rich_text?.[0]?.text?.content || '';
    const info = properties['Info sup\'']?.rich_text?.[0]?.text?.content || '';
    const audioUrl = properties['Lien de l\'arrangement audio']?.rich_text?.[0]?.text?.content || '';
    const originalUrl = properties['Lien de l\'oeuvre originale']?.rich_text?.[0]?.text?.content || '';
    const achatUrl = properties['Lien achat']?.rich_text?.[0]?.text?.content || '';
    const consensus = properties['Pas de consensus']?.checkbox || false;
    
    return {
        titre,
        compositeur,
        duree,
        info,
        audio: audioUrl,
        partition: originalUrl,
        achat: achatUrl,
        consensus
    };
}

/**
 * Formate une entrée de financement
 */
function formatFinancementEntry(entry) {
    const properties = entry.properties;
    
    const evenement = properties['Evenement']?.title?.[0]?.text?.content || 'Événement';
    const objet = properties['Objet']?.rich_text?.[0]?.text?.content || '';
    const montant1 = properties['Montant 1']?.number || 0;
    const montant2 = properties['Montant 2']?.number || 0;
    const statut = properties['Statut du remboursement']?.multi_select?.[0]?.name || 'En attente';
    
    return {
        nom: evenement,
        objet,
        montant: montant1 + montant2,
        statut,
        type: 'Dépense'
    };
}

/**
 * Génère le HTML pour une pièce
 */
function generatePieceHTML(piece) {
    return `
                    <div class="piece-card ${piece.consensus ? 'no-consensus' : ''}">
                        <h3>${piece.titre}</h3>
                        <p><strong>Compositeur:</strong> ${piece.compositeur}</p>
                        ${piece.duree ? `<p><strong>Durée:</strong> ${piece.duree}</p>` : ''}
                        ${piece.info ? `<p><strong>Info:</strong> ${piece.info}</p>` : ''}
                        
                        <div class="piece-links">
                            ${piece.audio ? `<a href="${piece.audio}" target="_blank" class="link-btn">🎵 Audio</a>` : ''}
                            ${piece.partition ? `<a href="${piece.partition}" target="_blank" class="link-btn">🎼 Original</a>` : ''}
                            ${piece.achat ? `<a href="${piece.achat}" target="_blank" class="link-btn">🛒 Achat</a>` : ''}
                        </div>
                        
                        ${piece.consensus ? '<div class="consensus-warning">⚠️ Pas de consensus</div>' : ''}
                    </div>`;
}

/**
 * Génère le HTML pour une section de concert
 */
function generateConcertSection(title, pieces, sectionId) {
    return `
            <section id="${sectionId}" class="concert-section">
                <div class="section-header">
                    <h2>${title}</h2>
                    <button class="pdf-download-btn" data-section="${sectionId}" title="Télécharger ce programme en PDF">
                        📄 Télécharger PDF
                    </button>
                </div>
                <div class="pieces-grid">
${pieces.map(generatePieceHTML).join('')}
                </div>
            </section>`;
}

/**
 * Génère le HTML pour une entrée de financement
 */
function generateFinancementHTML(financement) {
    return `
                    <div class="financement-card">
                        <h3>${financement.nom}</h3>
                        <p><strong>Objet:</strong> ${financement.objet}</p>
                        <p><strong>Montant:</strong> ${financement.montant}€</p>
                        <p><strong>Statut:</strong> <span class="status-${financement.statut.toLowerCase().replace(/\s+/g, '-')}">${financement.statut}</span></p>
                    </div>`;
}

/**
 * Génère le HTML complet du site
 */
function generateCompleteHTML(concerts, financements) {
    // Générer toutes les sections de concerts
    let sectionsHTML = '';
    Object.keys(concerts).forEach(concertName => {
        const pieces = concerts[concertName];
        const sectionId = concertName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
        
        sectionsHTML += generateConcertSection(concertName, pieces, sectionId);
    });
    
    // Générer la section financement
    const financementHTML = financements.map(generateFinancementHTML).join('');
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programme Musical 2026</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .piece-links { margin-top: 10px; }
        .link-btn { 
            display: inline-block; 
            margin: 2px 5px 2px 0; 
            padding: 4px 8px; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 3px; 
            font-size: 12px; 
        }
        .link-btn:hover { background: #0056b3; }
        .no-consensus { border-left: 4px solid #ff6b6b; }
        .consensus-warning { 
            background: #ffe6e6; 
            color: #c92a2a; 
            padding: 5px; 
            border-radius: 3px; 
            font-size: 12px; 
            margin-top: 10px; 
        }
        .status-remboursé { color: #28a745; font-weight: bold; }
        .status-en-attente { color: #ffc107; font-weight: bold; }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <h1>Programme Musical 2026</h1>
            <p>Dernière synchronisation : ${new Date().toLocaleString('fr-FR')}</p>
        </div>
    </header>

    <!-- Navigation par onglets -->
    <nav class="tab-navigation">
        <div class="tab-container">
            <div class="tab-buttons">
                <button class="tab-button active" data-tab="programmes">📚 Programmes Musicaux</button>
                <button class="tab-button" data-tab="financement">💰 Financement</button>
            </div>
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Rechercher une pièce, un compositeur..." class="search-input">
            </div>
        </div>
    </nav>

    <main>
        <!-- Section Programmes -->
        <div id="programmes" class="tab-content active">
${sectionsHTML}
        </div>

        <!-- Section Financement -->
        <div id="financement" class="tab-content">
            <section class="financement-section">
                <h2>💰 Historique des Dépenses</h2>
                <div class="financement-grid">
${financementHTML}
                </div>
            </section>
        </div>
    </main>

    <script src="script.js"></script>
</body>
</html>`;
}

/**
 * Fonction principale de synchronisation
 */
async function main() {
    console.log('🚀 === DÉBUT DE LA FONCTION MAIN ===');
    
    try {
        console.log('🚀 === SYNCHRONISATION AUTOMATIQUE NOTION ===');
        console.log(`⏰ ${new Date().toLocaleString('fr-FR')}`);
        console.log('📥 Récupération des données Notion...');
        
        // Vérifier le token
        if (!NOTION_TOKEN) {
            console.error('❌ ERREUR CRITIQUE: NOTION_TOKEN manquant !');
            process.exit(1);
        }
        
        console.log('✅ Token validé, début de la récupération...');
        
        // Récupérer toutes les données des concerts
        const concerts = {};
        let totalRetrieved = 0;
        
        console.log(`🔢 Nombre de bases à traiter: ${Object.keys(CONCERT_DATABASES).length}`);
        
        for (const [concertName, databaseId] of Object.entries(CONCERT_DATABASES)) {
            console.log(`🔍 Traitement de "${concertName}" (${databaseId.substring(0, 8)}...)...`);
            try {
                const rawData = await fetchNotionDatabase(databaseId);
                const formattedData = rawData.map(formatProgrammeEntry);
                concerts[concertName] = formattedData;
                totalRetrieved += formattedData.length;
                console.log(`   ✅ ${formattedData.length} pièces formatées pour "${concertName}"`);
            } catch (error) {
                console.error(`   ❌ Erreur pour "${concertName}":`, error.message);
                concerts[concertName] = [];
            }
        }
        
        console.log(`📊 Total récupéré jusqu'ici: ${totalRetrieved} pièces`);
        
        // Récupérer les données de financement
        console.log('💰 Récupération du financement...');
        const financementData = await fetchNotionDatabase(FINANCEMENT_DATABASE);
        const financements = financementData.map(formatFinancementEntry);
        
        console.log('🔄 Formatage des données...');
        const totalPieces = Object.values(concerts).reduce((sum, pieces) => sum + pieces.length, 0);
        console.log(`📊 ${totalPieces} programmes récupérés`);
        console.log(`💰 ${financements.length} éléments de financement récupérés`);
        
        console.log('🎨 Génération du HTML...');
        const htmlContent = generateCompleteHTML(concerts, financements);
        
        // Écrire le fichier HTML
        fs.writeFileSync('index.html', htmlContent);
        console.log('✅ index.html généré avec succès !');
        
        console.log('🎉 Synchronisation terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error.message);
        console.error('📋 Stack trace:', error.stack);
        process.exit(1);
    }
}

// Exécuter la synchronisation avec logs explicites
console.log('🚀 Appel de la fonction main()...');

main()
    .then(() => {
        console.log('✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur dans main():', error);
        process.exit(1);
    });
