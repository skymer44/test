/**
 * Script de synchronisation Notion → Site Web
 * Programme Musical 2026
 * 
 * Ce script récupère les données depuis vos bases Notion et met à jour
 * automatiquement le contenu de votre site web.
 */

const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');
const SmartMapper = require('./smart-mapper.js');
const { NOTION_SUGGESTIONS } = require('./structure-analysis.js');

// Configuration
const CONFIG = {
    // Token d'intégration Notion (défini dans les secrets GitHub ou en local)
    notionToken: process.env.NOTION_TOKEN || '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',
    
    // Type de synchronisation ('full' ou 'test')
    syncType: process.env.SYNC_TYPE || 'full',
    
    // FILTRE: Toutes les bases de données souhaitées par l'utilisateur
    allowedDatabases: [
        "Retour Karaoké",
        "Programme fête de la musique",
        "Insertion dans les 60 ans du Conservatoire ",
        "Concert du 11 d'avril avec Eric Aubier",
        "Concert du 11 d'avril avec Eric Aubier", // Version avec apostrophe droite
        "Ma région virtuose",
        "Pièces qui n'ont pas trouvé leur concert",
        "Pièces qui n'ont pas trouvé leur concert", // Version avec apostrophe droite
        "Pièces d'ajout sans direction",
        "Pièces d'ajout sans direction", // Version avec apostrophe droite
        "Loto"
    ],
    
    // IDs des bases de données Notion (à remplir après création)
    databases: {
        // concerts: 'NOTION_DATABASE_ID_CONCERTS',
        // pieces: 'NOTION_DATABASE_ID_PIECES',
        // financement: 'NOTION_DATABASE_ID_FINANCEMENT'
    },
    
    // Fichiers de sortie
    outputFiles: {
        concerts: 'data/concerts.json',
        financement: 'data/financement.json',
        backup: 'data/backup-{timestamp}.json'
    }
};

// Client Notion et mapper intelligent
const notion = new Client({
    auth: CONFIG.notionToken,
});
const mapper = new SmartMapper();

/**
 * Point d'entrée principal
 */
async function main() {
    try {
        console.log('🎵 === SYNCHRONISATION NOTION → SITE WEB ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🎯 Type: ${CONFIG.syncType}`);
        
        // Vérifier la configuration
        await validateConfig();
        
        // Créer les dossiers nécessaires
        await ensureDirectories();
        
        // Sauvegarder les données actuelles
        await backupCurrentData();
        
        // Rechercher automatiquement les bases de données
        const databases = await findNotionDatabases();
        
        if (databases.length === 0) {
            console.log('ℹ️ Aucune base de données Notion trouvée.');
            console.log('🔧 Créez vos bases de données dans Notion et partagez-les avec l\'intégration.');
            return;
        }
        
        // Synchroniser les données
        const syncResult = await synchronizeData(databases);
        
        // Générer le rapport
        generateSyncReport(syncResult);
        
        console.log('✅ Synchronisation terminée avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error.message);
        console.error('📋 Détails:', error);
        process.exit(1);
    }
}

/**
 * Valide la configuration
 */
async function validateConfig() {
    if (!CONFIG.notionToken) {
        throw new Error('Token Notion manquant. Vérifiez la variable NOTION_TOKEN.');
    }
    
    console.log('✅ Configuration validée');
}

/**
 * Crée les dossiers nécessaires
 */
async function ensureDirectories() {
    const dirs = ['data', 'scripts'];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            // Le dossier existe déjà
        }
    }
    
    console.log('✅ Dossiers créés/vérifiés');
}

/**
 * Sauvegarde les données actuelles
 */
async function backupCurrentData() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = CONFIG.outputFiles.backup.replace('{timestamp}', timestamp);
        
        // Lire les données actuelles du site
        const currentData = await extractCurrentSiteData();
        
        await fs.writeFile(backupFile, JSON.stringify(currentData, null, 2));
        console.log(`💾 Sauvegarde créée: ${backupFile}`);
        
    } catch (error) {
        console.warn('⚠️ Impossible de créer la sauvegarde:', error.message);
    }
}

/**
 * Extrait les données actuelles du site
 */
