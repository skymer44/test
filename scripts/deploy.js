#!/usr/bin/env node

/**
 * 🚀 Script de Déploiement Intelligent
 * 
 * Ce script gère le déploiement en séparant :
 * - Le développement (modifications de /src/)
 * - Les données (synchronisation de /data/)
 * - Le build (génération de /build/)
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class IntelligentDeployer {
    constructor() {
        this.srcDir = path.join(__dirname, '..', 'src');
        this.dataDir = path.join(__dirname, '..', 'data');
        this.buildDir = path.join(__dirname, '..', 'build');
    }

    async deploy() {
        console.log('🚀 === DÉPLOIEMENT INTELLIGENT ===');
        
        try {
            // 1. Construire le site
            console.log('🏗️ Construction du site...');
            execSync('node scripts/site-builder.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            
            // 2. Déployer vers la racine pour GitHub Pages
            console.log('📁 Déploiement des fichiers...');
            await this.deployFiles();
            
            // 3. TOUJOURS commiter et pusher (pour les données et changements)
            console.log('📤 Commit et push...');
            await this.commitAndPush();
            
            console.log('✅ Déploiement réussi !');
            
        } catch (error) {
            console.error('❌ Erreur lors du déploiement:', error.message);
            throw error;
        }
    }

    async checkForChanges() {
        try {
            // Comparer build/index.html avec index.html actuel
            const buildPath = path.join(this.buildDir, 'index.html');
            const currentPath = path.join(__dirname, '..', 'index.html');
            
            const buildContent = await fs.readFile(buildPath, 'utf8');
            
            try {
                const currentContent = await fs.readFile(currentPath, 'utf8');
                
                // Comparer les contenus (en ignorant les espaces)
                const buildNormalized = buildContent.replace(/\s+/g, ' ').trim();
                const currentNormalized = currentContent.replace(/\s+/g, ' ').trim();
                
                return buildNormalized !== currentNormalized;
            } catch (error) {
                // Si le fichier n'existe pas, il y a forcément des changements
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Impossible de vérifier les changements:', error.message);
            return true; // En cas d'erreur, on déploie
        }
    }

    async deployFiles() {
        try {
            // Copier build/index.html vers la racine
            const buildIndexPath = path.join(this.buildDir, 'index.html');
            const rootIndexPath = path.join(__dirname, '..', 'index.html');
            await fs.copyFile(buildIndexPath, rootIndexPath);
            
            // Copier les assets si nécessaires (ils sont déjà en place)
            console.log('📄 index.html déployé depuis /build/');
            
        } catch (error) {
            throw new Error(`Erreur lors du déploiement des fichiers: ${error.message}`);
        }
    }

    async commitAndPush() {
        try {
            const timestamp = new Date().toLocaleString('fr-FR');
            
            // Git add - ajouter tous les fichiers nécessaires
            execSync('git add index.html script.js styles.css data/ src/ build/', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            
            // Vérifier s'il y a quelque chose à commiter
            let hasChangesToCommit = false;
            try {
                execSync('git diff --staged --quiet', { cwd: path.join(__dirname, '..') });
                console.log('ℹ️ Aucun changement de code à commiter');
            } catch (error) {
                // Il y a des changements, on les commite
                hasChangesToCommit = true;
                const commitMessage = `🎵 Mise à jour site - ${timestamp}`;
                execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
                console.log('✅ Changements committés');
            }
            
            // TOUJOURS faire le push (pour s'assurer que tout est à jour)
            console.log('📤 Push vers GitHub...');
            execSync('git push origin main', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
            console.log('✅ Push réussi !');
            
        } catch (error) {
            throw new Error(`Erreur lors du commit/push: ${error.message}`);
        }
    }
}

// Fonction principale
async function main() {
    const deployer = new IntelligentDeployer();
    await deployer.deploy();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = IntelligentDeployer;
