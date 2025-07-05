#!/usr/bin/env node

/**
 * Script de test rapide pour vérifier la synchronisation Notion
 */

console.log('🧪 === TEST DE SYNCHRONISATION NOTION ===\n');

const testSteps = [
    {
        name: '1. Test de la connexion Notion',
        test: async () => {
            const { listAllDatabases } = require('./scripts/list-databases.js');
            const databases = await listAllDatabases();
            return databases.length === 8;
        }
    },
    {
        name: '2. Test de synchronisation des données',
        test: async () => {
            const { main } = require('./scripts/notion-sync.js');
            await main();
            
            // Vérifier que les fichiers ont été créés
            const fs = require('fs');
            const piecesExist = fs.existsSync('./data/pieces.json');
            const concertsExist = fs.existsSync('./data/concerts.json');
            
            return piecesExist && concertsExist;
        }
    },
    {
        name: '3. Test de mise à jour du site',
        test: async () => {
            const SiteUpdater = require('./scripts/update-site.js');
            const updater = new SiteUpdater();
            await updater.updateSite();
            
            return true;
        }
    },
    {
        name: '4. Vérification des données finales',
        test: async () => {
            const fs = require('fs').promises;
            
            try {
                const piecesData = JSON.parse(await fs.readFile('./data/pieces.json', 'utf8'));
                const concertsData = JSON.parse(await fs.readFile('./data/concerts.json', 'utf8'));
                
                console.log(`   📊 ${piecesData.pieces.length} pièces synchronisées`);
                console.log(`   🎭 ${concertsData.concerts.length} concerts synchronisés`);
                
                return piecesData.pieces.length > 0;
            } catch (error) {
                return false;
            }
        }
    }
];

async function runTests() {
    let successCount = 0;
    
    for (const step of testSteps) {
        try {
            console.log(`🔄 ${step.name}...`);
            const success = await step.test();
            
            if (success) {
                console.log(`✅ ${step.name} - RÉUSSI\n`);
                successCount++;
            } else {
                console.log(`❌ ${step.name} - ÉCHEC\n`);
            }
        } catch (error) {
            console.log(`❌ ${step.name} - ERREUR: ${error.message}\n`);
        }
    }
    
    console.log('🏁 === RÉSULTAT DES TESTS ===');
    console.log(`✅ ${successCount}/${testSteps.length} tests réussis`);
    
    if (successCount === testSteps.length) {
        console.log('🎉 Tous les tests sont passés ! Votre synchronisation Notion est opérationnelle.');
        console.log('🔄 La synchronisation automatique se fera toutes les 30 minutes.');
        console.log('🌐 Votre site sera toujours à jour avec vos données Notion.');
    } else {
        console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    }
    
    return successCount === testSteps.length;
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
