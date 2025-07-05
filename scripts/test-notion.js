#!/usr/bin/env node

/**
 * Script de test pour la configuration Notion
 * Programme Musical 2026
 */

const { Client } = require('@notionhq/client');
const SmartMapper = require('./smart-mapper.js');

const NOTION_TOKEN = process.env.NOTION_TOKEN || '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';

class NotionTester {
    constructor() {
        this.notion = new Client({ auth: NOTION_TOKEN });
        this.mapper = new SmartMapper();
        this.results = {
            connection: false,
            databases: [],
            mapping: {},
            errors: []
        };
    }

    /**
     * Lance tous les tests
     */
    async runAllTests() {
        console.log('🧪 Tests de Configuration Notion');
        console.log('═'.repeat(40));
        console.log();

        const tests = [
            { name: 'Connexion Notion', fn: () => this.testConnection() },
            { name: 'Découverte des bases', fn: () => this.testDatabaseDiscovery() },
            { name: 'Analyse du mapping', fn: () => this.testMapping() },
            { name: 'Test de synchronisation', fn: () => this.testSync() }
        ];

        for (const test of tests) {
            try {
                console.log(`🔍 ${test.name}...`);
                await test.fn();
                console.log(`✅ ${test.name} - OK`);
            } catch (error) {
                console.log(`❌ ${test.name} - ÉCHEC`);
                console.log(`   Erreur: ${error.message}`);
                this.results.errors.push({ test: test.name, error: error.message });
            }
            console.log();
        }

        this.generateReport();
    }

    /**
     * Test de connexion
     */
    async testConnection() {
        const response = await this.notion.users.me();
        this.results.connection = true;
        console.log(`   👤 Utilisateur: ${response.name || response.type}`);
        
        if (response.person?.email) {
            console.log(`   📧 Email: ${response.person.email}`);
        }
    }

    /**
     * Test de découverte des bases
     */
    async testDatabaseDiscovery() {
        const response = await this.notion.search({
            filter: { 
                value: 'database',
                property: 'object'
            },
            sort: { direction: 'descending', timestamp: 'last_edited_time' }
        });

        this.results.databases = response.results;
        console.log(`   📊 ${response.results.length} base(s) trouvée(s)`);

        if (response.results.length === 0) {
            throw new Error('Aucune base de données trouvée. Créez et partagez vos bases avec l\'intégration.');
        }

        // Analyser chaque base
        for (const db of response.results) {
            const analysis = this.mapper.analyzeDatabaseStructure(db);
            console.log(`   • ${analysis.name} (${analysis.detectedType}, ${Math.round(analysis.confidence)}% confiance)`);
        }
    }

    /**
     * Test du mapping automatique
     */
    async testMapping() {
        if (this.results.databases.length === 0) {
            throw new Error('Aucune base à tester');
        }

        for (const db of this.results.databases) {
            const analysis = this.mapper.analyzeDatabaseStructure(db);
            
            // Test de récupération des données
            const queryResponse = await this.notion.databases.query({
                database_id: db.id,
                page_size: 1
            });

            if (queryResponse.results.length > 0) {
                const samplePage = queryResponse.results[0];
                const mappedData = this.mapper.mapNotionPage(samplePage, analysis.detectedType);
                
                this.results.mapping[db.id] = {
                    databaseName: analysis.name,
                    type: analysis.detectedType,
                    confidence: analysis.confidence,
                    sampleData: mappedData,
                    totalPages: queryResponse.results.length
                };

                console.log(`   🔗 ${analysis.name}: ${Object.keys(mappedData).length} propriété(s) mappée(s)`);
                
                // Afficher un échantillon
                const keys = Object.keys(mappedData).slice(0, 3);
                keys.forEach(key => {
                    const value = mappedData[key];
                    const displayValue = typeof value === 'object' ? JSON.stringify(value).substring(0, 30) + '...' : String(value).substring(0, 30);
                    console.log(`     • ${key}: ${displayValue}`);
                });
            } else {
                console.log(`   ℹ️ ${analysis.name}: Base vide, impossible de tester le mapping`);
            }
        }
    }

