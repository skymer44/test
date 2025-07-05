/**
 * Script de synchronisation Notion → Site Web (VERSION FILTRÉE)
 * Programme Musical 2026
 * 
 * Ce script récupère seulement les 4 bases de données souhaitées
 */

const { Client } = require('@notionhq/client');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    // Token d'intégration Notion
    notionToken: process.env.NOTION_TOKEN || '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',
    
    // FILTRE: Toutes les bases de données souhaitées par l'utilisateur
    allowedDatabases: [
        "Retour Karaoké",
        "Programme fête de la musique",
        "Insertion dans les 60 ans du Conservatoire ",
        "Concert du 11 d'avril avec Eric Aubier",
        "Ma région virtuose",
        "Pièces qui n'ont pas trouvé leur concert",
        "Pièces d'ajout sans direction",
        "Loto"
    ]
};

// Client Notion
const notion = new Client({
    auth: CONFIG.notionToken,
});

/**
 * Point d'entrée principal
 */
async function main() {
    try {
        console.log('🎵 === SYNCHRONISATION NOTION FILTRÉE ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
        
        if (!CONFIG.notionToken) {
            throw new Error('Token Notion manquant. Vérifiez la variable NOTION_TOKEN.');
        }
        
        // Rechercher les bases de données
        const databases = await findFilteredDatabases();
        
        console.log(`✅ ${databases.length} base(s) autorisée(s) trouvée(s) !`);
        
        if (databases.length > 0) {
            console.log('\n📊 Bases synchronisées:');
            databases.forEach(db => {
                console.log(`  ✅ "${db.title}"`);
                console.log(`     ID: ${db.id}`);
            });
        } else {
            console.warn('\n⚠️ Aucune base de données autorisée trouvée !');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

/**
 * Trouve et filtre les bases de données Notion
 */
async function findFilteredDatabases() {
    try {
        console.log('\n🔍 Recherche des bases de données Notion...');
        
        const response = await notion.search({
            filter: {
                property: 'object',
                value: 'database'
            }
        });
        
        // Mapper toutes les bases trouvées
        const allDatabases = response.results.map(db => ({
            id: db.id,
            title: db.title[0]?.plain_text || '',
            url: db.url,
            properties: Object.keys(db.properties || {})
        }));
        
        console.log(`📊 ${allDatabases.length} base(s) de données trouvée(s) au total`);
        
        // Filtrer seulement les bases autorisées
        const filteredDatabases = allDatabases.filter(db => {
            const isAllowed = CONFIG.allowedDatabases.includes(db.title);
            console.log(`🔍 "${db.title}" → ${isAllowed ? 'AUTORISÉE ✅' : 'IGNORÉE ⏭️'}`);
            return isAllowed;
        });
        
        console.log(`\n📋 Résultat: ${filteredDatabases.length}/${allDatabases.length} bases autorisées`);
        
        return filteredDatabases;
        
    } catch (error) {
        console.error('❌ Erreur lors de la recherche:', error.message);
        return [];
    }
}

// Exécuter le script
if (require.main === module) {
    main();
}

module.exports = { main, findFilteredDatabases };
