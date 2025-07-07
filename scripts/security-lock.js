#!/usr/bin/env node

/**
 * 🔒 VERROU DE SÉCURITÉ - Protection contre les scripts dangereux
 * 
 * Ce script vérifie que seuls les scripts sécurisés sont utilisés
 * et bloque l'exécution de tout script dangereux
 */

const fs = require('fs');
const path = require('path');

class SecurityLock {
    constructor() {
        this.scriptsDir = path.join(__dirname);
        this.dangerousScripts = [
            'intelligent-update-site.js',
            'update-html-with-notion.js',
            'site-builder.js'
        ];
        
        this.safeScripts = [
            'notion-sync.js',
            'notion-content-injector.js',
            'cache-buster.js',
            'sync-and-deploy.js'
        ];
    }

    checkSecurity() {
        console.log('🔒 === VÉRIFICATION DE SÉCURITÉ ===');
        
        let dangerousFound = false;
        
        // Vérifier l'absence de scripts dangereux
        this.dangerousScripts.forEach(script => {
            const scriptPath = path.join(this.scriptsDir, script);
            if (fs.existsSync(scriptPath)) {
                console.log(`❌ DANGER: Script dangereux détecté: ${script}`);
                dangerousFound = true;
            } else {
                console.log(`✅ Sécurisé: ${script} supprimé`);
            }
        });
        
        // Vérifier la présence des scripts sécurisés
        this.safeScripts.forEach(script => {
            const scriptPath = path.join(this.scriptsDir, script);
            if (fs.existsSync(scriptPath)) {
                console.log(`✅ Script sécurisé disponible: ${script}`);
            } else {
                console.log(`⚠️ Script sécurisé manquant: ${script}`);
            }
        });
        
        if (dangerousFound) {
            console.log('\n🚨 ALERTE SÉCURITÉ: Des scripts dangereux ont été détectés !');
            console.log('Exécutez: rm scripts/intelligent-update-site.js scripts/update-html-with-notion.js scripts/site-builder.js');
            process.exit(1);
        } else {
            console.log('\n🎯 SÉCURITÉ VALIDÉE: Tous les scripts dangereux ont été supprimés');
            console.log('✅ Architecture sécurisée active');
        }
    }
}

// Auto-exécution
if (require.main === module) {
    const lock = new SecurityLock();
    lock.checkSecurity();
}

module.exports = SecurityLock;
