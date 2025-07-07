#!/usr/bin/env node

/**
 * Cache Buster - Système de gestion automatique du cache
 * Génère des versions automatiquement pour forcer la mise à jour des navigateurs
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CacheBuster {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.buildTime = Date.now();
        this.version = this.generateVersion();
    }

    generateVersion() {
        // Générer une version basée sur la date et un hash court
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(timestamp.toString()).digest('hex').substring(0, 8);
        return `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${hash}`;
    }

    async generateManifest() {
        const manifest = {
            version: this.version,
            buildTime: new Date(this.buildTime).toISOString(),
            timestamp: this.buildTime,
            files: {
                'script.js': await this.getFileHash('script.js'),
                'styles.css': await this.getFileHash('styles.css'),
                'index.html': await this.getFileHash('index.html')
            },
            cacheControl: {
                maxAge: 0, // Pas de cache
                mustRevalidate: true,
                noCache: true
            }
        };

        return manifest;
    }

    async getFileHash(fileName) {
        try {
            const filePath = path.join(this.rootDir, fileName);
            const content = await fs.readFile(filePath, 'utf8');
            return crypto.createHash('md5').update(content).digest('hex').substring(0, 12);
        } catch (error) {
            return 'unknown';
        }
    }

    async updateIndexHtml() {
        const indexPath = path.join(this.rootDir, 'index.html');
        let content = await fs.readFile(indexPath, 'utf8');

        // Ajouter/mettre à jour les paramètres de cache sur les liens CSS et JS
        content = content.replace(
            /href="styles\.css(\?v=[^"]*)?"/g,
            `href="styles.css?v=${this.version}"`
        );

        content = content.replace(
            /src="script\.js(\?v=[^"]*)?"/g,
            `src="script.js?v=${this.version}"`
        );

        // Ajouter des meta tags pour empêcher le cache
        const cacheMetaTags = `
    <!-- Cache Busting - Version ${this.version} -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="version" content="${this.version}">
    <meta name="build-time" content="${new Date(this.buildTime).toISOString()}">`;

        // Insérer après la balise charset ou avant </head>
        if (content.includes('<meta charset')) {
            content = content.replace(
                /(<meta charset[^>]*>)/,
                `$1${cacheMetaTags}`
            );
        } else {
            content = content.replace('</head>', `${cacheMetaTags}\n</head>`);
        }

        await fs.writeFile(indexPath, content, 'utf8');
        console.log(`✅ index.html mis à jour avec la version ${this.version}`);
    }

    async updateServiceWorker() {
        const swContent = `
// Service Worker pour la gestion du cache - Version ${this.version}
// Généré automatiquement le ${new Date(this.buildTime).toISOString()}

const CACHE_NAME = 'programme-musical-${this.version}';
const CACHE_VERSION = '${this.version}';

// Forcer la mise à jour immédiate
self.addEventListener('install', event => {
    console.log('[SW] Installation - Version:', CACHE_VERSION);
    self.skipWaiting(); // Forcer l'activation immédiate
});

self.addEventListener('activate', event => {
    console.log('[SW] Activation - Version:', CACHE_VERSION);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Prendre le contrôle immédiatement
        })
    );
});

// Stratégie Network First pour tout
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Toujours retourner la réponse réseau fraîche
                return response;
            })
            .catch(() => {
                // En cas d'erreur réseau, essayer le cache
                return caches.match(event.request);
            })
    );
});

// Message pour notifier les clients de la mise à jour
self.addEventListener('message', event => {
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            buildTime: ${this.buildTime}
        });
    }
});
`;

        const swPath = path.join(this.rootDir, 'sw.js');
        await fs.writeFile(swPath, swContent, 'utf8');
        console.log(`✅ Service Worker généré avec la version ${this.version}`);
    }

    async createVersionFile() {
        const manifest = await this.generateManifest();
        const versionPath = path.join(this.rootDir, 'version.json');
        
        await fs.writeFile(versionPath, JSON.stringify(manifest, null, 2), 'utf8');
        console.log(`✅ Fichier version.json créé avec la version ${this.version}`);
        
        return manifest;
    }

    async addVersionCheckScript() {
        const versionCheckScript = `
// Système de vérification automatique des versions
(function() {
    const CURRENT_VERSION = '${this.version}';
    const CHECK_INTERVAL = 30000; // 30 secondes
    
    let isCheckingVersion = false;
    
    // Fonction pour vérifier la version
    async function checkVersion() {
        if (isCheckingVersion) return;
        isCheckingVersion = true;
        
        try {
            const response = await fetch('/version.json?t=' + Date.now());
            const versionData = await response.json();
            
            if (versionData.version !== CURRENT_VERSION) {
                console.log('🔄 Nouvelle version détectée:', versionData.version);
                showUpdateNotification(versionData);
            }
        } catch (error) {
            console.log('Erreur vérification version:', error);
        } finally {
            isCheckingVersion = false;
        }
    }
    
    // Afficher une notification de mise à jour
    function showUpdateNotification(versionData) {
        // Créer une notification discrète
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = \`
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nouvelle version disponible!</span>
                <button class="update-btn" onclick="location.reload(true)">Mettre à jour</button>
                <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        \`;
        
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4299e1;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui;
            animation: slideIn 0.3s ease;
        \`;
        
        // Ajouter les styles pour l'animation
        if (!document.getElementById('update-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'update-notification-styles';
            style.textContent = \`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .update-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .update-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                .update-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                .dismiss-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            \`;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-mise à jour après 10 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                location.reload(true);
            }
        }, 10000);
    }
    
    // Démarrer la vérification périodique
    setInterval(checkVersion, CHECK_INTERVAL);
    
    // Vérifier aussi quand la page redevient visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(checkVersion, 1000);
        }
    });
    
    // Vérifier au chargement initial
    setTimeout(checkVersion, 5000);
    
    console.log('🔄 Système de vérification des versions activé - Version courante:', CURRENT_VERSION);
})();`;

        return versionCheckScript;
    }

    async updateScriptWithVersionCheck() {
        const scriptPath = path.join(this.rootDir, 'script.js');
        let content = await fs.readFile(scriptPath, 'utf8');
        
        // Ajouter le script de vérification de version à la fin
        const versionCheckScript = await this.addVersionCheckScript();
        
        // Vérifier si le script de version existe déjà
        if (content.includes('Système de vérification automatique des versions')) {
            // Remplacer l'ancien script
            content = content.replace(
                /\/\/ Système de vérification automatique des versions[\s\S]*?console\.log\('🔄 Système de vérification des versions activé[^']*'\);[^}]*}\)\(\);/,
                versionCheckScript
            );
        } else {
            // Ajouter le nouveau script
            content += '\n\n' + versionCheckScript;
        }
        
        await fs.writeFile(scriptPath, content, 'utf8');
        console.log('✅ Script de vérification de version ajouté à script.js');
    }

    async run() {
        console.log('🚀 === CACHE BUSTER - GÉNÉRATION DE VERSION ===');
        console.log(`📅 ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🔢 Version générée: ${this.version}\n`);

        try {
            // 1. Créer le fichier de version
            const manifest = await this.createVersionFile();
            
            // 2. Mettre à jour index.html avec les paramètres anti-cache
            await this.updateIndexHtml();
            
            // 3. Générer le Service Worker
            await this.updateServiceWorker();
            
            // 4. Ajouter le script de vérification automatique
            await this.updateScriptWithVersionCheck();
            
            console.log('\n✅ === CACHE BUSTER TERMINÉ ===');
            console.log(`🎯 Version: ${this.version}`);
            console.log('📁 Fichiers mis à jour:');
            console.log('   - index.html (meta tags + paramètres URL)');
            console.log('   - script.js (vérification automatique)');
            console.log('   - sw.js (Service Worker)');
            console.log('   - version.json (manifest)');
            console.log('\n💡 Le cache sera maintenant automatiquement invalidé!');
            
            return manifest;
            
        } catch (error) {
            console.error('❌ Erreur lors de la génération:', error);
            throw error;
        }
    }
}

// Exécution du script
if (require.main === module) {
    const cacheBuster = new CacheBuster();
    cacheBuster.run().catch(error => {
        console.error('💥 Erreur fatale:', error.message);
        process.exit(1);
    });
}

module.exports = CacheBuster;