    /**
     * Test de synchronisation (mode test)
     */
    async testSync() {
        console.log('   🔄 Test de synchronisation en mode lecture seule...');
        
        let totalPages = 0;
        let totalMapped = 0;

        for (const db of this.results.databases) {
            const analysis = this.mapper.analyzeDatabaseStructure(db);
            
            const queryResponse = await this.notion.databases.query({
                database_id: db.id,
                page_size: 10 // Limite pour le test
            });

            totalPages += queryResponse.results.length;

            for (const page of queryResponse.results) {
                const mappedData = this.mapper.mapNotionPage(page, analysis.detectedType);
                if (Object.keys(mappedData).length > 0) {
                    totalMapped++;
                }
            }
        }

        console.log(`   📄 ${totalPages} page(s) analysée(s)`);
        console.log(`   ✅ ${totalMapped} page(s) mappée(s) avec succès`);

        if (totalMapped === 0 && totalPages > 0) {
            throw new Error('Aucune donnée n\'a pu être mappée. Vérifiez la structure de vos bases.');
        }
    }

    /**
     * Génère le rapport de test
     */
    generateReport() {
        console.log('📋 Rapport de Test');
        console.log('═'.repeat(40));
        console.log();

        // Résumé général
        const totalTests = 4;
        const passedTests = totalTests - this.results.errors.length;
        const successRate = (passedTests / totalTests) * 100;

        console.log(`🎯 Résultat: ${passedTests}/${totalTests} tests réussis (${Math.round(successRate)}%)`);
        console.log();

        // État de la connexion
        if (this.results.connection) {
            console.log('✅ Connexion Notion: Opérationnelle');
        } else {
            console.log('❌ Connexion Notion: Échec');
        }

        // État des bases de données
        console.log(`📊 Bases de données: ${this.results.databases.length} trouvée(s)`);
        if (this.results.databases.length > 0) {
            Object.values(this.results.mapping).forEach(mapping => {
                const status = mapping.confidence > 50 ? '✅' : '⚠️';
                console.log(`   ${status} ${mapping.databaseName} (${mapping.type}, ${Math.round(mapping.confidence)}% confiance)`);
            });
        }

        // Erreurs
        if (this.results.errors.length > 0) {
            console.log();
            console.log('❌ Erreurs rencontrées:');
            this.results.errors.forEach(error => {
                console.log(`   • ${error.test}: ${error.error}`);
            });
        }

        // Recommandations
        console.log();
        this.generateRecommendations();
    }

    /**
     * Génère des recommandations
     */
    generateRecommendations() {
        console.log('💡 Recommandations:');
        
        if (!this.results.connection) {
            console.log('   🔑 Vérifiez votre token Notion');
            return;
        }

        if (this.results.databases.length === 0) {
            console.log('   📋 Créez vos bases de données dans Notion');
            console.log('   🔗 Partagez-les avec votre intégration');
            console.log('   ℹ️ Utilisez: npm run guide pour des instructions détaillées');
            return;
        }

        // Recommandations par base
        const lowConfidenceDbs = Object.values(this.results.mapping)
            .filter(mapping => mapping.confidence < 50);

        if (lowConfidenceDbs.length > 0) {
            console.log('   ⚠️ Bases à améliorer:');
            lowConfidenceDbs.forEach(mapping => {
                console.log(`     • ${mapping.databaseName}: Ajoutez des propriétés standards`);
            });
        }

        // Recommandations générales
        const hasContent = Object.values(this.results.mapping)
            .some(mapping => mapping.totalPages > 0);

        if (!hasContent) {
            console.log('   📝 Ajoutez du contenu dans vos bases de données');
        }

        if (this.results.errors.length === 0) {
            console.log('   🚀 Configuration prête ! Vous pouvez lancer: npm run sync');
        }
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const tester = new NotionTester();
    tester.runAllTests().catch(console.error);
}

module.exports = NotionTester;
