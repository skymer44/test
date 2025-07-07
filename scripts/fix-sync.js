#!/usr/bin/env node

/**
 * Script de correction automatique
 * Synchronise automatiquement les fichiers depuis /src/ vers la racine
 */

const fs = require('fs').promises;
const path = require('path');

class SyncFixer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.srcDir = path.join(this.rootDir, 'src');
    }

    async copyFile(filename) {
        const srcFile = path.join(this.srcDir, filename);
        const rootFile = path.join(this.rootDir, filename);

        try {
            await fs.copyFile(srcFile, rootFile);
            console.log(`✅ ${filename} copié depuis src/`);
            return true;
        } catch (error) {
            console.error(`❌ Erreur lors de la copie de ${filename}:`, error.message);
            return false;
        }
    }

    async fixSync() {
        console.log('🔧 === CORRECTION DE SYNCHRONISATION ===\n');

        const filesToSync = ['script.js', 'styles.css'];
        let allFixed = true;

        for (const filename of filesToSync) {
            const fixed = await this.copyFile(filename);
            if (!fixed) {
                allFixed = false;
            }
        }

        if (allFixed) {
            console.log('\n✅ Synchronisation corrigée avec succès !');
            console.log('💡 Conseil: Relancez "npm run validate" pour confirmer');
        } else {
            console.log('\n❌ Certains fichiers n\'ont pas pu être synchronisés');
            process.exit(1);
        }
    }

    async run() {
        console.log('🎵 === CORRECTION AUTOMATIQUE ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}\n`);

        await this.fixSync();
    }
}

// Exécution du script
if (require.main === module) {
    const fixer = new SyncFixer();
    fixer.run().catch(error => {
        console.error('💥 Erreur de correction:', error.message);
        process.exit(1);
    });
}

module.exports = SyncFixer;
