/**
 * 🧪 Outil de test avancé pour la synchronisation Notion
 * 
 * Teste spécifiquement la récupération et le traitement des données
 */

window.testNotionSync = async function() {
    console.log('🧪 === TEST SYNCHRONISATION NOTION ===');
    console.log('');
    
    try {
        // Test 1: Vérification de la configuration
        console.log('📋 Configuration actuelle:');
        console.log('Token:', NOTION_CONFIG.token.substring(0, 20) + '...');
        console.log('Bases configurées:', Object.keys(NOTION_CONFIG.databases));
        console.log('');
        
        // Test 2: Création de l'instance NotionSync
        console.log('🔧 Création de l\'instance NotionSync...');
        const notionSync = new NotionSync(NOTION_CONFIG);
        console.log('✅ Instance créée');
        console.log('');
        
        // Test 3: Test de récupération pour chaque base
        console.log('📊 Test de récupération pour chaque base:');
        const allResults = {};
        
        for (const [sectionKey, databaseId] of Object.entries(NOTION_CONFIG.databases)) {
            console.log(`\n🔍 Test "${sectionKey}" (${databaseId}):`);
            
            try {
                const data = await notionSync.fetchDatabase(databaseId);
                allResults[sectionKey] = data;
                console.log(`   ✅ ${data.length} éléments récupérés`);
                
                if (data.length > 0) {
                    console.log(`   📝 Premier élément:`, data[0]);
                }
            } catch (error) {
                console.error(`   ❌ Erreur:`, error);
                allResults[sectionKey] = [];
            }
        }
        
        // Test 4: Test de génération HTML
        console.log('\n🎨 Test de génération HTML:');
        for (const [sectionKey, data] of Object.entries(allResults)) {
            if (data.length > 0) {
                try {
                    const html = notionSync.generateSectionHTML(data, sectionKey, `Test ${sectionKey}`);
                    console.log(`   ✅ HTML généré pour "${sectionKey}" (${html.length} caractères)`);
                } catch (error) {
                    console.error(`   ❌ Erreur génération HTML pour "${sectionKey}":`, error);
                }
            } else {
                console.log(`   ⚪ "${sectionKey}" vide - pas de HTML à générer`);
            }
        }
        
        // Test 5: Résumé
        console.log('\n📊 === RÉSUMÉ DES TESTS ===');
        const totalElements = Object.values(allResults).reduce((sum, data) => sum + data.length, 0);
        console.log(`Total d'éléments récupérés: ${totalElements}`);
        
        Object.entries(allResults).forEach(([section, data]) => {
            console.log(`   ${section}: ${data.length} éléments`);
        });
        
        return allResults;
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return null;
    }
};

window.testSpecificDatabase = async function(databaseKey) {
    console.log(`🔬 === TEST SPÉCIFIQUE: ${databaseKey} ===`);
    console.log('');
    
    const databaseId = NOTION_CONFIG.databases[databaseKey];
    if (!databaseId) {
        console.error(`❌ Base "${databaseKey}" non trouvée dans la configuration`);
        return;
    }
    
    console.log(`🔍 ID de la base: ${databaseId}`);
    
    try {
        // Test direct de l'API
        console.log('📡 Test direct de l\'API...');
        const response = await fetch(`http://localhost:3001/notion/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_CONFIG.token}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                page_size: 100
            })
        });
        
        console.log(`📊 Statut de la réponse: ${response.status}`);
        
        if (response.ok) {
            const rawData = await response.json();
            console.log('📋 Données brutes reçues:', rawData);
            console.log(`📊 Nombre de résultats: ${rawData.results?.length || 0}`);
            
            if (rawData.results && rawData.results.length > 0) {
                console.log('🔍 Premier élément brut:', rawData.results[0]);
                console.log('🏗️ Propriétés du premier élément:', rawData.results[0].properties);
            }
            
            // Test de formatage
            console.log('\n🎨 Test de formatage...');
            const notionSync = new NotionSync(NOTION_CONFIG);
            const formattedData = notionSync.formatData(rawData.results);
            console.log('✅ Données formatées:', formattedData);
            
        } else {
            const errorText = await response.text();
            console.error('❌ Erreur API:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
};

console.log('🧪 Outils de test avancés chargés !');
console.log('💡 Commandes disponibles:');
console.log('   testNotionSync() - Test complet de la synchronisation');
console.log('   testSpecificDatabase("nom-base") - Test d\'une base spécifique');
console.log('   Exemple: testSpecificDatabase("ma-region-virtuose")');
