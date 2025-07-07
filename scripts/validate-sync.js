#!/usr/bin/env node

/**
 * Script de validation de synchronisation
 * S'assure que les fichiers source (/src/) et de destination (racine) sont identiques
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SyncValidator {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.srcDir = path.join(this.rootDir, 'src');
        this.errors = [];
        this.warnings = [];
    }

    async calculateFileHash(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    async validateFile(filename) {
        const srcFile = path.join(this.srcDir, filename);
        const rootFile = path.join(this.rootDir, filename);

        const srcHash = await this.calculateFileHash(srcFile);
        const rootHash = await this.calculateFileHash(rootFile);

        if (!srcHash) {
            this.warnings.push(`⚠️ Fichier source manquant: src/${filename}`);
            return false;
        }

        if (!rootHash) {
            this.warnings.push(`⚠️ Fichier de destination manquant: ${filename}`);
            return false;
        }

        if (srcHash !== rootHash) {
            this.errors.push(`❌ Désynchronisation détectée: ${filename}`);
            this.errors.push(`   Source (src/${filename}): ${srcHash}`);
            this.errors.push(`   Destination (${filename}): ${rootHash}`);
            return false;
        }

        console.log(`✅ ${filename} synchronisé`);
        return true;
    }

    async validateAssetSync() {
        console.log('🔍 === VALIDATION DE SYNCHRONISATION ===\n');

        const filesToCheck = ['script.js', 'styles.css'];
        let allSynced = true;

        for (const filename of filesToCheck) {
            const synced = await this.validateFile(filename);
            if (!synced) {
                allSynced = false;
            }
        }

        return allSynced;
    }

    async validateContent() {
        console.log('\n🔍 === VALIDATION DU CONTENU ===\n');

        const scriptContent = await fs.readFile(path.join(this.rootDir, 'script.js'), 'utf8');
        
        // Vérifier que le titre redondant n'existe plus
        if (scriptContent.includes('class="event-title"')) {
            this.errors.push('❌ Titre redondant détecté: classe "event-title" encore présente');
        } else {
            console.log('✅ Titre redondant supprimé');
        }

        // Vérifier que "Dans" est en minuscule
        if (scriptContent.includes('<span>Dans</span>')) {
            this.errors.push('❌ Majuscule détectée: "Dans" au lieu de "dans"');
        } else {
            console.log('✅ "dans" en minuscule correctement appliqué');
        }

        // Vérifier la structure de l'event-meta
        if (scriptContent.includes('📅 ${formatEventDate(event.date)} - dans')) {
            console.log('✅ Structure event-meta correcte');
        } else {
            this.errors.push('❌ Structure event-meta incorrecte');
        }
    }

    async run() {
        console.log('🎵 === VALIDATION COMPLÈTE DU SITE ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}\n`);

        // 1. Validation de la synchronisation des fichiers
        const filesSynced = await this.validateAssetSync();

        // 2. Validation du contenu
        await this.validateContent();

        // 3. Rapport final
        console.log('\n📊 === RAPPORT DE VALIDATION ===');
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ AVERTISSEMENTS:');
            this.warnings.forEach(warning => console.log(warning));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ ERREURS DÉTECTÉES:');
            this.errors.forEach(error => console.log(error));
            console.log('\n🔧 Action requise: Exécutez "npm run fix-sync" pour corriger');
            process.exit(1);
        } else {
            console.log('\n✅ Validation réussie - Tous les fichiers sont synchronisés et corrects');
        }
    }
}

// Exécution du script
if (require.main === module) {
    const validator = new SyncValidator();
    validator.run().catch(error => {
        console.error('💥 Erreur de validation:', error.message);
        process.exit(1);
    });
}

module.exports = SyncValidator;