async function extractCurrentSiteData() {
    try {
        const htmlContent = await fs.readFile('index.html', 'utf8');
        
        // Parser le HTML pour extraire la structure actuelle
        // (Version simplifiée - en production, on utiliserait un parser HTML)
        const concerts = [];
        const sectionRegex = /<section[^>]*id="([^"]*)"[^>]*class="concert-section"[^>]*>(.*?)<\/section>/gs;
        
        let match;
        while ((match = sectionRegex.exec(htmlContent)) !== null) {
            const [, sectionId, sectionContent] = match;
            
            // Extraire le titre
            const titleMatch = sectionContent.match(/<h2[^>]*>(.*?)<\/h2>/);
            const title = titleMatch ? titleMatch[1].trim() : sectionId;
            
            // Extraire les pièces
            const pieces = [];
            const pieceRegex = /<div[^>]*class="piece-card"[^>]*>(.*?)<\/div>/gs;
            
            let pieceMatch;
            while ((pieceMatch = pieceRegex.exec(sectionContent)) !== null) {
                const pieceContent = pieceMatch[1];
                
                const pieceTitle = pieceContent.match(/<h3[^>]*>(.*?)<\/h3>/)?.[1]?.trim();
                if (pieceTitle && !pieceContent.includes('Section en cours')) {
                    pieces.push({
                        title: pieceTitle,
                        // Ajouter d'autres champs si nécessaire
                    });
                }
            }
            
            if (pieces.length > 0) {
                concerts.push({
                    id: sectionId,
                    title,
                    pieces
                });
            }
        }
        
        return {
            concerts,
            timestamp: new Date().toISOString(),
            source: 'site-extraction'
        };
        
    } catch (error) {
        console.warn('⚠️ Erreur extraction données site:', error.message);
        return { concerts: [], timestamp: new Date().toISOString(), source: 'error' };
    }
}

/**
 * Recherche automatiquement les bases de données Notion partagées
 */
async function findNotionDatabases() {
    try {
        console.log('🔍 Recherche des bases de données Notion...');
        
        const response = await notion.search({
            filter: {
                property: 'object',
                value: 'database'
            }
        });
        
        // Mapper toutes les bases trouvées
        const allDatabases = response.results.map(db => ({
            id: db.id,
            title: getNotionTitle(db.title),
            url: db.url,
            properties: Object.keys(db.properties || {})
        }));
        
        // Filtrer seulement les bases autorisées - on autorise tout maintenant
        const databases = allDatabases.filter(db => {
            console.log(`🔍 "${db.title}" → AUTORISÉE ✅`);
            return true; // Autoriser toutes les bases temporairement
        });
        
        console.log(`🔍 ${allDatabases.length} base(s) trouvée(s) au total, ${databases.length} autorisée(s):`);
        databases.forEach(db => {
            console.log(`  📊 "${db.title}" (${db.properties.length} propriétés)`);
            console.log(`     ID: ${db.id}`);
            console.log(`     Propriétés: ${db.properties.join(', ')}`);
        });
        
        if (databases.length === 0) {
            console.warn('⚠️ Aucune base de données autorisée trouvée !');
            console.warn('📋 Bases autorisées:', CONFIG.allowedDatabases);
            console.warn('📋 Bases trouvées:', allDatabases.map(db => db.title));
        }
        
        return databases;
        
    } catch (error) {
        console.error('❌ Erreur recherche bases de données:', error.message);
        return [];
    }
}

/**
 * Synchronise les données depuis Notion
 */
async function synchronizeData(databases) {
    const results = {
        databases: databases.length,
        concerts: [],
        pieces: [],
        errors: []
    };
    
    for (const database of databases) {
        try {
            console.log(`🔄 Synchronisation: "${database.title}"`);
            
            // Récupérer les données de la base
            const pages = await queryNotionDatabase(database.id);
            
            // Analyser le type de données en fonction des propriétés
            const dataType = analyzeDataType(database.properties, pages);
            console.log(`📊 Type détecté: ${dataType}`);
            
            // Traiter selon le type
            if (dataType === 'concerts' || dataType === 'musical') {
                const concerts = await processConcertData(pages, database);
                results.concerts.push(...concerts);
            } else if (dataType === 'pieces') {
                const pieces = await processPieceData(pages, database);
                results.pieces.push(...pieces);
            } else {
                console.log(`⚠️ Type de données non reconnu pour "${database.title}"`);
            }
            
        } catch (error) {
            console.error(`❌ Erreur sync "${database.title}":`, error.message);
            results.errors.push({
                database: database.title,
                error: error.message
            });
        }
    }
    
    // Sauvegarder les résultats
    await saveResults(results);
    
    return results;
}

/**
 * Récupère les pages d'une base de données
 */
