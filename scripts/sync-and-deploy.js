#!/usr/bin/env node

/**
 * 🚀 SYNC & DEPLOY AUTOMATIQUE
 * 
 * Script tout-en-un qui :
 * 1. Synchronise les données Notion
 * 2. Commit les changements
 * 3. Push vers GitHub
 * 4. Déclenche le déploiement
 * 
 * Usage: npm run deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoDeployer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.logFile = path.join(this.rootDir, 'deploy.log');
    }

    log(message, isError = false) {
        const timestamp = new Date().toLocaleString('fr-FR');
        const prefix = isError ? '❌' : '✅';
        const logMessage = `${prefix} [${timestamp}] ${message}`;
        
        console.log(logMessage);
        
        // Écrire aussi dans un fichier de log
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async deploy() {
        try {
            this.log('🚀 DÉMARRAGE DU DÉPLOIEMENT AUTOMATIQUE');
            
            // 1. Nettoyer les logs précédents
            if (fs.existsSync(this.logFile)) {
                fs.unlinkSync(this.logFile);
            }
            
            // 2. Synchroniser Notion
            this.log('📊 Étape 1/5: Synchronisation Notion...');
            await this.syncNotion();
            
            // 3. Optimiser GitHub Pages pour les données Notion
            this.log('🔧 Étape 3/6: Optimisation GitHub Pages...');
            await this.optimizeGitHubPages();
            
            // 4. Vérifier s'il y a des changements
            this.log('🔍 Étape 4/6: Vérification des changements...');
            const hasChanges = await this.checkChanges();
            
            if (!hasChanges) {
                this.log('ℹ️ Aucun changement détecté. Déploiement non nécessaire.');
                return;
            }
            
            // 5. Commit des changements
            this.log('💾 Étape 5/6: Commit des changements...');
            await this.commitChanges();
            
            // 6. Push vers GitHub
            this.log('⬆️ Étape 6/6: Push vers GitHub...');
            await this.pushToGitHub();
            
            // 7. Vérification finale
            this.log('✅ Étape 7/7: Vérification du déploiement...');
            await this.verifyDeployment();
            
            this.log('🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !');
            this.showSummary();
            
        } catch (error) {
            this.log(`Erreur lors du déploiement: ${error.message}`, true);
            console.error('\n📋 Détails de l\'erreur:');
            console.error(error);
            process.exit(1);
        }
    }

    async syncNotion() {
        try {
            const result = execSync('npm run sync', { 
                cwd: this.rootDir, 
                encoding: 'utf8',
                timeout: 60000 // 1 minute max
            });
            
            // Extraire les statistiques du résultat
            const lines = result.split('\n');
            const piecesLine = lines.find(line => line.includes('Pièces synchronisées:'));
            const eventsLine = lines.find(line => line.includes('Événements synchronisés:'));
            
            if (piecesLine && eventsLine) {
                this.log(`Sync réussie: ${piecesLine.match(/\d+/)?.[0] || '0'} pièces, ${eventsLine.match(/\d+/)?.[0] || '0'} événements`);
            } else {
                this.log('Synchronisation Notion terminée');
            }
            
        } catch (error) {
            throw new Error(`Échec synchronisation Notion: ${error.message}`);
        }
    }

    async checkChanges() {
        try {
            const status = execSync('git status --porcelain', { 
                cwd: this.rootDir, 
                encoding: 'utf8' 
            });
            
            if (status.trim() === '') {
                return false;
            }
            
            // Lister les fichiers modifiés
            const changedFiles = status.trim().split('\n').map(line => {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                return { status, file };
            });
            
            this.log(`${changedFiles.length} fichier(s) modifié(s):`);
            changedFiles.forEach(({ status, file }) => {
                const statusIcon = status.includes('M') ? '📝' : 
                                 status.includes('A') ? '➕' : 
                                 status.includes('D') ? '➖' : '🔄';
                this.log(`  ${statusIcon} ${file}`);
            });
            
            return true;
            
        } catch (error) {
            throw new Error(`Erreur vérification changements: ${error.message}`);
        }
    }

    async commitChanges() {
        try {
            // Ajouter tous les fichiers modifiés sauf les backups temporaires
            execSync('git add data/pieces.json data/events.json data/concerts.json index.html', { 
                cwd: this.rootDir 
            });
            
            // Générer un message de commit automatique avec statistiques
            const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
            const commitMessage = `🔄 Auto-sync Notion [${timestamp}]

✅ Synchronisation automatique des données Notion
📊 Mise à jour: pièces musicales + événements + concerts
🚀 Déploiement automatique via script

[skip ci] # Éviter les déclenchements GitHub Actions inutiles`;
            
            execSync(`git commit -m "${commitMessage}"`, { 
                cwd: this.rootDir 
            });
            
            this.log('Commit créé avec succès');
            
        } catch (error) {
            // Si rien à committer, ce n'est pas une erreur
            if (error.message.includes('nothing to commit')) {
                this.log('Aucun changement à committer');
                return;
            }
            throw new Error(`Erreur lors du commit: ${error.message}`);
        }
    }

    async pushToGitHub() {
        try {
            // Vérifier d'abord si on est à jour avec le remote
            try {
                execSync('git fetch origin', { cwd: this.rootDir });
                
                const localCommit = execSync('git rev-parse HEAD', { 
                    cwd: this.rootDir, 
                    encoding: 'utf8' 
                }).trim();
                
                const remoteCommit = execSync('git rev-parse origin/main', { 
                    cwd: this.rootDir, 
                    encoding: 'utf8' 
                }).trim();
                
                if (localCommit !== remoteCommit) {
                    this.log('⚠️ Divergence détectée avec le remote. Tentative de merge...');
                    
                    try {
                        execSync('git pull origin main --rebase', { cwd: this.rootDir });
                        this.log('Rebase réussi');
                    } catch (rebaseError) {
                        throw new Error(`Conflit lors du rebase. Résolvez manuellement et relancez.`);
                    }
                }
            } catch (fetchError) {
                this.log('⚠️ Impossible de vérifier le remote, continuons...');
            }
            
            // Push vers GitHub
            const pushResult = execSync('git push origin main', { 
                cwd: this.rootDir, 
                encoding: 'utf8',
                timeout: 30000 // 30 secondes max
            });
            
            this.log('Push vers GitHub réussi');
            
        } catch (error) {
            throw new Error(`Erreur lors du push: ${error.message}`);
        }
    }

    async optimizeGitHubPages() {
        try {
            const result = execSync('node scripts/github-pages-optimizer.js', { 
                cwd: this.rootDir, 
                encoding: 'utf8',
                timeout: 30000 // 30 secondes max
            });
            
            this.log('Optimisation GitHub Pages réussie');
            
        } catch (error) {
            this.log(`⚠️ Erreur optimisation GitHub Pages: ${error.message}`);
            // Ne pas faire échouer le déploiement pour cette étape
        }
    }
        try {
            // Vérifier que le commit est bien sur GitHub
            const latestCommit = execSync('git rev-parse HEAD', { 
                cwd: this.rootDir, 
                encoding: 'utf8' 
            }).trim();
            
            const shortCommit = latestCommit.substring(0, 7);
            this.log(`Commit déployé: ${shortCommit}`);
            
            // Vérifier que les fichiers JSON existent et sont valides
            const dataFiles = ['data/pieces.json', 'data/events.json'];
            
            for (const file of dataFiles) {
                const filePath = path.join(this.rootDir, file);
                if (fs.existsSync(filePath)) {
                    try {
                        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        const count = Object.keys(content)[0] ? content[Object.keys(content)[0]].length : 0;
                        this.log(`✅ ${file}: ${count} éléments`);
                    } catch (parseError) {
                        this.log(`⚠️ ${file}: fichier présent mais format invalide`, true);
                    }
                } else {
                    this.log(`⚠️ ${file}: fichier manquant`, true);
                }
            }
            
        } catch (error) {
            this.log(`Erreur lors de la vérification: ${error.message}`, true);
        }
    }

    showSummary() {
        console.log('\n🎯 === RÉSUMÉ DU DÉPLOIEMENT ===');
        console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
        console.log('✅ Synchronisation Notion: OK');
        console.log('✅ Commit Git: OK');
        console.log('✅ Push GitHub: OK');
        console.log('🌐 Site en production: Mis à jour');
        console.log('\n💡 Votre site est maintenant à jour avec les dernières données Notion !');
        console.log('🔗 URL: https://skymer44.github.io/test/');
        console.log('\n📋 Log complet sauvé dans: deploy.log');
        console.log('=====================================\n');
    }
}

// Fonction principale
async function main() {
    const deployer = new AutoDeployer();
    await deployer.deploy();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoDeployer;
