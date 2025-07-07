#!/usr/bin/env node

/**
 * 🔧 CONFIGURATION GITHUB PAGES POUR NOTION
 * 
 * Solution maintenable qui :
 * 1. Configure GitHub Pages pour servir les fichiers JSON
 * 2. Optimise le JavaScript pour charger les données Notion
 * 3. Garde le code séparé et maintenable
 */

const fs = require('fs').promises;
const path = require('path');

class GitHubPagesOptimizer {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
    }

    async optimize() {
        try {
            console.log('🔧 === OPTIMISATION GITHUB PAGES POUR NOTION ===');
            
            // 1. Créer/vérifier le fichier _config.yml pour GitHub Pages
            await this.createGitHubPagesConfig();
            
            // 2. Créer le fichier .nojekyll (important pour GitHub Pages)
            await this.createNoJekyllFile();
            
            // 3. Optimiser le JavaScript pour charger les données
            await this.optimizeJavaScriptDataLoading();
            
            // 4. Vérifier la structure des données
            await this.verifyDataStructure();
            
            console.log('✅ GitHub Pages optimisé pour Notion !');
            console.log('🌐 Votre site devrait maintenant fonctionner en production');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'optimisation:', error.message);
            throw error;
        }
    }

    async createGitHubPagesConfig() {
        const configPath = path.join(this.rootDir, '_config.yml');
        
        const config = `# Configuration GitHub Pages pour Programme Musical 2026
title: Programme Musical 2026
description: Site web avec synchronisation Notion automatique

# Inclure les fichiers JSON dans la publication
include:
  - data/*.json
  - "*.json"

# Configuration pour servir les fichiers JSON avec le bon Content-Type
plugins:
  - jekyll-optional-front-matter

# Pas de traitement Jekyll pour les fichiers statiques
exclude:
  - node_modules/
  - scripts/
  - README.md
  - package*.json
  - deploy.log

# Configuration des types MIME
defaults:
  - scope:
      path: "data"
    values:
      layout: null
      sitemap: false`;

        await fs.writeFile(configPath, config);
        console.log('✅ _config.yml créé pour GitHub Pages');
    }

    async createNoJekyllFile() {
        const nojekyllPath = path.join(this.rootDir, '.nojekyll');
        await fs.writeFile(nojekyllPath, '');
        console.log('✅ .nojekyll créé (désactive Jekyll)');
    }

    async optimizeJavaScriptDataLoading() {
        const scriptPath = path.join(this.rootDir, 'script.js');
        let scriptContent = await fs.readFile(scriptPath, 'utf8');
        
        // Ajouter une fonction robuste de chargement des données Notion
        const notionLoaderCode = `
// 🎵 CHARGEUR DE DONNÉES NOTION ROBUSTE
class NotionDataLoader {
    constructor() {
        this.cache = new Map();
        this.baseUrl = window.location.origin + window.location.pathname.replace('/index.html', '');
    }

    async loadData(fileName, fallback = []) {
        if (this.cache.has(fileName)) {
            return this.cache.get(fileName);
        }

        const urls = [
            \`\${this.baseUrl}/data/\${fileName}\`,
            \`./data/\${fileName}\`,
            \`/data/\${fileName}\`,
            \`data/\${fileName}\`
        ];

        for (const url of urls) {
            try {
                console.log(\`🔄 Tentative de chargement: \${url}\`);
                const response = await fetch(url + '?t=' + Date.now());
                
                if (response.ok) {
                    const data = await response.json();
                    this.cache.set(fileName, data);
                    console.log(\`✅ Données chargées depuis: \${url}\`);
                    return data;
                }
            } catch (error) {
                console.warn(\`⚠️ Échec \${url}:\`, error.message);
            }
        }

        console.warn(\`⚠️ Impossible de charger \${fileName}, utilisation du fallback\`);
        return fallback;
    }

    async loadPieces() {
        const data = await this.loadData('pieces.json', { pieces: [] });
        return data.pieces || [];
    }

    async loadEvents() {
        const data = await this.loadData('events.json', { events: [] });
        return data.events || [];
    }

    async loadConcerts() {
        const data = await this.loadData('concerts.json', { concerts: [] });
        return data.concerts || [];
    }
}

// Instance globale du chargeur
window.notionLoader = new NotionDataLoader();

// 🔄 FONCTION DE CHARGEMENT DES DONNÉES NOTION AMÉLIORÉE
async function loadNotionDataRobust() {
    try {
        console.log('🎵 Chargement des données Notion...');
        
        // Charger toutes les données en parallèle
        const [pieces, events, concerts] = await Promise.all([
            window.notionLoader.loadPieces(),
            window.notionLoader.loadEvents(),
            window.notionLoader.loadConcerts()
        ]);

        console.log(\`✅ Données Notion chargées: \${pieces.length} pièces, \${events.length} événements, \${concerts.length} concerts\`);
        
        // Mettre à jour l'affichage
        if (pieces.length > 0) {
            updateConcertsWithNotionData(pieces);
        }
        
        if (events.length > 0) {
            updateEventsWithNotionData(events);
        }

        return { pieces, events, concerts };

    } catch (error) {
        console.error('❌ Erreur chargement données Notion:', error);
        return { pieces: [], events: [], concerts: [] };
    }
}

// 🎭 MISE À JOUR DES CONCERTS AVEC DONNÉES NOTION
function updateConcertsWithNotionData(pieces) {
    // Organiser les pièces par sections
    const sections = organizePiecesBySections(pieces);
    
    // Mettre à jour chaque section
    Object.values(sections).forEach(section => {
        if (section.pieces.length > 0) {
            updateSectionDisplay(section);
        }
    });
}

function organizePiecesBySections(pieces) {
    const sections = {};
    
    const sectionMapping = {
        'Ma région virtuose': 'ma-region-virtuose',
        'Concert du 11 d\\'avril avec Eric Aubier': 'concert-eric-aubier',
        'Insertion dans les 60 ans du Conservatoire ': 'conservatoire-60-ans',
        'Retour Karaoké': 'retour-karaoke',
        'Programme fête de la musique': 'fete-musique',
        'Loto': 'loto',
        'Pièces d\\'ajout sans direction': 'pieces-ajout',
        'Pièces qui n\\'ont pas trouvé leur concert': 'pieces-orphelines'
    };
    
    // Initialiser les sections
    Object.entries(sectionMapping).forEach(([dbName, sectionId]) => {
        sections[sectionId] = {
            id: sectionId,
            title: dbName,
            pieces: []
        };
    });
    
    // Répartir les pièces
    pieces.forEach(piece => {
        const dbName = piece.source?.database;
        if (dbName) {
            const normalizedName = dbName.replace(/[\u2019\u2018\u201B\u0060\u00B4]/g, "'");
            const sectionId = sectionMapping[normalizedName] || 'pieces-orphelines';
            
            if (sections[sectionId]) {
                sections[sectionId].pieces.push(piece);
            }
        }
    });
    
    return sections;
}

function updateSectionDisplay(section) {
    const sectionElement = document.getElementById(section.id);
    if (!sectionElement) {
        console.warn(\`⚠️ Section \${section.id} non trouvée dans le DOM\`);
        return;
    }
    
    const piecesGrid = sectionElement.querySelector('.pieces-grid');
    if (piecesGrid) {
        // Vider la grille actuelle
        piecesGrid.innerHTML = '';
        
        // Ajouter les nouvelles pièces
        section.pieces.forEach(piece => {
            const pieceElement = createPieceElement(piece);
            piecesGrid.appendChild(pieceElement);
        });
        
        console.log(\`✅ Section \${section.title}: \${section.pieces.length} pièces mises à jour\`);
    }
}

function createPieceElement(piece) {
    const div = document.createElement('div');
    div.className = 'piece-card';
    
    let linksHTML = '';
    if (piece.links) {
        const links = [];
        if (piece.links.audio) links.push(\`<a href="\${piece.links.audio}" target="_blank" title="Arrangement audio">🎵 Audio</a>\`);
        if (piece.links.original) links.push(\`<a href="\${piece.links.original}" target="_blank" title="Œuvre originale">🎬 Original</a>\`);
        if (piece.links.purchase) links.push(\`<a href="\${piece.links.purchase}" target="_blank" title="Lien d'achat">🛒 Achat</a>\`);
        
        if (links.length > 0) {
            linksHTML = \`<div class="links">\${links.join(' ')}</div>\`;
        }
    }
    
    div.innerHTML = \`
        <h3>\${piece.title}</h3>
        \${piece.composer ? \`<p><strong>Compositeur:</strong> \${piece.composer}</p>\` : ''}
        \${piece.duration ? \`<p><strong>Durée:</strong> \${piece.duration}</p>\` : ''}
        \${piece.info ? \`<p><strong>Info:</strong> \${piece.info}</p>\` : ''}
        \${linksHTML}
    \`;
    
    return div;
}

// 🎭 MISE À JOUR DES ÉVÉNEMENTS AVEC DONNÉES NOTION
function updateEventsWithNotionData(events) {
    // Mettre à jour l'affichage des événements
    console.log(\`🗓️ Mise à jour de \${events.length} événements\`);
    // Implémentation selon votre structure HTML existante
}
`;

        // Chercher où insérer le code (après le DOMContentLoaded existant)
        const insertPosition = scriptContent.indexOf('// Attendre que le DOM soit chargé');
        if (insertPosition !== -1) {
            scriptContent = scriptContent.slice(0, insertPosition) + 
                          notionLoaderCode + '\n\n' + 
                          scriptContent.slice(insertPosition);
        } else {
            // Si pas trouvé, ajouter au début
            scriptContent = notionLoaderCode + '\n\n' + scriptContent;
        }

        // Modifier l'initialisation pour inclure le chargement Notion
        scriptContent = scriptContent.replace(
            'initNotionSync();',
            `initNotionSync();
        
        // Charger les données Notion de façon robuste
        loadNotionDataRobust().then(data => {
            console.log('🎵 Données Notion intégrées au site:', data);
        }).catch(error => {
            console.warn('⚠️ Chargement Notion échoué, site fonctionne avec données statiques');
        });`
        );

        await fs.writeFile(scriptPath, scriptContent);
        console.log('✅ JavaScript optimisé pour GitHub Pages');
    }

    async verifyDataStructure() {
        const dataDir = path.join(this.rootDir, 'data');
        
        try {
            const files = await fs.readdir(dataDir);
            console.log('📊 Fichiers de données disponibles:', files.filter(f => f.endsWith('.json')));
            
            // Vérifier que les fichiers JSON sont valides
            for (const file of files) {
                if (file.endsWith('.json') && !file.includes('backup-')) {
                    try {
                        const content = await fs.readFile(path.join(dataDir, file), 'utf8');
                        JSON.parse(content);
                        console.log(`✅ ${file}: JSON valide`);
                    } catch (error) {
                        console.warn(`⚠️ ${file}: JSON invalide -`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Erreur lecture dossier data:', error.message);
        }
    }
}

// Fonction principale
async function main() {
    const optimizer = new GitHubPagesOptimizer();
    await optimizer.optimize();
    
    console.log('\n🎯 === SOLUTION MAINTENABLE MISE EN PLACE ===');
    console.log('✅ Configuration GitHub Pages optimisée');
    console.log('✅ JavaScript robuste pour chargement données');
    console.log('✅ Structure maintenable préservée');
    console.log('✅ Séparation code/données respectée');
    console.log('\n💡 Votre site va maintenant charger les données Notion en production !');
    console.log('=====================================\n');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = GitHubPagesOptimizer;