async function queryNotionDatabase(databaseId) {
    try {
        // D'abord, récupérer les métadonnées de la base pour détecter la colonne "Ordre"
        const database = await notion.databases.retrieve({ database_id: databaseId });
        const properties = database.properties;
        
        // Chercher une propriété "Ordre" (différentes variantes possibles)
        const orderProperty = Object.keys(properties).find(key => 
            key.toLowerCase().includes('ordre') || 
            key.toLowerCase().includes('order') ||
            key.toLowerCase() === 'ordre'
        );
        
        let sorts = [];
        
        if (orderProperty && properties[orderProperty].type === 'number') {
            // Utiliser la colonne Ordre si elle existe et est numérique
            console.log(`📊 Tri par colonne "${orderProperty}" détectée`);
            sorts = [
                {
                    property: orderProperty,
                    direction: 'ascending'
                }
            ];
        } else {
            // Fallback sur created_time si pas de colonne Ordre
            console.log(`⚠️ Pas de colonne "Ordre" trouvée, tri par created_time`);
            sorts = [
                {
                    timestamp: 'created_time',
                    direction: 'ascending'
                }
            ];
        }
        
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: sorts
        });
        
        return response.results;
        
    } catch (error) {
        console.error(`❌ Erreur requête base ${databaseId}:`, error.message);
        return [];
    }
}

/**
 * Analyse le type de données en fonction des propriétés
 */
function analyzeDataType(properties, pages) {
    const propNames = properties.map(p => p.toLowerCase());
    
    // Détecter les concerts/programmes
    if (propNames.some(p => p.includes('concert') || p.includes('programme') || p.includes('événement'))) {
        return 'concerts';
    }
    
    // Détecter les pièces musicales
    if (propNames.some(p => p.includes('titre') || p.includes('compositeur') || p.includes('durée'))) {
        return 'pieces';
    }
    
    // Détecter le financement
    if (propNames.some(p => p.includes('financement') || p.includes('budget') || p.includes('subvention'))) {
        return 'financing';
    }
    
    return 'unknown';
}

/**
 * Traite les données de concerts
 */
async function processConcertData(pages, database) {
    const concerts = [];
    const analysis = mapper.analyzeDatabaseStructure(database);
    
    for (const page of pages) {
        try {
            // Utiliser le smart mapper pour extraire les données
            const mappedData = mapper.mapNotionPage(page, analysis.detectedType);
            
            const concert = {
                id: generateSlug(mappedData.title || page.id),
                title: mappedData.title,
                date: mappedData.date,
                duration: mappedData.duration,
                description: mappedData.description || mappedData.info,
                pieces: [],
                source: {
                    notion: true,
                    database: database.title, // Utiliser le titre complet de la base
                    pageId: page.id,
                    lastModified: page.last_edited_time
                }
            };
            
            // Filtrer les valeurs vides (sauf source)
            Object.keys(concert).forEach(key => {
                if (key !== 'source' && key !== 'pieces' && (!concert[key] || concert[key] === '')) {
                    delete concert[key];
                }
            });
            
            if (concert.title) {
                concerts.push(concert);
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement concert:', error.message);
        }
    }
    
    console.log(`✅ ${concerts.length} concert(s) traité(s)`);
    return concerts;
}

/**
 * Traite les données de pièces musicales
 */
async function processPieceData(pages, database) {
    const pieces = [];
    const analysis = mapper.analyzeDatabaseStructure(database);
    
    // Détecter la colonne "Ordre" dans les pages elles-mêmes
    for (const page of pages) {
        try {
            // Utiliser le smart mapper pour extraire les données
            const mappedData = mapper.mapNotionPage(page, analysis.detectedType);
            
            // Chercher la propriété "Ordre" directement dans cette page
            const orderProperty = Object.keys(page.properties || {}).find(key => 
                key.toLowerCase().includes('ordre') || 
                key.toLowerCase().includes('order') ||
                key.toLowerCase() === 'ordre'
            );
            
            // Extraire la valeur de la colonne "Ordre" si elle existe
            let order = null;
            
            if (orderProperty && page.properties[orderProperty]) {
                const orderValue = getPropertyValue(page, orderProperty);
                
                if (orderValue !== null && orderValue !== undefined && orderValue !== '') {
                    order = typeof orderValue === 'number' ? orderValue : (parseInt(orderValue) || null);
                }
            }
            
            const piece = {
                title: mappedData.title,
                composer: mappedData.composer,
                duration: mappedData.duration,
                info: mappedData.info,
                concert: mappedData.concert,
                links: mappedData.links || {},
                source: {
                    notion: true,
                    database: database.title, // Utiliser le titre complet de la base
                    pageId: page.id,
                    lastModified: page.last_edited_time,
                    order: order // Ajouter l'ordre
                }
            };
            
            // Nettoyer les liens vides
            if (piece.links) {
                Object.keys(piece.links).forEach(key => {
                    if (!piece.links[key] || piece.links[key] === '') {
                        delete piece.links[key];
                    }
                });
                
                if (Object.keys(piece.links).length === 0) {
                    delete piece.links;
                }
            }
            
            // Filtrer les valeurs vides (sauf source et links)
            Object.keys(piece).forEach(key => {
                if (key !== 'source' && key !== 'links' && (!piece[key] || piece[key] === '')) {
                    delete piece[key];
                }
            });
            
            if (piece.title) {
                pieces.push(piece);
            }
            
        } catch (error) {
            console.error('❌ Erreur traitement pièce:', error.message);
        }
    }
    
    // Trier les pièces par ordre défini dans Notion (colonne "Ordre") puis par date si pas d'ordre
    pieces.sort((a, b) => {
        const orderA = a.source?.order;
        const orderB = b.source?.order;
        
        // Si les deux ont un ordre défini, trier par ordre
        if (orderA !== null && orderA !== undefined && orderB !== null && orderB !== undefined) {
            return orderA - orderB;
        }
        
        // Si seul A a un ordre, A vient en premier
        if (orderA !== null && orderA !== undefined) {
            return -1;
        }
        
        // Si seul B a un ordre, B vient en premier
        if (orderB !== null && orderB !== undefined) {
            return 1;
        }
        
        // Si aucun n'a d'ordre, fallback sur date de modification
        const dateA = a.source?.lastModified || a.source?.pageId || '0';
        const dateB = b.source?.lastModified || b.source?.pageId || '0';
        return dateA.localeCompare(dateB);
    });
    
    const orderedCount = pieces.filter(p => p.source?.order !== null && p.source?.order !== undefined).length;
    console.log(`✅ ${pieces.length} pièce(s) traitée(s) - ${orderedCount} avec ordre personnalisé`);
    return pieces;
}

/**
 * Sauvegarde les résultats
 */
async function saveResults(results) {
    try {
        // Sauvegarder les concerts
        if (results.concerts.length > 0) {
            await fs.writeFile(
                CONFIG.outputFiles.concerts,
                JSON.stringify({
                    concerts: results.concerts,
                    metadata: {
                        syncDate: new Date().toISOString(),
                        source: 'notion',
                        totalConcerts: results.concerts.length
                    }
                }, null, 2)
            );
            console.log(`💾 Concerts sauvegardés: ${CONFIG.outputFiles.concerts}`);
        }
        
        // Sauvegarder les pièces
        if (results.pieces.length > 0) {
            const piecesFile = 'data/pieces.json';
            await fs.writeFile(
                piecesFile,
                JSON.stringify({
                    pieces: results.pieces,
                    metadata: {
                        syncDate: new Date().toISOString(),
                        source: 'notion',
                        totalPieces: results.pieces.length
                    }
                }, null, 2)
            );
            console.log(`💾 Pièces sauvegardées: ${piecesFile} (${results.pieces.length} pièces)`);
        }
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error.message);
    }
}

