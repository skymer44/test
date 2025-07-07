#!/usr/bin/env node

/**
 * 🔄 MISE À JOUR HTML AVEC DONNÉES NOTION
 * 
 * Ce script intègre directement les données Notion dans le fichier HTML
 * pour que le site fonctionne en production sur GitHub Pages
 */

const fs = require('fs').promises;
const path = require('path');

class HTMLNotionUpdater {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.htmlPath = path.join(this.rootDir, 'index.html');
        this.dataDir = path.join(this.rootDir, 'data');
    }

    async updateHTML() {
        try {
            console.log('🔄 === MISE À JOUR HTML AVEC DONNÉES NOTION ===');
            
            // 1. Charger les données Notion
            const notionData = await this.loadNotionData();
            
            // 2. Charger le HTML actuel
            let htmlContent = await fs.readFile(this.htmlPath, 'utf8');
            
            // 3. Nettoyer les métadonnées de cache-busting dupliquées
            htmlContent = this.cleanCacheBustingTags(htmlContent);
            
            // 4. Générer le HTML des concerts
            const concertsHTML = this.generateConcertsHTML(notionData);
            
            // 5. Remplacer le contenu dans le HTML
            htmlContent = this.replaceConcertsContent(htmlContent, concertsHTML);
            
            // 6. Ajouter les métadonnées de mise à jour
            htmlContent = this.addUpdateMetadata(htmlContent, notionData);
            
            // 7. Sauvegarder le HTML mis à jour
            await fs.writeFile(this.htmlPath, htmlContent);
            
            console.log(`✅ HTML mis à jour avec ${notionData.pieces.length} pièces et ${notionData.events.length} événements`);
            console.log('🌐 Site prêt pour la production !');
            
            return {
                pieces: notionData.pieces.length,
                events: notionData.events.length,
                sections: this.countSections(concertsHTML)
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour HTML:', error.message);
            throw error;
        }
    }

    async loadNotionData() {
        const data = { pieces: [], events: [] };
        
        try {
            // Charger les pièces
            const piecesPath = path.join(this.dataDir, 'pieces.json');
            if (await this.fileExists(piecesPath)) {
                const piecesData = JSON.parse(await fs.readFile(piecesPath, 'utf8'));
                data.pieces = piecesData.pieces || [];
            }
            
            // Charger les événements
            const eventsPath = path.join(this.dataDir, 'events.json');
            if (await this.fileExists(eventsPath)) {
                const eventsData = JSON.parse(await fs.readFile(eventsPath, 'utf8'));
                data.events = eventsData.events || [];
            }
            
            console.log(`📊 Données chargées: ${data.pieces.length} pièces, ${data.events.length} événements`);
            return data;
            
        } catch (error) {
            console.warn('⚠️ Impossible de charger les données Notion:', error.message);
            return data;
        }
    }

    async fileExists(path) {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }

    cleanCacheBustingTags(html) {
        // Supprimer les métadonnées de cache-busting dupliquées
        const cleanHTML = html.replace(
            /<!-- Cache Busting - Version v\d+_[a-f0-9]+ -->\s*<meta[^>]*Cache-Control[^>]*>\s*<meta[^>]*Pragma[^>]*>\s*<meta[^>]*Expires[^>]*>\s*<meta[^>]*version[^>]*>\s*<meta[^>]*build-time[^>]*>\s*/g,
            ''
        );
        
        console.log('🧹 Métadonnées de cache-busting nettoyées');
        return cleanHTML;
    }

    generateConcertsHTML(notionData) {
        // Organiser les pièces par base de données (sections)
        const sections = this.organizePiecesBySections(notionData.pieces);
        
        let concertsHTML = '';
        
        // Générer chaque section
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                concertsHTML += this.generateSectionHTML(section);
            }
        });
        
        return concertsHTML;
    }

    organizePiecesBySections(pieces) {
        const sections = {};
        
        // Mapping des bases de données vers les sections
        const sectionMapping = {
            'Ma région virtuose': 'ma-region-virtuose',
            'Concert du 11 d\'avril avec Eric Aubier': 'concert-eric-aubier',
            'Insertion dans les 60 ans du Conservatoire ': 'conservatoire-60-ans',
            'Retour Karaoké': 'retour-karaoke',
            'Programme fête de la musique': 'fete-musique',
            'Loto': 'loto',
            'Pièces d\'ajout sans direction': 'pieces-ajout',
            'Pièces qui n\'ont pas trouvé leur concert': 'pieces-orphelines'
        };
        
        const sectionTitles = {
            'ma-region-virtuose': 'Ma région virtuose',
            'concert-eric-aubier': 'Concert du 11 d\'avril avec Eric Aubier',
            'conservatoire-60-ans': 'Insertion dans les 60 ans du Conservatoire',
            'retour-karaoke': 'Retour Karaoké',
            'fete-musique': 'Programme fête de la musique',
            'loto': 'Loto',
            'pieces-ajout': 'Pièces d\'ajout sans direction',
            'pieces-orphelines': 'Pièces qui n\'ont pas trouvé leur concert'
        };
        
        // Initialiser toutes les sections
        Object.values(sectionMapping).forEach(sectionId => {
            sections[sectionId] = {
                id: sectionId,
                title: sectionTitles[sectionId],
                pieces: []
            };
        });
        
        // Répartir les pièces dans les sections
        pieces.forEach(piece => {
            const dbName = piece.source?.database;
            if (dbName) {
                const normalizedName = this.normalizeDatabaseName(dbName);
                const sectionId = sectionMapping[normalizedName] || 'pieces-orphelines';
                
                if (sections[sectionId]) {
                    sections[sectionId].pieces.push(piece);
                }
            }
        });
        
        // Trier les pièces dans chaque section par ordre
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

    normalizeDatabaseName(name) {
        return name.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
    }

    generateSectionHTML(section) {
        const piecesHTML = section.pieces.map(piece => this.generatePieceHTML(piece)).join('\n                ');
        
        // Calculer la durée totale
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
        
        const totalTimeDisplay = this.formatTime(totalSeconds);
        
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

    formatTime(seconds) {
        if (seconds <= 0) return '';
        
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
    }

    replaceConcertsContent(html, concertsHTML) {
        // Chercher la section des concerts et la remplacer
        const concertSectionRegex = /(<div class="tab-content" id="concerts"[^>]*>)(.*?)(<\/div>\s*<\/div>)/s;
        
        const newConcertsSection = `$1
        <div class="concerts-container">
            ${concertsHTML}
        </div>
        $3`;
        
        if (concertSectionRegex.test(html)) {
            return html.replace(concertSectionRegex, newConcertsSection);
        } else {
            console.warn('⚠️ Section des concerts non trouvée dans le HTML');
            return html;
        }
    }

    addUpdateMetadata(html, notionData) {
        const timestamp = new Date().toISOString();
        const version = `v${timestamp.substring(0, 10).replace(/-/g, '')}_notion`;
        
        // Ajouter les métadonnées juste après <head>
        const metadataHTML = `
    <!-- Mise à jour Notion -->
    <meta name="notion-sync" content="${timestamp}">
    <meta name="notion-pieces" content="${notionData.pieces.length}">
    <meta name="notion-events" content="${notionData.events.length}">
    <meta name="site-version" content="${version}">`;
        
        return html.replace('<head>', `<head>${metadataHTML}`);
    }

    countSections(html) {
        const sections = (html.match(/class="concert-section"/g) || []).length;
        return sections;
    }
}

// Fonction principale
async function main() {
    const updater = new HTMLNotionUpdater();
    const result = await updater.updateHTML();
    
    console.log('\n📊 === RÉSUMÉ DE LA MISE À JOUR ===');
    console.log(`🎵 Pièces intégrées: ${result.pieces}`);
    console.log(`🗓️ Événements intégrés: ${result.events}`);
    console.log(`📁 Sections générées: ${result.sections}`);
    console.log('=====================================\n');
    
    return result;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = HTMLNotionUpdater;
