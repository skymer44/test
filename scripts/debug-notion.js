#!/usr/bin/env node

/**
 * Script de débogage pour analyser une base Notion spécifique
 */

const { Client } = require('@notionhq/client');
const SmartMapper = require('./smart-mapper.js');

const NOTION_TOKEN = process.env.NOTION_TOKEN || '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';

async function debugDatabase() {
    const notion = new Client({ auth: NOTION_TOKEN });
    const mapper = new SmartMapper();
    
    // ID de la base "Programme fête de la musique" qui a du contenu d'après les tests
    const databaseId = '223fcf9e-3abc-80d0-bc96-e6a5c9b64df5';
    
    console.log('🔍 Débogage de la base: Programme fête de la musique');
    console.log('ID:', databaseId);
    console.log();
    
    try {
        // 1. Récupérer les métadonnées de la base
        console.log('📊 Métadonnées de la base:');
        const database = await notion.databases.retrieve({ database_id: databaseId });
        console.log('Nom:', database.title[0]?.plain_text);
        console.log('Propriétés:', Object.keys(database.properties).length);
        Object.entries(database.properties).forEach(([name, prop]) => {
            console.log(`  • ${name} (${prop.type})`);
        });
        console.log();
        
        // 2. Requête avec différents paramètres
        console.log('📄 Test de requêtes:');
        
        // Requête basique
        console.log('1. Requête basique...');
        const basicQuery = await notion.databases.query({
            database_id: databaseId
        });
        console.log(`   Résultats: ${basicQuery.results.length} pages`);
        
        // Requête avec limite
        console.log('2. Requête avec limite 100...');
        const limitQuery = await notion.databases.query({
            database_id: databaseId,
            page_size: 100
        });
        console.log(`   Résultats: ${limitQuery.results.length} pages`);
        console.log();
        
        // 3. Analyser une page si disponible
        if (limitQuery.results.length > 0) {
            console.log('🔍 Analyse de la première page:');
            const firstPage = limitQuery.results[0];
            console.log('ID:', firstPage.id);
            console.log('Créé:', firstPage.created_time);
            console.log('Modifié:', firstPage.last_edited_time);
            console.log();
            
            console.log('📝 Propriétés de la page:');
            for (const [name, prop] of Object.entries(firstPage.properties)) {
                const value = mapper.extractNotionValue(prop);
                console.log(`  • ${name}: ${JSON.stringify(value)}`);
            }
            console.log();
            
            // Test du mapping
            console.log('🔗 Test du mapping:');
            const analysis = mapper.analyzeDatabaseStructure(database);
            const mappedData = mapper.mapNotionPage(firstPage, analysis.detectedType);
            console.log('Données mappées:', JSON.stringify(mappedData, null, 2));
        } else {
            console.log('⚠️ Aucune page trouvée dans cette base.');
            console.log('Vérifications possibles:');
            console.log('1. La base contient-elle des données ?');
            console.log('2. L\'intégration a-t-elle accès en lecture ?');
            console.log('3. Y a-t-il des filtres sur la base ?');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.code) {
            console.error('Code:', error.code);
        }
    }
}

// Test avec toutes les bases qui ont du contenu d'après les tests
async function debugAllBases() {
    const notion = new Client({ auth: NOTION_TOKEN });
    
    const basesWithContent = [
        { id: '223fcf9e-3abc-80d0-bc96-e6a5c9b64df5', name: 'Programme fête de la musique' },
        { id: '21efcf9e-3abc-80b6-8ba7-cedabb1ba43e', name: 'Concert du 11 d\'avril avec Eric Aubier' },
        { id: '223fcf9e-3abc-80c9-9557-c6eaca292645', name: 'Ma région virtuose' },
        { id: '226fcf9e-3abc-80d3-ae67-d880ad2b1ef6', name: 'Pièces qui n\'ont pas trouvé leur concert' }
    ];
    
    console.log('🔍 Test rapide de toutes les bases avec contenu:');
    console.log();
    
    for (const base of basesWithContent) {
        try {
            const result = await notion.databases.query({
                database_id: base.id,
                page_size: 5
            });
            console.log(`📊 ${base.name}: ${result.results.length} page(s)`);
            
            if (result.results.length > 0) {
                const firstPage = result.results[0];
                const titleProp = Object.values(firstPage.properties).find(p => p.type === 'title');
                if (titleProp) {
                    const title = titleProp.title.map(t => t.plain_text).join('');
                    console.log(`   Premier élément: "${title}"`);
                }
            }
        } catch (error) {
            console.log(`❌ ${base.name}: Erreur - ${error.message}`);
        }
    }
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--all')) {
        await debugAllBases();
    } else {
        await debugDatabase();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { debugDatabase, debugAllBases };