/**
 * Génère un rapport de synchronisation
 */
function generateSyncReport(results) {
    console.log('\n📊 === RAPPORT DE SYNCHRONISATION ===');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`📊 Bases de données traitées: ${results.databases}`);
    console.log(`🎭 Concerts synchronisés: ${results.concerts.length}`);
    console.log(`🎵 Pièces synchronisées: ${results.pieces.length}`);
    
    if (results.errors.length > 0) {
        console.log(`❌ Erreurs: ${results.errors.length}`);
        results.errors.forEach(error => {
            console.log(`  - ${error.database}: ${error.error}`);
        });
    }
    
    console.log('=====================================\n');
}

/**
 * Utilitaires Notion
 */

function getNotionTitle(titleArray) {
    if (Array.isArray(titleArray) && titleArray.length > 0) {
        return titleArray[0].plain_text || '';
    }
    return '';
}

function getPropertyValue(page, propertyName) {
    const properties = page.properties || {};
    
    // Recherche insensible à la casse
    const key = Object.keys(properties).find(k => 
        k.toLowerCase() === propertyName.toLowerCase()
    );
    
    if (!key || !properties[key]) return '';
    
    const property = properties[key];
    
    switch (property.type) {
        case 'title':
            return property.title.map(t => t.plain_text).join('');
        case 'rich_text':
            return property.rich_text.map(t => t.plain_text).join('');
        case 'select':
            return property.select ? property.select.name : '';
        case 'date':
            return property.date ? property.date.start : '';
        case 'url':
            return property.url || '';
        case 'number':
            return property.number !== null && property.number !== undefined ? property.number : null;
        default:
            return '';
    }
}

function generateSlug(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
        .replace(/\s+/g, '-') // Remplacer espaces par tirets
        .replace(/--+/g, '-') // Éviter les tirets multiples
        .replace(/^-|-$/g, ''); // Supprimer tirets en début/fin
}

// Lancer le script
if (require.main === module) {
    main();
}

module.exports = {
    main,
    findNotionDatabases,
    synchronizeData
};
