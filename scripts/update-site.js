#!/usr/bin/env node

/**
 * Script d'intégration des données Notion dans le site web
 * Programme Musical 2026
 */

const fs = require('fs').promises;
const path = require('path');

class SiteUpdater {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.indexPath = path.join(__dirname, '..', 'index.html');
        this.backupDir = path.join(this.dataDir, 'site-backups');
    }

    /**
     * Met à jour le site avec les données Notion
     */
    async updateSite() {
        console.log('🔄 Mise à jour du site avec les données Notion...');
        
        try {
            // 1. Créer une sauvegarde du site actuel
            await this.createSiteBackup();
            
            // 2. Charger les données Notion
            const notionData = await this.loadNotionData();
            
            // 3. Charger le site actuel
            const currentSite = await this.loadCurrentSite();
            
            // 4. Fusionner les données
            const mergedData = await this.mergeData(currentSite, notionData);
            
            // 5. Mettre à jour le HTML
            await this.updateHTML(mergedData);
            
            console.log('✅ Site mis à jour avec succès !');
            this.generateUpdateReport(notionData);
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error.message);
            throw error;
        }
    }

    /**
     * Crée une sauvegarde du site actuel
     */
    async createSiteBackup() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(this.backupDir, `index-${timestamp}.html`);
            
            const currentHTML = await fs.readFile(this.indexPath, 'utf8');
            await fs.writeFile(backupPath, currentHTML);
            
            console.log(`💾 Sauvegarde créée: ${backupPath}`);
        } catch (error) {
            console.warn('⚠️ Impossible de créer la sauvegarde:', error.message);
        }
    }

    /**
     * Charge les données Notion
     */
    async loadNotionData() {
        const data = { concerts: [], pieces: [] };
        
        try {
            // Charger les concerts
            const concertsPath = path.join(this.dataDir, 'concerts.json');
            const concertsData = await fs.readFile(concertsPath, 'utf8');
            data.concerts = JSON.parse(concertsData).concerts || [];
            console.log(`📊 ${data.concerts.length} concerts chargés depuis Notion`);
        } catch (error) {
            console.warn('⚠️ Impossible de charger concerts.json:', error.message);
        }
        
        try {
            // Charger les pièces
            const piecesPath = path.join(this.dataDir, 'pieces.json');
            const piecesData = await fs.readFile(piecesPath, 'utf8');
            data.pieces = JSON.parse(piecesData).pieces || [];
            console.log(`🎵 ${data.pieces.length} pièces chargées depuis Notion`);
        } catch (error) {
            console.warn('⚠️ Impossible de charger pieces.json:', error.message);
        }
        
        return data;
    }

    /**
     * Charge la structure actuelle du site
     */
    async loadCurrentSite() {
        const html = await fs.readFile(this.indexPath, 'utf8');
        
        // Extraire les sections de concerts existantes
        const sections = [];
        const sectionRegex = /<section[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/section>/g;
        let match;
        
        while ((match = sectionRegex.exec(html)) !== null) {
            const sectionId = match[1];
            const sectionHTML = match[0];
            
            // Extraire le titre de la section
            const titleMatch = sectionHTML.match(/<h2[^>]*>(.*?)<\/h2>/);
            const title = titleMatch ? titleMatch[1].trim() : sectionId;
            
            sections.push({
                id: sectionId,
                title: title,
                html: sectionHTML,
                pieces: this.extractPiecesFromSection(sectionHTML)
            });
        }
        
        console.log(`📋 ${sections.length} sections existantes détectées`);
        return { html, sections };
    }

    /**
     * Extrait les pièces d'une section HTML
     */
    extractPiecesFromSection(sectionHTML) {
        const pieces = [];
        const pieceRegex = /<div[^>]*class="[^"]*piece-card[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
        let match;
        
        while ((match = pieceRegex.exec(sectionHTML)) !== null) {
            const pieceHTML = match[1];
            
            // Extraire les informations de la pièce
            const titleMatch = pieceHTML.match(/<h3[^>]*>(.*?)<\/h3>/);
            const composerMatch = pieceHTML.match(/<p[^>]*class="[^"]*composer[^"]*"[^>]*>(.*?)<\/p>/);
            const durationMatch = pieceHTML.match(/<span[^>]*class="[^"]*duration[^"]*"[^>]*>(.*?)<\/span>/);
            const infoMatch = pieceHTML.match(/<p[^>]*class="[^"]*info[^"]*"[^>]*>(.*?)<\/p>/);
            
            pieces.push({
                title: titleMatch ? titleMatch[1].trim() : '',
                composer: composerMatch ? composerMatch[1].trim() : '',
                duration: durationMatch ? durationMatch[1].trim() : '',
                info: infoMatch ? infoMatch[1].trim() : '',
                html: match[0]
            });
        }
        
        return pieces;
    }

    /**
     * Fusionne les données existantes avec les données Notion
     */
    async mergeData(currentSite, notionData) {
        console.log('🔄 Fusion des données...');
        
        const merged = {
            sections: [...currentSite.sections],
            newConcerts: [],
            updatedPieces: 0,
            newPieces: 0
        };
        
        // Traiter les concerts Notion (créer de nouvelles sections)
        for (const concert of notionData.concerts) {
            // Vérifier si une section existe déjà pour ce concert
            const existingSection = merged.sections.find(s => 
                this.normalizeTitle(s.title) === this.normalizeTitle(concert.title) ||
                s.id === concert.id
            );
            
            if (!existingSection) {
                merged.newConcerts.push(concert);
                merged.sections.push({
                    id: concert.id,
                    title: concert.title,
                    isNew: true,
                    pieces: [],
                    source: concert.source
                });
            }
        }
        
        // Traiter les pièces Notion
        for (const piece of notionData.pieces) {
            if (!piece.title) continue;
            
            // Trouver la section correspondante
            let targetSection = null;
            
            // 1. Par relation directe (si la pièce a un concert associé)
            if (piece.concert) {
                const concertNames = Array.isArray(piece.concert) ? piece.concert : [piece.concert];
                for (const concertName of concertNames) {
                    targetSection = merged.sections.find(s => 
                        this.normalizeTitle(s.title).includes(this.normalizeTitle(concertName)) ||
                        this.normalizeTitle(concertName).includes(this.normalizeTitle(s.title))
                    );
                    if (targetSection) break;
                }
            }
            
            // 2. Par correspondance de titre avec les sections existantes
            if (!targetSection) {
                targetSection = merged.sections.find(s => 
                    s.pieces.some(p => this.normalizeTitle(p.title) === this.normalizeTitle(piece.title))
                );
            }
            
            // 3. Créer une section "Nouvelles pièces" si aucune correspondance
            if (!targetSection) {
                targetSection = merged.sections.find(s => s.id === 'nouvelles-pieces');
                if (!targetSection) {
                    targetSection = {
                        id: 'nouvelles-pieces',
                        title: 'Nouvelles pièces depuis Notion',
                        isNew: true,
                        pieces: []
                    };
                    merged.sections.push(targetSection);
                }
            }
            
            // Ajouter ou mettre à jour la pièce
            const existingPiece = targetSection.pieces.find(p => 
                this.normalizeTitle(p.title) === this.normalizeTitle(piece.title)
            );
            
            if (existingPiece) {
                // Mettre à jour la pièce existante
                Object.assign(existingPiece, piece);
                merged.updatedPieces++;
            } else {
                // Ajouter une nouvelle pièce
                targetSection.pieces.push(piece);
                merged.newPieces++;
            }
        }
        
        console.log(`🎭 ${merged.newConcerts.length} nouveaux concerts`);
        console.log(`🎵 ${merged.newPieces} nouvelles pièces`);
        console.log(`🔄 ${merged.updatedPieces} pièces mises à jour`);
        
        return merged;
    }

    /**
     * Met à jour le fichier HTML
     */
    async updateHTML(mergedData) {
        let html = await fs.readFile(this.indexPath, 'utf8');
        
        // Générer le HTML pour les nouvelles sections
        for (const section of mergedData.sections.filter(s => s.isNew)) {
            const sectionHTML = this.generateSectionHTML(section);
            
            // Insérer avant la section de financement (ou à la fin du main)
            const insertPoint = html.indexOf('<section id="financement"');
            if (insertPoint !== -1) {
                html = html.slice(0, insertPoint) + sectionHTML + '\n\n        ' + html.slice(insertPoint);
            } else {
                // Insérer avant la fermeture de main
                const mainCloseIndex = html.lastIndexOf('</main>');
                if (mainCloseIndex !== -1) {
                    html = html.slice(0, mainCloseIndex) + '        ' + sectionHTML + '\n\n    ' + html.slice(mainCloseIndex);
                }
            }
        }
        
        await fs.writeFile(this.indexPath, html);
        console.log('✅ Fichier HTML mis à jour');
    }

    /**
     * Génère le HTML pour une section
     */
    generateSectionHTML(section) {
        const piecesHTML = section.pieces.map(piece => this.generatePieceHTML(piece)).join('\n                ');
        
        return `<section id="${section.id}">
            <h2>${section.title}</h2>
            <div class="pieces-grid">
                ${piecesHTML}
            </div>
        </section>`;
    }

    /**
     * Génère le HTML pour une pièce
     */
    generatePieceHTML(piece) {
        const links = piece.links || {};
        const linksHTML = [];
        
        if (links.audio) {
            linksHTML.push(`<a href="${links.audio}" target="_blank" title="Arrangement audio">🎵</a>`);
        }
        if (links.original) {
            linksHTML.push(`<a href="${links.original}" target="_blank" title="Œuvre originale">🎬</a>`);
        }
        if (links.purchase) {
            linksHTML.push(`<a href="${links.purchase}" target="_blank" title="Lien d'achat">🛒</a>`);
        }
        
        return `<div class="piece-card">
                    <h3>${piece.title}</h3>
                    ${piece.composer ? `<p class="composer">${piece.composer}</p>` : ''}
                    ${piece.duration ? `<span class="duration">${piece.duration}</span>` : ''}
                    ${piece.info ? `<p class="info">${piece.info}</p>` : ''}
                    ${linksHTML.length > 0 ? `<div class="links">${linksHTML.join(' ')}</div>` : ''}
                </div>`;
    }

    /**
     * Normalise un titre pour la comparaison
     */
    normalizeTitle(title) {
        return title.toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Génère un rapport de mise à jour
     */
    generateUpdateReport(notionData) {
        console.log('\n📊 Rapport de mise à jour');
        console.log('═'.repeat(40));
        console.log(`🗓️ Date: ${new Date().toLocaleString('fr-FR')}`);
        console.log(`🎭 Concerts dans Notion: ${notionData.concerts.length}`);
        console.log(`🎵 Pièces dans Notion: ${notionData.pieces.length}`);
        console.log(`🔗 Site web mis à jour avec les nouvelles données`);
        console.log('✅ Synchronisation terminée !');
    }
}

// Fonction principale
async function main() {
    const updater = new SiteUpdater();
    await updater.updateSite();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SiteUpdater;
