/**
 * 🎯 CHARGEUR DYNAMIQUE DE CONTENU NOTION
 * 
 * Ce script charge les données depuis les fichiers JSON et génère
 * dynamiquement le contenu HTML côté client pour une réactivité maximale.
 * 
 * Architecture : HTML statique + données JSON dynamiques
 */

class ProgrammeLoader {
    constructor() {
        this.dataCache = {};
        this.loadingStates = new Map();
        
        this.sectionMapping = {
            // Mapping exact pour des cas spéciaux uniquement
            'Ma région virtuose 0': 'ma-region-virtuose', // Cas particulier avec numéro
        };
        
        // Pas de sectionTitles statiques - on utilise directement les noms Notion
        this.sectionTitles = {};
    }

    /**
     * Initialise le chargement du contenu
     */
    async init() {
        console.log('🎯 ProgrammeLoader: Initialisation...');
        
        // Charger les données
        await this.loadProgrammes();
        
        // Écouter les changements d'onglets
        this.setupTabListeners();
        
        // Démarrer la vérification périodique des mises à jour
        this.startUpdateChecker();
        
        console.log('✅ ProgrammeLoader: Initialisé avec succès');
    }

    /**
     * Charge les programmes depuis les données JSON
     */
    async loadProgrammes() {
        try {
            this.showLoading('programmes-content');
            
            // Charger les données JSON
            const piecesData = await this.fetchData('data/pieces.json');
            
            if (!piecesData || !piecesData.pieces) {
                throw new Error('Données des pièces manquantes');
            }
            
            // Organiser par sections
            const sections = this.organizePiecesBySection(piecesData.pieces);
            
            // Générer et injecter le HTML
            const html = this.generateSectionsHTML(sections);
            this.injectContent('programmes-content', html);
            
            // Mettre à jour les statistiques
            this.updateSiteStats(piecesData);
            
            console.log(`✅ ${piecesData.pieces.length} pièces chargées dynamiquement`);
            
        } catch (error) {
            console.error('❌ Erreur chargement programmes:', error);
            this.showError('programmes-content', error.message);
        }
    }

    /**
     * Récupère les données depuis un fichier JSON avec cache
     */
    async fetchData(url) {
        try {
            // Ajouter un timestamp pour éviter le cache
            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(url + cacheBuster);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Mettre en cache
            this.dataCache[url] = {
                data,
                timestamp: Date.now()
            };
            
            return data;
            
        } catch (error) {
            console.error(`Erreur chargement ${url}:`, error);
            
            // Fallback sur le cache si disponible
            if (this.dataCache[url]) {
                console.warn(`Utilisation cache pour ${url}`);
                return this.dataCache[url].data;
            }
            
            throw error;
        }
    }

    /**
     * Organise les pièces par section selon le mapping
     */
    organizePiecesBySection(pieces) {
        const sections = {};
        const seenPieces = new Set(); // Pour éviter les doublons
        
        pieces.forEach(piece => {
            const databaseName = piece.source?.database;
            if (!databaseName) return;
            
            // Créer une clé unique pour détecter les doublons
            const pieceKey = `${piece.title?.toLowerCase()?.trim()}-${piece.composer?.toLowerCase()?.trim() || ''}`;
            
            // Éviter les doublons (garder la première occurrence)
            if (seenPieces.has(pieceKey)) {
                console.warn(`⚠️ Doublon détecté et ignoré: "${piece.title}" de la base "${databaseName}"`);
                return;
            }
            seenPieces.add(pieceKey);
            
            const sectionId = this.getSectionId(databaseName);
            // UTILISER DIRECTEMENT LE NOM DE LA BASE NOTION comme titre
            const sectionTitle = databaseName; // Plus de mapping statique !
            
            if (!sections[sectionId]) {
                sections[sectionId] = {
                    id: sectionId,
                    title: sectionTitle,
                    pieces: []
                };
            }
            
            sections[sectionId].pieces.push(piece);
        });
        
        // Trier les pièces dans chaque section par ordre Notion
        Object.values(sections).forEach(section => {
            section.pieces.sort((a, b) => {
                const orderA = a.source?.order;
                const orderB = b.source?.order;
                
                if (orderA !== null && orderA !== undefined && orderB !== null && orderB !== undefined) {
                    return orderA - orderB;
                }
                if (orderA !== null && orderA !== undefined) return -1;
                if (orderB !== null && orderB !== undefined) return 1;
                
                const dateA = a.source?.lastModified || '0';
                const dateB = b.source?.lastModified || '0';
                return dateA.localeCompare(dateB);
            });
        });
        
        return sections;
    }

