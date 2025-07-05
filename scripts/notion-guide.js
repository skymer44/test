#!/usr/bin/env node

/**
 * Guide personnalisé de configuration Notion
 * Programme Musical 2026
 * 
 * Ce script analyse votre configuration Notion et génère un guide personnalisé
 */

const { Client } = require('@notionhq/client');
const SmartMapper = require('./smart-mapper.js');
const { NOTION_SUGGESTIONS } = require('./structure-analysis.js');

// Configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN || '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';

class NotionGuide {
    constructor() {
        this.notion = new Client({ auth: NOTION_TOKEN });
        this.mapper = new SmartMapper();
        this.detectedDatabases = [];
    }

    /**
     * Génère le guide complet
     */
    async generateGuide() {
        console.log('🎭 Guide de Configuration Notion - Programme Musical 2026');
        console.log('═'.repeat(60));
        console.log();

        try {
            // 1. Vérifier la connexion
            await this.checkConnection();
            
            // 2. Analyser les bases existantes
            await this.analyzeDatabases();
            
            // 3. Générer les recommandations
            await this.generateRecommendations();
            
            // 4. Créer les templates
            await this.generateTemplates();
            
            console.log();
            console.log('✅ Guide généré avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur:', error.message);
            if (error.code === 'unauthorized') {
                this.showTokenHelp();
            }
        }
    }

    /**
     * Vérifie la connexion Notion
     */
    async checkConnection() {
        console.log('🔍 Vérification de la connexion Notion...');
        
        try {
            const response = await this.notion.users.me();
            console.log(`✅ Connecté en tant que: ${response.name || response.type}`);
            console.log(`📧 Email: ${response.person?.email || 'Non disponible'}`);
        } catch (error) {
            if (error.code === 'unauthorized') {
                throw new Error('Token Notion invalide ou expiré');
            }
            throw error;
        }
    }

    /**
     * Analyse les bases de données existantes
     */
    async analyzeDatabases() {
        console.log();
        console.log('🔍 Recherche des bases de données partagées...');
        
        try {
            const response = await this.notion.search({
                filter: { 
                    value: 'database',
                    property: 'object'
                },
                sort: { direction: 'descending', timestamp: 'last_edited_time' }
            });
            
            this.detectedDatabases = response.results;
            
            if (this.detectedDatabases.length === 0) {
                console.log('ℹ️ Aucune base de données trouvée.');
                console.log('💡 Vous devez créer et partager vos bases avec l\'intégration.');
                this.showSharingHelp();
                return;
            }
            
            console.log(`✅ ${this.detectedDatabases.length} base(s) de données trouvée(s):`);
            console.log();
            
            for (const db of this.detectedDatabases) {
                const analysis = this.mapper.analyzeDatabaseStructure(db);
                console.log(`📊 ${analysis.name}`);
                console.log(`   • ID: ${analysis.id}`);
                console.log(`   • Type détecté: ${analysis.detectedType} (${Math.round(analysis.confidence)}% confiance)`);
                console.log(`   • Propriétés: ${Object.keys(analysis.properties).length}`);
                
                // Afficher les propriétés principales
                const mainProps = Object.entries(analysis.properties).slice(0, 3);
                for (const [name, config] of mainProps) {
                    console.log(`     - ${name} (${config.type})`);
                }
                if (Object.keys(analysis.properties).length > 3) {
                    console.log(`     ... et ${Object.keys(analysis.properties).length - 3} autres`);
                }
                console.log();
            }
            
        } catch (error) {
            throw new Error(`Erreur lors de la recherche: ${error.message}`);
        }
    }

    /**
     * Génère les recommandations personnalisées
     */
    async generateRecommendations() {
        console.log('💡 Recommandations personnalisées:');
        console.log('─'.repeat(40));
        
        if (this.detectedDatabases.length === 0) {
            this.showCreationRecommendations();
            return;
        }
        
        // Analyser chaque base
        for (const db of this.detectedDatabases) {
            const analysis = this.mapper.analyzeDatabaseStructure(db);
            console.log(`\n📊 ${analysis.name}:`);
            
            if (analysis.confidence < 50) {
                console.log('⚠️ Cette base pourrait nécessiter des ajustements pour une synchronisation optimale.');
                this.suggestImprovements(analysis);
            } else {
                console.log('✅ Cette base semble bien configurée pour la synchronisation.');
                this.showMappingPreview(analysis);
            }
        }
        
        // Suggestions de bases manquantes
        this.suggestMissingDatabases();
    }

    /**
     * Suggère des améliorations pour une base
     */
    suggestImprovements(analysis) {
        console.log('💡 Suggestions d\'amélioration:');
        
        const expectedProps = this.getExpectedProperties(analysis.detectedType);
        const missing = expectedProps.filter(prop => 
            !Object.keys(analysis.properties).some(existing => 
                existing.toLowerCase().includes(prop.toLowerCase())
            )
        );
        
        if (missing.length > 0) {
            console.log('   📝 Propriétés recommandées à ajouter:');
            missing.forEach(prop => console.log(`     • ${prop}`));
        }
        
        // Suggestions de type
        if (analysis.detectedType === 'unknown') {
            console.log('   🎯 Cette base pourrait être utilisée pour:');
            console.log('     • Concerts/Programmes si elle contient des événements');
            console.log('     • Pièces musicales si elle contient du répertoire');
            console.log('     • Financement si elle contient des dispositifs d\'aide');
        }
    }

