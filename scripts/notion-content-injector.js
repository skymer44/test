#!/usr/bin/env node

/**
 * 🎯 NOTION CONTENT INJECTOR - Architecture sécurisée
 * 
 * Ce script injecte UNIQUEMENT le contenu Notion dans la zone dédiée
 * sans jamais toucher au HTML statique (navigation, événements, partitions)
 * 
 * Principe : INJECTION CIBLÉE au lieu de RÉGÉNÉRATION COMPLÈTE
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class NotionContentInjector {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.indexPath = path.join(__dirname, '..', 'index.html');
        this.backupDir = path.join(this.dataDir, 'site-backups');
        
        // Zone cible pour l'injection Notion (UNIQUEMENT cette zone)
        this.targetSelector = '#programmes-content';
        
        // Ordre des sections (selon l'organisation exacte de votre Notion)
        this.sectionOrder = [
            'ma-region-virtuose',        // Ma région virtuose
            'concert-eric-aubier',       // Concert du 11 d'avril avec Eric Aubier
            'conservatoire-60-ans',      // Insertion dans les 60 ans du Conservatoire
            'fete-musique',              // Programme fête de la musique
            'retour-karaoke',            // Retour Karaoké
            'loto',                      // Loto
            'pieces-ajout',              // Pièces d'ajout sans direction
            'pieces-orphelines',         // Pièces qui n'ont pas trouvé leur concert
            'nouvelles-pieces'           // Nouvelles pièces (fallback)
        ];
        
        // Mapping des bases de données Notion vers les sections du site
        // Ce mapping permet de maintenir un ordre stable même si vous changez les noms dans Notion
        this.sectionMapping = {
            // Mapping exact (nom complet)
            'Ma région virtuose': 'ma-region-virtuose',
            'Ma région virtuose 0': 'ma-region-virtuose',  // Nouveau nom détecté
            'Concert du 11 d\'avril avec Eric Aubier': 'concert-eric-aubier',
            'Insertion dans les 60 ans du Conservatoire ': 'conservatoire-60-ans',
            'Retour Karaoké': 'retour-karaoke',
            'Programme fête de la musique': 'fete-musique',
            'Loto': 'loto',
            'Pièces d\'ajout sans direction': 'pieces-ajout',
            'Pièces qui n\'ont pas trouvé leur concert': 'pieces-orphelines'
        };
        
        // Mapping par mots-clés (détection intelligente pour nouveaux noms)
        this.keywordMapping = {
            'ma région': 'ma-region-virtuose',
            'région virtuose': 'ma-region-virtuose',
            'concert.*eric.*aubier': 'concert-eric-aubier',
            'eric aubier': 'concert-eric-aubier',
            'conservatoire.*60': 'conservatoire-60-ans',
            '60.*conservatoire': 'conservatoire-60-ans',
            'fête.*musique': 'fete-musique',
            'programme.*fête': 'fete-musique',
            'retour.*karaoké': 'retour-karaoke',
            'karaoké': 'retour-karaoke',
            'loto': 'loto',
            'pièces.*ajout': 'pieces-ajout',
            'ajout.*direction': 'pieces-ajout',
            'pas.*trouvé': 'pieces-orphelines',
            'orphelines': 'pieces-orphelines'
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

    async injectNotionContent() {
        try {
            console.log('🎯 === INJECTION CIBLÉE DU CONTENU NOTION ===');
            
            // 1. Créer une sauvegarde de sécurité
            await this.createBackup();
            
            // 2. Charger les données Notion
            const piecesData = await this.loadNotionData();
            console.log(`📊 ${piecesData.length} pièces chargées depuis Notion`);
            
            // 3. Organiser les données par sections
            const sections = this.organizePiecesBySection(piecesData);
            
            // 4. Lire le HTML actuel (SANS LE MODIFIER)
            const htmlContent = await fs.readFile(this.indexPath, 'utf8');
            
            // 5. Injection ciblée avec DOM parsing
            const updatedHTML = await this.injectContentIntoTarget(htmlContent, sections);
            
            // 6. Sauvegarder le HTML modifié
            await fs.writeFile(this.indexPath, updatedHTML);
            
            console.log('✅ Injection réussie dans la zone #programmes-content');
            console.log('🔒 Navigation, événements et partitions PRÉSERVÉS');
            
            this.generateReport(sections);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'injection:', error.message);
            throw error;
        }
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `index-injector-${timestamp}.html`);
        
        await fs.mkdir(this.backupDir, { recursive: true });
        await fs.copyFile(this.indexPath, backupPath);
        
        console.log(`💾 Sauvegarde créée: ${backupPath}`);
    }

    async loadNotionData() {
        const piecesPath = path.join(this.dataDir, 'pieces.json');
        const data = JSON.parse(await fs.readFile(piecesPath, 'utf8'));
        return data.pieces || [];
    }

    organizePiecesBySection(pieces) {
        const sections = {};
        
        // Détecter les nouveaux noms de bases de données
        const detectedDatabases = new Set();
        pieces.forEach(piece => {
            if (piece.source?.database) {
                detectedDatabases.add(piece.source.database);
            }
        });
        
        console.log('📋 Bases de données détectées dans Notion:');
        detectedDatabases.forEach(dbName => {
            const sectionId = this.getSectionForDatabase(dbName);
            const isKnown = Object.keys(this.sectionMapping).includes(dbName);
            console.log(`  ${isKnown ? '✅' : '🆕'} "${dbName}" → ${sectionId}`);
        });
        
        pieces.forEach(piece => {
            const databaseName = piece.source?.database;
            if (databaseName) {
                const sectionId = this.getSectionForDatabase(databaseName);
                const sectionTitle = databaseName; // Utiliser directement le nom de la base Notion
                
                if (!sections[sectionId]) {
                    sections[sectionId] = {
                        id: sectionId,
                        title: sectionTitle,
                        pieces: []
                    };
                }
                
                sections[sectionId].pieces.push(piece);
                console.log(`📋 "${piece.title}" → ${sectionTitle}`);
            }
        });
        
        // Trier les pièces dans chaque section par ordre Notion
        Object.values(sections).forEach(section => {
            if (section.pieces.length > 0) {
                section.pieces.sort((a, b) => {
                    const orderA = a.source?.order;
                    const orderB = b.source?.order;
                    
                    if (orderA !== null && orderA !== undefined && orderB !== null && orderB !== undefined) {
                        return orderA - orderB;
                    }
                    if (orderA !== null && orderA !== undefined) return -1;
                    if (orderB !== null && orderB !== undefined) return 1;
                    
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

    getSectionForDatabase(databaseName) {
        const normalizedName = databaseName.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
        
        // 1. Tentative de mapping exact
        if (this.sectionMapping[normalizedName]) {
            return this.sectionMapping[normalizedName];
        }
        
        // 2. Détection intelligente par mots-clés
        const lowerName = normalizedName.toLowerCase();
        for (const [keyword, sectionId] of Object.entries(this.keywordMapping)) {
            const regex = new RegExp(keyword, 'i');
            if (regex.test(lowerName)) {
                console.log(`🔍 Détection automatique: "${databaseName}" → ${sectionId} (via "${keyword}")`);
                // Ajouter au mapping pour la prochaine fois
                this.sectionMapping[normalizedName] = sectionId;
                return sectionId;
            }
        }
        
        // 3. Fallback : nouvelles pièces
        console.log(`⚠️ Base inconnue: "${databaseName}" → nouvelles-pieces`);
        return 'nouvelles-pieces';
    }

    async injectContentIntoTarget(htmlContent, sections) {
        // Vérification préliminaire: s'assurer qu'il n'y a pas déjà de duplication
        const initialCardCount = (htmlContent.match(/class="piece-card"/g) || []).length;
        if (initialCardCount > 20) {
            console.log(`⚠️ ALERTE: ${initialCardCount} cartes détectées dans le HTML initial (probable duplication)`);
            console.log('🧹 Nettoyage automatique renforcé activé...');
            
            // NETTOYAGE RENFORCÉ: Supprimer TOUT le contenu entre les balises programmes
            // Chercher la div programmes et vider complètement son contenu
            const programmesPattern = /(<div[^>]*id=["\']programmes["\'][^>]*class=["\']tab-content["\'][^>]*>)([\s\S]*?)(<\/div>\s*<!--)/;
            
            if (programmesPattern.test(htmlContent)) {
                console.log('🧹 Nettoyage complet de la section programmes...');
                htmlContent = htmlContent.replace(programmesPattern, '$1\n            <!-- ZONE NOTION - Contenu injecté automatiquement -->\n            <div id="programmes-content">\n            </div>\n        $3');
            } else {
                // Fallback: nettoyage de la zone programmes-content uniquement
                htmlContent = htmlContent.replace(/(<div[^>]*id=["\']programmes-content["\'][^>]*>)[\s\S]*?(<\/div>)/g, '$1\n        <!-- Zone nettoyée -->\n        $2');
            }
        }
        
        // Générer le contenu des sections EN RESPECTANT L'ORDRE DÉFINI
        const sectionsHTML = this.sectionOrder
            .map(sectionId => sections[sectionId])
            .filter(section => section && section.pieces.length > 0)
            .map(section => this.generateSectionHTML(section))
            .join('\n        ');
        
        // Utiliser une regex pour cibler spécifiquement la zone programmes-content
        // Cette regex capture TOUT le contenu entre les balises <div id="programmes-content"> et </div>
        const targetPattern = /(<div[^>]*id=["\']programmes-content["\'][^>]*>)([\s\S]*?)(<\/div>)/;
        
        const replacement = `$1\n        ${sectionsHTML}\n        $3`;
        
        if (targetPattern.test(htmlContent)) {
            console.log('🎯 Zone #programmes-content trouvée et mise à jour');
            const updatedContent = htmlContent.replace(targetPattern, replacement);
            
            // Validation: vérifier qu'il n'y a pas de contenu dupliqué
            const pieceCardCount = (updatedContent.match(/class="piece-card"/g) || []).length;
            console.log(`🔍 Validation: ${pieceCardCount} cartes détectées dans le HTML final`);
            
            return updatedContent;
        } else {
            console.log('⚠️ Zone #programmes-content non trouvée, recherche alternative...');
            
            // Fallback : chercher la section programmes
            const programmesSectionPattern = /(<div[^>]*id=["\']programmes["\'][^>]*class=["\']tab-content["\'][^>]*>)(.*?)(<\/div>\s*<\/main>)/s;
            
            if (programmesSectionPattern.test(htmlContent)) {
                console.log('🎯 Injection dans la section programmes');
                const programmesSectionsContent = `$1\n            <div id="programmes-content">\n        ${sectionsHTML}\n            </div>\n        $3`;
                return htmlContent.replace(programmesSectionPattern, programmesSectionsContent);
            }
        }
        
        throw new Error('Impossible de trouver la zone cible pour l\'injection');
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
        
        return `<!-- ${section.title} -->
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
        console.log('\n📊 === RAPPORT D\'INJECTION CIBLÉE ===');
        console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
        
        let totalPieces = 0;
        let sectionsWithData = 0;
        
        // Afficher le rapport en respectant l'ordre défini
        this.sectionOrder.forEach(sectionId => {
            const section = sections[sectionId];
            if (section && section.pieces.length > 0) {
                console.log(`🎭 ${section.title}: ${section.pieces.length} pièce(s)`);
                totalPieces += section.pieces.length;
                sectionsWithData++;
            }
        });
        
        console.log(`\n✅ ${sectionsWithData} section(s) avec données`);
        console.log(`🎵 ${totalPieces} pièce(s) au total`);
        console.log('🎯 Injection ciblée dans #programmes-content UNIQUEMENT');
        console.log('🔒 Navigation, événements et partitions INTACTS');
        console.log('=====================================\n');
    }
}

// Fonction principale
async function main() {
    const injector = new NotionContentInjector();
    await injector.injectNotionContent();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = NotionContentInjector;
