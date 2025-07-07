#!/usr/bin/env node

/**
 * Script de mise à jour intelligente du site web
 * Remplace complètement les données existantes par les données Notion
 */

const fs = require('fs').promises;
const path = require('path');

class IntelligentSiteUpdater {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.indexPath = path.join(__dirname, '..', 'index.html');
        this.backupDir = path.join(this.dataDir, 'site-backups');
        
        // Mapping des bases de données Notion vers les sections du site
        this.sectionMapping = {
            'Ma région virtuose': 'ma-region-virtuose',
            'Concert du 11 d\'avril avec Eric Aubier': 'concert-eric-aubier',
            'Insertion dans les 60 ans du Conservatoire ': 'conservatoire-60-ans',
            'Retour Karaoké': 'retour-karaoke',
            'Programme fête de la musique': 'fete-musique',
            'Loto': 'loto',
            'Pièces d\'ajout sans direction': 'pieces-ajout',
            'Pièces qui n\'ont pas trouvé leur concert': 'pieces-orphelines'
        };
        
        // Titres français des sections
        this.sectionTitles = {
            'ma-region-virtuose': 'Ma région virtuose',
            'concert-eric-aubier': 'Concert du 11 d\'avril avec Eric Aubier',
            'conservatoire-60-ans': 'Insertion dans les 60 ans du Conservatoire',
            'retour-karaoke': 'Retour Karaoké',
            'fete-musique': 'Programme fête de la musique',
            'loto': 'Loto',
            'pieces-ajout': 'Pièces d\'ajout sans direction',
            'pieces-orphelines': 'Pièces qui n\'ont pas trouvé leur concert'
        };
    }

    // Normalise les noms de bases de données pour gérer les différents types d'apostrophes
    normalizeDatabaseName(name) {
        // Remplace tous les types d'apostrophes par des apostrophes normales (39)
        return name.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
    }

    // Obtient la section correspondante à une base de données
    getSectionForDatabase(databaseName) {
        const normalizedName = this.normalizeDatabaseName(databaseName);
        return this.sectionMapping[normalizedName] || 'nouvelles-pieces';
    }

    async updateSite() {
        console.log('🔄 === MISE À JOUR INTELLIGENTE DU SITE ===');
        
        try {
            // 1. Créer une sauvegarde
            await this.createBackup();
            
            // 2. Charger les données Notion
            const notionData = await this.loadNotionData();
            
            // 3. Organiser les données par section
            const organizedData = this.organizeDataBySections(notionData);
            
            // 4. Lire le template HTML de base
            const baseHTML = await this.getBaseHTMLTemplate();
            
            // 5. Générer le nouveau HTML complet
            const newHTML = await this.generateCompleteHTML(baseHTML, organizedData);
            
            // 6. Sauvegarder le nouveau HTML
            await fs.writeFile(this.indexPath, newHTML);
            
            console.log('✅ Site mis à jour avec succès !');
            this.generateReport(organizedData);
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error.message);
            throw error;
        }
    }

    async createBackup() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `index-intelligent-${timestamp}.html`);
            
            const currentHTML = await fs.readFile(this.indexPath, 'utf8');
            await fs.writeFile(backupPath, currentHTML);
            
            console.log(`💾 Sauvegarde créée: ${backupPath}`);
        } catch (error) {
            console.warn('⚠️ Impossible de créer la sauvegarde:', error.message);
        }
    }

    async loadNotionData() {
        const data = { pieces: [] };
        
        try {
            const piecesPath = path.join(this.dataDir, 'pieces.json');
            const piecesData = await fs.readFile(piecesPath, 'utf8');
            data.pieces = JSON.parse(piecesData).pieces || [];
            
            console.log(`📊 ${data.pieces.length} pièces chargées depuis Notion`);
        } catch (error) {
            console.warn('⚠️ Impossible de charger pieces.json:', error.message);
        }
        
        return data;
    }

    organizeDataBySections(notionData) {
        console.log('🗂️ Organisation des données par sections...');
        
        const sections = {};
        
        // Initialiser toutes les sections
        Object.keys(this.sectionMapping).forEach(dbName => {
            const sectionId = this.sectionMapping[dbName];
            sections[sectionId] = {
                id: sectionId,
                title: this.sectionTitles[sectionId],
                pieces: [],
                database: dbName
            };
        });
        
        // Répartir les pièces dans les bonnes sections
        notionData.pieces.forEach(piece => {
            const dbName = piece.source?.database;
            
            if (dbName) {
                const sectionId = this.getSectionForDatabase(dbName);
                
                if (sectionId && sections[sectionId]) {
                    sections[sectionId].pieces.push(piece);
                    console.log(`📋 "${piece.title}" → ${this.sectionTitles[sectionId]}`);
                } else {
                    console.warn(`⚠️ Pièce orpheline: "${piece.title}" (DB: ${dbName})`);
                    // Mettre dans "pièces orphelines" par défaut
                    sections['pieces-orphelines'].pieces.push(piece);
                }
            } else {
                console.log(`⚠️  Pas de base de données pour "${piece.title}"`);
                sections['pieces-orphelines'].pieces.push(piece);
            }
        });
        
        // Trier les pièces dans chaque section par ordre défini dans Notion (colonne "Ordre")
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                section.pieces.sort((a, b) => {
                    const orderA = a.source?.order;
                    const orderB = b.source?.order;
                    
                    // Si les deux ont un ordre défini, trier par ordre
                    if (orderA !== null && orderA !== undefined && orderB !== null && orderB !== undefined) {
                        return orderA - orderB;
                    }
                    
                    // Si seul A a un ordre, A vient en premier
                    if (orderA !== null && orderA !== undefined) {
                        return -1;
                    }
                    
                    // Si seul B a un ordre, B vient en premier
                    if (orderB !== null && orderB !== undefined) {
                        return 1;
                    }
                    
                    // Si aucun n'a d'ordre, fallback sur date de modification
                    const dateA = a.source?.lastModified || a.source?.pageId || '0';
                    const dateB = b.source?.lastModified || b.source?.pageId || '0';
                    return dateA.localeCompare(dateB);
                });
                
                const orderedCount = section.pieces.filter(p => p.source?.order !== null && p.source?.order !== undefined).length;
                console.log(`✅ ${section.title}: ${section.pieces.length} pièce(s) - ${orderedCount} avec ordre personnalisé`);
            }
        });
        
        return sections;
    }

    async getBaseHTMLTemplate() {
        // Template HTML de base propre
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programme Musical 2026</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1>Programme Musical 2026</h1>
            <div id="site-stats" class="site-statistics">
                <!-- Les statistiques seront mises à jour automatiquement par JavaScript -->
            </div>
        </div>
    </header>

    <!-- Navigation par onglets -->
    <nav class="tab-navigation">
        <div class="tab-container">
            <div class="tab-buttons">
                <button class="tab-button active" data-tab="programmes">📚 Programmes Musicaux</button>
                <button class="tab-button" data-tab="partitions">🎼 Partitions</button>
            </div>
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Rechercher une pièce, un compositeur..." class="search-input">
            </div>
        </div>
    </nav>

    <main>
        <!-- Section Programmes -->
        <div id="programmes" class="tab-content active">
            {{SECTIONS_CONTENT}}
        </div>

        <!-- Section Partitions -->
        <div id="partitions" class="tab-content">
            <section class="partitions-section">
                <h2>🎼 Partitions du Programme Musical 2026</h2>
                <div class="partitions-content">
                    <div class="partitions-intro">
                        <p>Toutes les partitions sont disponibles en téléchargement libre pour les membres de l'orchestre.</p>
                        <div class="google-drive-link">
                            <a href="https://drive.google.com/drive/folders/1example" target="_blank" class="drive-button">
                                📁 Accéder au Drive des Partitions
                            </a>
                        </div>
                    </div>
                    
                    <div class="copyright-notice">
                        <h3>⚖️ Droits d'auteur et utilisation</h3>
                        <p>Les partitions présentes dans ce drive sont protégées par le droit d'auteur. 
                        Leur utilisation est strictement réservée aux membres de l'orchestre dans le cadre 
                        des répétitions et concerts du programme 2026. Si je suis membre de l'orchestre, 
                        je m'engage à respecter ces conditions d'utilisation.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <!-- Modale vidéo YouTube -->
    <div id="video-modal" class="video-modal">
        <div class="video-modal-wrapper">
            <div class="video-controls">
                <button id="audio-mode-btn" class="control-btn" title="Mode audio uniquement">🎧</button>
                <button id="close-modal-btn" class="control-btn" title="Fermer">✕</button>
            </div>
            <div class="video-modal-content">
                <div class="video-container">
                    <iframe id="youtube-player" 
                            width="100%" 
                            height="100%" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
            </div>
        </div>
    </div>

    <!-- Mini-lecteur audio en bas -->
    <div id="audio-player" class="audio-player">
        <div class="audio-player-content">
            <div class="audio-info">
                <span id="audio-title">Titre de la pièce</span>
                <span id="audio-title-floating" style="display: none;">Titre de la pièce</span>
            </div>
            <div class="audio-controls">
                <button id="show-video-btn" class="audio-control-btn" title="Afficher la vidéo">▶</button>
                <button id="stop-audio-btn" class="audio-control-btn" title="Arrêter">⏹</button>
            </div>
        </div>
    </div>

    <!-- Bibliothèque jsPDF pour la génération de PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <!-- Script original pour les fonctionnalités -->
    <script src="script.js"></script>
</body>
</html>`;
    }

    generateCompleteHTML(baseHTML, sections) {
        let sectionsHTML = '';
        
        // Générer chaque section avec ses pièces
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                sectionsHTML += this.generateSectionHTML(section);
            }
        });
        
        // Remplacer le placeholder
        return baseHTML.replace('{{SECTIONS_CONTENT}}', sectionsHTML);
    }

    generateSectionHTML(section) {
        const piecesHTML = section.pieces.map(piece => this.generatePieceHTML(piece)).join('\n                ');
        
        // Calculer la durée totale de cette section
        let totalSeconds = 0;
        section.pieces.forEach(piece => {
            if (piece.duration) {
                const timeComponents = piece.duration.split(':');
                if (timeComponents.length >= 2) {
                    const minutes = parseInt(timeComponents[0]) || 0;
                    const seconds = parseInt(timeComponents[1]) || 0;
                    totalSeconds += minutes * 60 + seconds;
                }
            }
        });
        
        // Formater la durée
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            if (h > 0) {
                return `${h}h ${m.toString().padStart(2, '0')}min`;
            } else if (m > 0) {
                return `${m}min ${s > 0 ? s.toString().padStart(2, '0') + 's' : ''}`;
            } else {
                return `${s}s`;
            }
        };
        
        const totalTimeDisplay = totalSeconds > 0 ? formatTime(totalSeconds) : '';
        
        return `
        <!-- ${section.title} -->
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
        </section>
`;
    }

    generatePieceHTML(piece) {
        const linksHTML = [];
        
        if (piece.links) {
            if (piece.links.audio) {
                linksHTML.push(`<a href="${piece.links.audio}" target="_blank" title="Arrangement audio">🎵 Audio</a>`);
            }
            if (piece.links.original) {
                linksHTML.push(`<a href="${piece.links.original}" target="_blank" title="Œuvre originale">🎬 Original</a>`);
            }
            if (piece.links.purchase) {
                linksHTML.push(`<a href="${piece.links.purchase}" target="_blank" title="Lien d'achat">🛒 Achat</a>`);
            }
        }
        
        return `<div class="piece-card">
                    <h3>${piece.title}</h3>
                    ${piece.composer ? `<p><strong>Compositeur:</strong> ${piece.composer}</p>` : ''}
                    ${piece.duration ? `<p><strong>Durée:</strong> ${piece.duration}</p>` : ''}
                    ${piece.info ? `<p><strong>Info:</strong> ${piece.info}</p>` : ''}
                    ${linksHTML.length > 0 ? `<div class="links">
                        ${linksHTML.join('\n                        ')}
                    </div>` : ''}
                </div>`;
    }

    generateReport(sections) {
        console.log('\n📊 === RAPPORT DE MISE À JOUR INTELLIGENTE ===');
        console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
        
        let totalPieces = 0;
        let sectionsWithData = 0;
        
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                console.log(`🎭 ${section.title}: ${section.pieces.length} pièce(s)`);
                totalPieces += section.pieces.length;
                sectionsWithData++;
            }
        });
        
        console.log(`\n✅ ${sectionsWithData} section(s) avec données`);
        console.log(`🎵 ${totalPieces} pièce(s) au total`);
        console.log('🌐 Site web régénéré complètement');
        console.log('🔄 Toutes les données sont maintenant synchronisées avec Notion');
        console.log('=====================================\n');
    }
}

// Fonction principale
async function main() {
    const updater = new IntelligentSiteUpdater();
    await updater.updateSite();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = IntelligentSiteUpdater;
