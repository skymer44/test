#!/usr/bin/env node

/**
 * 🏗️ Site Builder Intelligent - Séparation Code/Données
 * 
 * Ce script construit le site en combinant :
 * - Template HTML propre (/src/template.html)
 * - Données Notion (/data/pieces.json)
 * - Styles et Scripts (/src/)
 * 
 * Résultat : Site complet dans /build/index.html
 */

const fs = require('fs').promises;
const path = require('path');

class IntelligentSiteBuilder {
    constructor() {
        this.srcDir = path.join(__dirname, '..', 'src');
        this.dataDir = path.join(__dirname, '..', 'data');
        this.buildDir = path.join(__dirname, '..', 'build');
        
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

    async buildSite() {
        console.log('🏗️ === CONSTRUCTION INTELLIGENTE DU SITE ===');
        
        try {
            // 1. Créer le dossier build s'il n'existe pas
            await fs.mkdir(this.buildDir, { recursive: true });
            
            // 2. Charger le template HTML propre
            const template = await this.loadTemplate();
            
            // 3. Charger les données Notion
            const notionData = await this.loadNotionData();
            
            // 4. Organiser les données par sections
            const organizedData = this.organizeDataBySections(notionData);
            
            // 5. Générer le contenu des concerts
            const concertsHTML = this.generateConcertsHTML(organizedData);
            
            // 6. Construire le site final
            const finalHTML = template.replace('{{CONCERTS_CONTENT}}', concertsHTML);
            
            // 7. Sauvegarder dans build/
            await fs.writeFile(path.join(this.buildDir, 'index.html'), finalHTML);
            
            // 8. Copier les assets (CSS, JS)
            await this.copyAssets();
            
            console.log('✅ Site construit avec succès dans /build/ !');
            this.generateReport(organizedData);
            
        } catch (error) {
            console.error('❌ Erreur lors de la construction:', error.message);
            throw error;
        }
    }

    async loadTemplate() {
        try {
            const templatePath = path.join(this.srcDir, 'template.html');
            const template = await fs.readFile(templatePath, 'utf8');
            console.log('📄 Template HTML chargé depuis /src/');
            return template;
        } catch (error) {
            throw new Error(`Impossible de charger le template: ${error.message}`);
        }
    }

    async loadNotionData() {
        const data = { pieces: [] };
        
        try {
            const piecesPath = path.join(this.dataDir, 'pieces.json');
            const piecesData = await fs.readFile(piecesPath, 'utf8');
            data.pieces = JSON.parse(piecesData).pieces || [];
            
            console.log(`📊 ${data.pieces.length} pièces chargées depuis /data/`);
        } catch (error) {
            console.warn('⚠️ Impossible de charger pieces.json:', error.message);
        }
        
        return data;
    }

    // Normalise les noms de bases de données pour gérer les différents types d'apostrophes
    normalizeDatabaseName(name) {
        return name.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
    }

    // Obtient la section correspondante à une base de données
    getSectionForDatabase(databaseName) {
        const normalizedName = this.normalizeDatabaseName(databaseName);
        return this.sectionMapping[normalizedName] || 'pieces-orphelines';
    }

    organizeDataBySections(notionData) {
        console.log('🗂️ Organisation des données par sections...');
        
        const sections = {};
        
        // Initialiser toutes les sections connues
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
                
                if (sections[sectionId]) {
                    sections[sectionId].pieces.push(piece);
                    console.log(`📋 "${piece.title}" → ${this.sectionTitles[sectionId]}`);
                } else {
                    // Section non trouvée, créer une nouvelle section
                    sections[sectionId] = {
                        id: sectionId,
                        title: dbName,
                        pieces: [piece],
                        database: dbName
                    };
                    console.log(`📋 "${piece.title}" → ${dbName} (nouvelle section)`);
                }
            } else {
                console.log(`⚠️ Pas de base de données pour "${piece.title}"`);
                sections['pieces-orphelines'].pieces.push(piece);
            }
        });
        
        // Trier les pièces dans chaque section par ordre défini dans Notion
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
                
                console.log(`✅ ${section.title}: ${section.pieces.length} pièce(s)`);
            }
        });
        
        return sections;
    }

    generateConcertsHTML(sections) {
        let concertsHTML = '';
        
        // Générer chaque section avec ses pièces
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                concertsHTML += this.generateSectionHTML(section);
            }
        });
        
        return concertsHTML;
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

    async copyAssets() {
        try {
            // Copier CSS vers build/
            const cssSource = path.join(this.srcDir, 'styles.css');
            const cssTarget = path.join(this.buildDir, 'styles.css');
            await fs.copyFile(cssSource, cssTarget);
            
            // Copier JS vers build/
            const jsSource = path.join(this.srcDir, 'script.js');
            const jsTarget = path.join(this.buildDir, 'script.js');
            await fs.copyFile(jsSource, jsTarget);
            
            // Copier aussi vers la racine pour GitHub Pages
            const rootCssTarget = path.join(__dirname, '..', 'styles.css');
            const rootJsTarget = path.join(__dirname, '..', 'script.js');
            await fs.copyFile(cssSource, rootCssTarget);
            await fs.copyFile(jsSource, rootJsTarget);
            
            console.log('📁 Assets copiés (CSS + JS) vers /build/ et racine');
        } catch (error) {
            console.warn('⚠️ Erreur lors de la copie des assets:', error.message);
        }
    }

    generateReport(sections) {
        console.log('\n📊 === RAPPORT DE CONSTRUCTION ===');
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
        
        console.log(`\n✅ ${sectionsWithData} section(s) générée(s)`);
        console.log(`🎵 ${totalPieces} pièce(s) au total`);
        console.log('🏗️ Site construit dans /build/');
        console.log('🔄 Code et données parfaitement séparés');
        console.log('=====================================\n');
    }
}

// Fonction principale
async function main() {
    const builder = new IntelligentSiteBuilder();
    await builder.buildSite();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = IntelligentSiteBuilder;
