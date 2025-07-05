/**
 * Classe de synchronisation avec Notion via serveur proxy
 * Programme Musical 2026
 */

class NotionSyncProxy {
    constructor() {
        this.proxyUrl = 'http://localhost:3010/api';
        this.lastSyncTimestamp = Date.now();
    }

    /**
     * Test de connexion au serveur proxy
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.proxyUrl}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Connexion proxy OK:', data.message);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erreur connexion proxy:', error);
            return false;
        }
    }

    /**
     * Récupérer les données d'une base de données spécifique
     */
    async getPiecesFromDatabase(databaseKey) {
        try {
            console.log(`📡 Récupération base "${databaseKey}" via proxy...`);
            
            const response = await fetch(`${this.proxyUrl}/notion/database/${databaseKey}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur ${response.status}: ${errorData.error}`);
            }
            
            const data = await response.json();
            const pieces = this.parseNotionResults(data.results);
            
            console.log(`✅ ${pieces.length} pièces récupérées de "${databaseKey}"`);
            return pieces;
            
        } catch (error) {
            console.error(`❌ Erreur récupération ${databaseKey}:`, error);
            return [];
        }
    }

    /**
     * Synchronisation complète de toutes les bases
     */
    async syncAllData() {
        try {
            console.log('🔄 Synchronisation complète via proxy...');
            
            const response = await fetch(`${this.proxyUrl}/notion/all`);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }
            
            const allData = await response.json();
            const results = {};
            
            // Traiter chaque base de données
            for (const [databaseKey, data] of Object.entries(allData)) {
                if (data.error) {
                    console.warn(`⚠️ Erreur base ${databaseKey}:`, data.error);
                    continue;
                }
                
                const pieces = this.parseNotionResults(data.results);
                results[databaseKey] = pieces;
                
                // Mettre à jour l'interface
                this.updateSectionData(databaseKey, pieces);
            }
            
            this.lastSyncTimestamp = Date.now();
            console.log('✅ Synchronisation complète terminée');
            
            return results;
            
        } catch (error) {
            console.error('❌ Erreur synchronisation complète:', error);
            throw error;
        }
    }

    /**
     * Vérification rapide des changements
     */
    async checkForChanges() {
        try {
            const response = await fetch(`${this.proxyUrl}/notion/changes/${this.lastSyncTimestamp}`);
            
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            return data.hasChanges;
            
        } catch (error) {
            console.error('❌ Erreur vérification changements:', error);
            return false;
        }
    }

    /**
     * Synchronisation rapide (seulement si changements détectés)
     */
    async syncAllDataFast() {
        const hasChanges = await this.checkForChanges();
        
        if (hasChanges) {
            console.log('📝 Changements détectés - Synchronisation...');
            await this.syncAllData();
            return { hasChanges: true };
        } else {
            console.log('ℹ️ Aucun changement détecté');
            return { hasChanges: false };
        }
    }

    /**
     * Parser les résultats de l'API Notion
     */
    parseNotionResults(results) {
        return results.map(page => {
            const properties = page.properties;
            
            // Fonction utilitaire pour extraire les valeurs
            const getValue = (prop) => {
                if (!prop) return '';
                
                switch (prop.type) {
                    case 'title':
                        return prop.title?.[0]?.plain_text || '';
                    case 'rich_text':
                        return prop.rich_text?.[0]?.plain_text || '';
                    case 'number':
                        return prop.number || 0;
                    case 'url':
                        return prop.url || '';
                    case 'select':
                        return prop.select?.name || '';
                    case 'multi_select':
                        return prop.multi_select?.map(item => item.name).join(', ') || '';
                    case 'date':
                        return prop.date?.start || '';
                    case 'checkbox':
                        return prop.checkbox || false;
                    case 'files':
                        return prop.files?.[0]?.file?.url || prop.files?.[0]?.external?.url || '';
                    default:
                        return '';
                }
            };

            return {
                id: page.id,
                nom: getValue(properties['Nom']) || getValue(properties['Titre']),
                compositeur: getValue(properties['Compositeur']),
                duree: getValue(properties['Durée']) || getValue(properties['Duree']),
                ordre: getValue(properties['Ordre']),
                arrangement: getValue(properties['Arrangement Audio']),
                partition: getValue(properties['Partition']),
                difficulte: getValue(properties['Difficulté']),
                genre: getValue(properties['Genre']),
                notes: getValue(properties['Notes']),
                soliste: getValue(properties['Soliste']),
                montant: getValue(properties['Montant']),
                description: getValue(properties['Description']),
                statut: getValue(properties['Statut']),
                lastModified: page.last_edited_time
            };
        });
    }

    /**
     * Mettre à jour une section avec les nouvelles données
     */
    updateSectionData(databaseKey, pieces) {
        const sectionId = this.getDatabaseSectionId(databaseKey);
        if (!sectionId) return;

        const section = document.getElementById(sectionId);
        if (!section) return;

        const piecesContainer = section.querySelector('.pieces-container');
        if (!piecesContainer) return;

        // Vider le contenu existant
        piecesContainer.innerHTML = '';

        if (pieces.length === 0) {
            piecesContainer.innerHTML = '<p class="no-pieces">Aucune pièce ajoutée pour le moment.</p>';
            return;
        }

        // Ajouter chaque pièce
        pieces.forEach(piece => {
            const pieceElement = this.createPieceElement(piece);
            piecesContainer.appendChild(pieceElement);
        });
    }

    /**
     * Créer l'élément HTML pour une pièce
     */
    createPieceElement(piece) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece-card';
        pieceDiv.dataset.pieceId = piece.id;

        pieceDiv.innerHTML = `
            <h3>${piece.nom}</h3>
            ${piece.compositeur ? `<p><strong>Compositeur:</strong> ${piece.compositeur}</p>` : ''}
            ${piece.duree ? `<p><strong>Durée:</strong> ${piece.duree} min</p>` : ''}
            ${piece.difficulte ? `<p><strong>Difficulté:</strong> ${piece.difficulte}</p>` : ''}
            ${piece.genre ? `<p><strong>Genre:</strong> ${piece.genre}</p>` : ''}
            ${piece.soliste ? `<p><strong>Soliste:</strong> ${piece.soliste}</p>` : ''}
            ${piece.notes ? `<p><strong>Notes:</strong> ${piece.notes}</p>` : ''}
            ${piece.montant ? `<p><strong>Montant:</strong> ${piece.montant}€</p>` : ''}
            ${piece.description ? `<p><strong>Description:</strong> ${piece.description}</p>` : ''}
            
            <div class="piece-links">
                ${piece.arrangement ? `<a href="${piece.arrangement}" target="_blank" class="audio-link">🎵 Écouter</a>` : ''}
                ${piece.partition ? `<a href="${piece.partition}" target="_blank" class="pdf-link">📄 Partition</a>` : ''}
            </div>
        `;

        return pieceDiv;
    }

    /**
     * Mapper les clés de base de données vers les IDs de section
     */
    getDatabaseSectionId(databaseKey) {
        const mapping = {
            'ma-rgion-virtuose': 'ma-region-virtuose',
            'concert-eric-aubier': 'concert-eric-aubier',
            'concert-pascal-proust': 'concert-pascal-proust',
            'concert-david-walter': 'concert-david-walter',
            'concert-anthony-caillet': 'concert-anthony-caillet',
            'concert-mathieu-dufour': 'concert-mathieu-dufour',
            'concert-jean-christophe-morel': 'concert-jean-christophe-morel',
            'financement': 'financement'
        };
        
        return mapping[databaseKey] || null;
    }

    /**
     * Appliquer des animations aux nouvelles pièces
     */
    applyAnimationsToNewPieces() {
        const pieces = document.querySelectorAll('.piece-card');
        pieces.forEach((piece, index) => {
            piece.style.opacity = '0';
            piece.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                piece.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                piece.style.opacity = '1';
                piece.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Rendre la classe disponible globalement
window.NotionSyncProxy = NotionSyncProxy;