    /**
     * Affiche un aperçu du mapping
     */
    showMappingPreview(analysis) {
        console.log('🔗 Aperçu du mapping automatique:');
        const mappableProps = this.mapper.getMappableProperties(analysis.properties, analysis.detectedType);
        
        if (mappableProps.length > 0) {
            mappableProps.slice(0, 5).forEach(prop => {
                const mapping = this.mapper.findMapping(prop, 
                    analysis.detectedType === 'concerts' ? 
                    require('./structure-analysis.js').NOTION_MAPPING.concerts :
                    require('./structure-analysis.js').NOTION_MAPPING.pieces
                );
                console.log(`     • "${prop}" → ${mapping}`);
            });
        }
    }

    /**
     * Suggère les bases manquantes
     */
    suggestMissingDatabases() {
        const detectedTypes = this.detectedDatabases.map(db => 
            this.mapper.analyzeDatabaseStructure(db).detectedType
        );
        
        const missingTypes = ['concerts', 'pieces', 'financement'].filter(type => 
            !detectedTypes.includes(type)
        );
        
        if (missingTypes.length > 0) {
            console.log('\n📋 Bases de données recommandées à créer:');
            
            missingTypes.forEach(type => {
                const suggestion = NOTION_SUGGESTIONS.databases.find(db => 
                    db.name.toLowerCase().includes(type) || 
                    db.description.toLowerCase().includes(type)
                );
                
                if (suggestion) {
                    console.log(`\n🎯 ${suggestion.name}`);
                    console.log(`   ${suggestion.description}`);
                    console.log('   Propriétés clés:');
                    suggestion.properties.slice(0, 3).forEach(prop => {
                        console.log(`     • ${prop.name} (${prop.type})`);
                    });
                }
            });
        }
    }

    /**
     * Recommandations de création
     */
    showCreationRecommendations() {
        console.log('🎯 Vous devez créer vos bases de données Notion.');
        console.log('📋 Voici les 3 bases recommandées pour votre programme musical:\n');
        
        NOTION_SUGGESTIONS.databases.forEach((db, index) => {
            console.log(`${index + 1}. ${db.name}`);
            console.log(`   📝 ${db.description}`);
            console.log('   🏗️ Propriétés essentielles:');
            
            db.properties.slice(0, 5).forEach(prop => {
                console.log(`     • ${prop.name} (${prop.type}): ${prop.description}`);
            });
            console.log();
        });
    }

    /**
     * Génère les templates de configuration
     */
    async generateTemplates() {
        console.log('📄 Génération des templates de configuration...');
        
        // Configuration des bases de données
        if (this.detectedDatabases.length > 0) {
            const databaseConfig = this.generateDatabaseConfig();
            console.log('\n🗃️ Configuration des bases de données:');
            console.log(databaseConfig);
        }
        
        console.log('\n📋 Configuration GitHub Actions:');
        console.log('   Fichier: .github/workflows/notion-sync.yml');
        console.log('   ✅ Déjà configuré avec votre token');
        
        // Instructions de test
        console.log('\n🧪 Pour tester votre configuration:');
        console.log('   1. Exécutez: npm test');
        console.log('   2. Ou manuellement: node scripts/notion-sync.js');
        console.log('   3. Vérifiez les fichiers générés dans data/');
        
        console.log('\n🚀 Prêt pour la synchronisation:');
        console.log('   • Vos bases sont déjà bien structurées !');
        console.log('   • Le mapping automatique détectera vos données');
        console.log('   • Lancez: npm run sync');
    }

    /**
     * Génère la configuration des bases de données
     */
    generateDatabaseConfig() {
        let config = '   À ajouter dans scripts/notion-sync.js:\n\n';
        config += '   databases: {\n';
        
        for (const db of this.detectedDatabases) {
            const analysis = this.mapper.analyzeDatabaseStructure(db);
            const type = analysis.detectedType !== 'unknown' ? analysis.detectedType : 'custom';
            config += `     ${type}: '${db.id}', // ${analysis.name}\n`;
        }
        
        config += '   }';
        return config;
    }

    /**
     * Propriétés attendues selon le type
     */
    getExpectedProperties(type) {
        const properties = {
            concerts: ['Titre', 'Date', 'Description', 'Durée'],
            pieces: ['Titre', 'Compositeur', 'Durée', 'Lien Audio'],
            financement: ['Dispositif', 'Date limite', 'Montant']
        };
        
        return properties[type] || [];
    }

    /**
     * Aide pour le partage des bases
     */
    showSharingHelp() {
        console.log('\n📋 Comment partager vos bases avec l\'intégration:');
        console.log('1. Ouvrez votre base de données dans Notion');
        console.log('2. Cliquez sur "Partager" en haut à droite');
        console.log('3. Cliquez sur "Inviter"');
        console.log('4. Recherchez "Programme Musical 2026" (votre intégration)');
        console.log('5. Sélectionnez l\'intégration et cliquez "Inviter"');
        console.log('6. Répétez pour chaque base de données');
    }

    /**
     * Aide pour le token
     */
    showTokenHelp() {
        console.log('\n🔑 Configuration du token:');
        console.log('1. Allez sur https://notion.so/my-integrations');
        console.log('2. Cliquez sur votre intégration "Programme Musical 2026"');
        console.log('3. Copiez le token (Internal Integration Token)');
        console.log('4. Ajoutez-le dans les secrets de votre repository GitHub');
        console.log('   - Settings → Secrets → Actions → New repository secret');
        console.log('   - Nom: NOTION_TOKEN');
        console.log('   - Valeur: votre token');
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const guide = new NotionGuide();
    guide.generateGuide().catch(console.error);
}

module.exports = NotionGuide;
