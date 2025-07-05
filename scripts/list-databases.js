/**
 * Script pour lister toutes les bases de données Notion disponibles
 * et aider à identifier les noms exacts
 */

const { Client } = require('@notionhq/client');

// Configuration
const NOTION_TOKEN = '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';

const notion = new Client({
    auth: NOTION_TOKEN,
});

async function listAllDatabases() {
    try {
        console.log('🔍 === LISTE DES BASES DE DONNÉES NOTION ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}\n`);
        
        const response = await notion.search({
            filter: {
                property: 'object',
                value: 'database'
            }
        });
        
        console.log(`📊 ${response.results.length} base(s) de données trouvée(s):\n`);
        
        response.results.forEach((db, index) => {
            const title = getNotionTitle(db.title);
            const properties = Object.keys(db.properties || {});
            
            console.log(`${index + 1}. "${title}"`);
            console.log(`   🆔 ID: ${db.id}`);
            console.log(`   🔗 URL: ${db.url}`);
            console.log(`   📋 Propriétés (${properties.length}): ${properties.join(', ')}`);
            console.log(`   📅 Créé: ${new Date(db.created_time).toLocaleDateString('fr-FR')}`);
            console.log(`   ✏️ Modifié: ${new Date(db.last_edited_time).toLocaleDateString('fr-FR')}`);
            console.log(`   📏 Longueur du nom: ${title.length} caractères`);
            
            // Analyser les caractères spéciaux
            if (title.includes("'") || title.includes("'")) {
                console.log(`   ⚠️ Contient des apostrophes spéciales`);
            }
            if (title.trim() !== title) {
                console.log(`   ⚠️ Contient des espaces en début/fin`);
            }
            
            console.log('');
        });
        
        // Suggérer la liste pour la configuration
        console.log('📝 === CONFIGURATION SUGGÉRÉE ===');
        console.log('allowedDatabases: [');
        response.results.forEach(db => {
            const title = getNotionTitle(db.title);
            console.log(`    "${title}",`);
        });
        console.log(']');
        
        return response.results;
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des bases:', error.message);
        if (error.code === 'unauthorized') {
            console.error('🔑 Vérifiez que votre token Notion est correct et que les bases sont partagées avec l\'intégration');
        }
        return [];
    }
}

function getNotionTitle(titleArray) {
    if (Array.isArray(titleArray) && titleArray.length > 0) {
        return titleArray[0].plain_text || '';
    }
    return '';
}

// Lancer le script
if (require.main === module) {
    listAllDatabases();
}

module.exports = { listAllDatabases };