    /**
     * Détermine l'ID de section pour une base de données
     * Génère automatiquement un ID basé sur le nom de la base Notion
     */
    getSectionId(databaseName) {
        // Normaliser les apostrophes
        const normalizedName = databaseName.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
        
        // Vérifier les cas spéciaux du mapping
        if (this.sectionMapping[normalizedName]) {
            return this.sectionMapping[normalizedName];
        }
        
        // Générer automatiquement un ID slug à partir du nom de la base
        const sectionId = this.generateSlug(normalizedName);
        
        console.log(`📊 Base Notion: "${databaseName}" → ID: ${sectionId}`);
        return sectionId;
    }
    
    /**
     * Génère un slug à partir d'un nom de base de données
     */
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
            .replace(/\s+/g, '-') // Remplacer espaces par tirets
            .replace(/--+/g, '-') // Éviter les tirets multiples
            .replace(/^-|-$/g, '') // Supprimer tirets en début/fin
            .substring(0, 50); // Limiter la longueur
    }

    /**
     * Génère le HTML pour toutes les sections
     */
    generateSectionsHTML(sections) {
        // Trier les sections par ordre d'importance/préférence ou alphabétique
        const sortedSections = Object.values(sections).sort((a, b) => {
            // Ordre de priorité personnalisé (vous pouvez l'adapter)
            const priorityOrder = [
                'ma-region-virtuose',
                'concert-du-11-davril', 
                'programme-fete-de-la-musique',
                'pieces-qui-nont-pas-trouve-leur-concert'
            ];
            
            const priorityA = priorityOrder.indexOf(a.id);
            const priorityB = priorityOrder.indexOf(b.id);
            
            // Si les deux ont une priorité, trier par priorité
            if (priorityA !== -1 && priorityB !== -1) {
                return priorityA - priorityB;
            }
            
            // Sinon, mettre les prioritaires en premier
            if (priorityA !== -1) return -1;
            if (priorityB !== -1) return 1;
            
            // Pour les autres, trier alphabétiquement
            return a.title.localeCompare(b.title, 'fr');
        });
        
        return sortedSections
            .filter(section => section.pieces.length > 0)
            .map(section => this.generateSectionHTML(section))
            .join('');
    }

    /**
     * Génère le HTML pour une section
     */
    generateSectionHTML(section) {
        const piecesHTML = section.pieces
            .map(piece => this.generatePieceHTML(piece))
            .join('');
        
        // Calculer la durée totale
        const totalSeconds = this.calculateTotalDuration(section.pieces);
        const totalTimeDisplay = totalSeconds > 0 ? this.formatDuration(totalSeconds) : '';
        
        return `
            <section id="${section.id}" class="concert-section">
                <div class="section-header">
                    <h2>${section.title}</h2>
                    <button class="pdf-download-btn" data-section="${section.id}" title="Télécharger ce programme en PDF">
                        📄 Télécharger PDF
                    </button>
                </div>
                <div class="pieces-grid">
                    ${piecesHTML}
                </div>
                <div class="section-summary">
                    <div class="summary-stats">
                        <span class="stat-pieces">${section.pieces.length} pièce${section.pieces.length > 1 ? 's' : ''}</span>
                        ${totalTimeDisplay ? `<span class="stat-duration">${totalTimeDisplay}</span>` : ''}
                    </div>
                </div>
            </section>`;
    }

    /**
     * Génère le HTML pour une pièce
     */
    generatePieceHTML(piece) {
        const linksHTML = this.generateLinksHTML(piece.links);
        
        return `
            <div class="piece-card">
                <h3>${piece.title}</h3>
                ${piece.composer ? `<p><strong>Compositeur:</strong> ${piece.composer}</p>` : ''}
                ${piece.duration ? `<p><strong>Durée:</strong> ${piece.duration}</p>` : ''}
                ${piece.info ? `<p><strong>Info:</strong> ${piece.info}</p>` : ''}
                ${linksHTML ? `<div class="links">${linksHTML}</div>` : ''}
            </div>`;
    }

    /**
     * Génère le HTML pour les liens d'une pièce
     */
    generateLinksHTML(links) {
        if (!links) return '';
        
        const linkElements = [];
        
        if (links.audio) {
            linkElements.push(`<a href="${links.audio}" target="_blank" title="Arrangement audio">🎵 Audio</a>`);
        }
        if (links.original) {
            linkElements.push(`<a href="${links.original}" target="_blank" title="Œuvre originale">🎬 Original</a>`);
        }
        if (links.purchase) {
            linkElements.push(`<a href="${links.purchase}" target="_blank" title="Lien d'achat">🛒 Achat</a>`);
        }
        
        return linkElements.join('');
    }

    /**
     * Calcule la durée totale d'une liste de pièces
     */
    calculateTotalDuration(pieces) {
        return pieces.reduce((total, piece) => {
            if (!piece.duration) return total;
            
            const timeComponents = piece.duration.split(':');
            if (timeComponents.length >= 2) {
                const minutes = parseInt(timeComponents[0]) || 0;
                const seconds = parseInt(timeComponents[1]) || 0;
                return total + (minutes * 60) + seconds;
            }
            
            return total;
        }, 0);
    }

    /**
     * Formate une durée en secondes vers un format lisible
     */
    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${h}h ${m.toString().padStart(2, '0')}min`;
        } else if (m > 0) {
            return `${m}min${s > 0 ? ` ${s.toString().padStart(2, '0')}s` : ''}`;
        } else {
            return `${s}s`;
        }
    }

    /**
     * Affiche un indicateur de chargement
     */
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-placeholder">
                    <p>🔄 Chargement des programmes musicaux...</p>
                    <div class="loading-spinner"></div>
                </div>`;
        }
    }

    /**
     * Affiche une erreur
     */
    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-placeholder">
                    <p>❌ Erreur: ${message}</p>
                    <button onclick="programmeLoader.loadProgrammes()" class="retry-btn">
                        🔄 Réessayer
                    </button>
                </div>`;
        }
    }

    /**
     * Injecte le contenu HTML dans un conteneur
     */
    injectContent(containerId, html) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
            
            // Réactiver les événements après injection
            this.reactivateEvents(container);
        }
    }

    /**
     * Réactive les événements après injection de contenu
     */
    reactivateEvents(container) {
        // Réactiver les boutons PDF
        const pdfButtons = container.querySelectorAll('.pdf-download-btn');
        pdfButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const sectionId = e.target.dataset.section;
                if (window.generatePDF && typeof window.generatePDF === 'function') {
                    window.generatePDF(sectionId);
                }
            });
        });
        
        // Réactiver les liens audio/vidéo si nécessaire
        const audioLinks = container.querySelectorAll('a[title*="audio"], a[title*="Audio"]');
        audioLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.handleAudioLink && typeof window.handleAudioLink === 'function') {
                    e.preventDefault();
                    window.handleAudioLink(link.href, link.textContent);
                }
            });
        });
    }

    /**
     * Met à jour les statistiques du site
     */
    updateSiteStats(data) {
        const statsContainer = document.getElementById('site-stats');
        if (statsContainer && data.pieces) {
            const totalPieces = data.pieces.length;
            const lastSync = data.metadata?.syncDate ? 
                new Date(data.metadata.syncDate).toLocaleString('fr-FR') : 
                'Inconnue';
            
            statsContainer.innerHTML = `
                <div class="stats-item">
                    <span class="stats-number">${totalPieces}</span>
                    <span class="stats-label">pièces</span>
                </div>
                <div class="stats-item">
                    <span class="stats-last-sync">Dernière sync: ${lastSync}</span>
                </div>`;
        }
    }

    /**
     * Configure les écouteurs d'événements pour les onglets
     */
    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                if (targetTab === 'programmes') {
                    // Recharger si nécessaire
                    this.checkForUpdates();
                }
            });
        });
    }

    /**
     * Démarre la vérification périodique des mises à jour
     */
    startUpdateChecker() {
        // Vérifier toutes les 5 minutes
        setInterval(() => {
            this.checkForUpdates();
        }, 5 * 60 * 1000);
    }

    /**
     * Vérifie s'il y a des mises à jour disponibles
     */
    async checkForUpdates() {
        try {
            const currentData = this.dataCache['data/pieces.json'];
            if (!currentData) return;
            
            const newData = await this.fetchData('data/pieces.json');
            
            // Comparer les timestamps de sync
            const currentSync = currentData.data.metadata?.syncDate;
            const newSync = newData.metadata?.syncDate;
            
            if (newSync && newSync !== currentSync) {
                console.log('🔄 Nouvelle version des données détectée');
                this.showUpdateNotification();
            }
            
        } catch (error) {
            console.warn('Erreur vérification mises à jour:', error);
        }
    }

    /**
     * Affiche une notification de mise à jour
     */
    showUpdateNotification() {
        // Créer une notification discrète
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔄</span>
                <span class="update-text">Nouvelles données disponibles!</span>
                <button class="update-btn" onclick="programmeLoader.loadProgrammes()">Mettre à jour</button>
                <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>`;
        
        notification.style.cssText = `
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
        `;
        
        document.body.appendChild(notification);
        
        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
}

// Initialisation globale
let programmeLoader;

// Démarrer dès que le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        programmeLoader = new ProgrammeLoader();
        programmeLoader.init();
    });
} else {
    programmeLoader = new ProgrammeLoader();
    programmeLoader.init();
}

// Export pour utilisation externe
window.programmeLoader = programmeLoader;
