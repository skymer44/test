/**
 * Extracteur de données PDF pour les programmes musicaux
 * Analyse les PDFs et extrait les informations structurées
 */

class PDFDataExtractor {
    constructor() {
        this.patterns = {
            // Patterns pour identifier les pièces musicales
            pieceTitle: /^([A-Za-z\s\-\.]+)$/,
            composer: /Compositeur:\s*(.+)/i,
            duration: /Durée:\s*([0-9:]+)/i,
            info: /Info:\s*(.+)/i,
            
            // Patterns pour les liens
            youtubeLink: /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            notionLink: /notion\.so\/([a-zA-Z0-9\-]+)/,
            purchaseLink: /(laflutedepan|sheetmusicdirect|alfred|jwpepper|hafabramusic|rundel|hebu-music|windmusicsales)\.com/,
            
            // Patterns pour les sections
            sectionHeaders: /(Ma région virtuose|Concert.*Eric Aubier|Programme fête|Pièces qui n'ont pas trouvé|Oregon|Autres pièces)/i
        };
    }

    /**
     * Extrait les données d'un document PDF
     */
    async extractFromPDF(pdfData) {
        try {
            // Simulation d'extraction PDF
            // En production, on utiliserait une vraie bibliothèque PDF comme PDF.js
            const extractedText = await this.simulatePDFTextExtraction(pdfData);
            const annotations = await this.extractPDFAnnotations(pdfData);
            
            return this.parseExtractedData(extractedText, annotations);
        } catch (error) {
            throw new Error(`Erreur lors de l'extraction PDF: ${error.message}`);
        }
    }

    /**
     * Simulation d'extraction de texte PDF
     */
    async simulatePDFTextExtraction(pdfData) {
        // Ici on simule l'extraction - en réalité on utiliserait PDF.js ou similaire
        return `
        Ma région virtuose (25 minutes)
        
        Ammerland
        Compositeur: Jacob de Haan
        Durée: 03:10
        Info: Très interessant pour le son mais assez chère
        
        Music from How To Train Your Dragon
        Compositeur: John Powell/arr. Sean O'Loughlin
        Durée: 04:50
        Info: Marche très bien, joviale
        
        test
        Compositeur: À définir
        Durée: À définir
        Info: Pièce en cours d'évaluation
        
        Concert du 11 avril avec Eric Aubier (1h)
        
        Aratunian
        Compositeur: ARUTIUNIAN Alexander / arr. SCHYNS José
        Durée: 16:00
        Info: Pièce complète mais pas évident / vérifier le niveau
        `;
    }

    /**
     * Extrait les annotations et liens du PDF
     */
    async extractPDFAnnotations(pdfData) {
        // Simulation basée sur ce qu'on a vu dans le PDF
        return [
            {
                type: 'link',
                url: 'https://www.notion.so/test-123-227fcf9e3abc800b9f33ccc90069ff0b?pvs=21',
                text: 'test',
                coordinates: { x: 73.5, y: 627.375 }
            },
            {
                type: 'link',
                url: 'https://www.youtube.com/watch?v=y5GQ0we6dOc',
                text: 'Ammerland audio',
                coordinates: { x: 143.8125, y: 672.375 }
            }
            // Autres liens extraits...
        ];
    }

    /**
     * Parse les données extraites en structure utilisable
     */
    parseExtractedData(text, annotations) {
        const programmes = [];
        const sections = this.identifySections(text);
        
        sections.forEach(section => {
            const pieces = this.extractPiecesFromSection(section, annotations);
            programmes.push(...pieces);
        });

        return {
            programmes: programmes,
            financement: this.extractFinancementData(text),
            metadata: {
                extractionDate: new Date().toISOString(),
                totalPieces: programmes.length,
                sections: sections.map(s => s.name)
            }
        };
    }

    /**
     * Identifie les sections dans le texte
     */
    identifySections(text) {
        const sections = [];
        const lines = text.split('\n');
        let currentSection = null;
        let currentContent = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (this.patterns.sectionHeaders.test(trimmedLine)) {
                // Sauvegarder la section précédente
                if (currentSection) {
                    sections.push({
                        name: currentSection,
                        content: currentContent.join('\n'),
                        startLine: sections.length > 0 ? sections[sections.length - 1].endLine : 0,
                        endLine: index
                    });
                }
                
                // Nouvelle section
                currentSection = trimmedLine;
                currentContent = [];
            } else if (currentSection && trimmedLine) {
                currentContent.push(trimmedLine);
            }
        });

        // Ajouter la dernière section
        if (currentSection) {
            sections.push({
                name: currentSection,
                content: currentContent.join('\n'),
                startLine: sections.length > 0 ? sections[sections.length - 1].endLine : 0,
                endLine: lines.length
            });
        }

        return sections;
    }

    /**
     * Extrait les pièces d'une section
     */
    extractPiecesFromSection(section, annotations) {
        const pieces = [];
        const content = section.content;
        const blocks = content.split('\n\n').filter(block => block.trim());

        blocks.forEach(block => {
            const piece = this.parsePieceBlock(block, section.name, annotations);
            if (piece) {
                pieces.push(piece);
            }
        });

        return pieces;
    }

    /**
     * Parse un bloc de texte pour extraire une pièce
     */
    parsePieceBlock(block, sectionName, annotations) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length === 0) return null;

        const piece = {
            id: this.generatePieceId(lines[0]),
            title: lines[0],
            section: this.mapSectionToId(sectionName),
            compositeur: this.extractField(lines, 'Compositeur'),
            duree: this.extractField(lines, 'Durée'),
            info: this.extractField(lines, 'Info'),
            links: this.findLinksForPiece(lines[0], annotations)
        };

        return piece;
    }

    /**
     * Extrait un champ spécifique des lignes
     */
    extractField(lines, fieldName) {
        for (const line of lines) {
            const regex = new RegExp(`${fieldName}:\\s*(.+)`, 'i');
            const match = line.match(regex);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }

    /**
     * Trouve les liens associés à une pièce
     */
    findLinksForPiece(pieceTitle, annotations) {
        const links = [];
        
        annotations.forEach(annotation => {
            if (annotation.type === 'link' && 
                (annotation.text.toLowerCase().includes(pieceTitle.toLowerCase()) ||
                 pieceTitle.toLowerCase().includes(annotation.text.toLowerCase()))) {
                
                links.push({
                    type: this.categorizeLink(annotation.url),
                    url: annotation.url,
                    label: this.generateLinkLabel(annotation.url)
                });
            }
        });

        return links;
    }

    /**
     * Catégorise un lien selon son URL
     */
    categorizeLink(url) {
        if (url.includes('youtube.com')) return 'audio';
        if (url.includes('notion.so')) return 'details';
        if (url.includes('sheetmusicdirect') || url.includes('alfred') || 
            url.includes('jwpepper') || url.includes('laflutedepan')) return 'purchase';
        return 'other';
    }

    /**
     * Génère un label pour un lien
     */
    generateLinkLabel(url) {
        if (url.includes('youtube.com')) return '🎵 Audio';
        if (url.includes('notion.so')) return '📝 Détails';
        if (this.patterns.purchaseLink.test(url)) return '🛒 Achat';
        return '🔗 Lien';
    }

    /**
     * Génère un ID unique pour une pièce
     */
    generatePieceId(title) {
        return title.toLowerCase()
                   .replace(/[^a-z0-9\s]/g, '')
                   .replace(/\s+/g, '-')
                   .substring(0, 50);
    }

    /**
     * Mappe le nom de section vers un ID
     */
    mapSectionToId(sectionName) {
        const mapping = {
            'Ma région virtuose': 'ma-region-virtuose',
            'Concert du 11 avril avec Eric Aubier': 'concert-eric-aubier',
            'Programme fête de la musique': 'fete-musique',
            'Pièces qui n\'ont pas trouvé leur concert': 'autres-pieces'
        };

        for (const [key, value] of Object.entries(mapping)) {
            if (sectionName.includes(key)) {
                return value;
            }
        }

        return 'autres-pieces';
    }

    /**
     * Extrait les données de financement
     */
    extractFinancementData(text) {
        // À implémenter selon la structure des données de financement
        return {
            dispositifs: [],
            totalEstime: null,
            derniereMAJ: new Date().toISOString()
        };
    }

    /**
     * Compare deux ensembles de données extraites
     */
    compareExtractedData(oldData, newData) {
        const changes = [];

        // Comparer les programmes
        const oldProgrammes = new Map((oldData.programmes || []).map(p => [p.id, p]));
        const newProgrammes = new Map((newData.programmes || []).map(p => [p.id, p]));

        // Nouveaux programmes
        for (const [id, programme] of newProgrammes) {
            if (!oldProgrammes.has(id)) {
                changes.push({
                    type: 'programme_added',
                    programme: programme,
                    description: `Nouveau programme: ${programme.title}`
                });
            }
        }

        // Programmes supprimés
        for (const [id, programme] of oldProgrammes) {
            if (!newProgrammes.has(id)) {
                changes.push({
                    type: 'programme_removed',
                    programme: programme,
                    description: `Programme supprimé: ${programme.title}`
                });
            }
        }

        // Programmes modifiés
        for (const [id, newProgramme] of newProgrammes) {
            const oldProgramme = oldProgrammes.get(id);
            if (oldProgramme) {
                const modifications = this.detectProgrammeChanges(oldProgramme, newProgramme);
                changes.push(...modifications);
            }
        }

        return changes;
    }

    /**
     * Détecte les changements dans un programme spécifique
     */
    detectProgrammeChanges(oldProgramme, newProgramme) {
        const changes = [];
        const fields = ['compositeur', 'duree', 'info'];

        fields.forEach(field => {
            if (oldProgramme[field] !== newProgramme[field]) {
                changes.push({
                    type: 'programme_modified',
                    programme: newProgramme,
                    field: field,
                    oldValue: oldProgramme[field],
                    newValue: newProgramme[field],
                    description: `${newProgramme.title}: ${field} modifié`
                });
            }
        });

        // Comparer les liens
        const oldLinks = JSON.stringify(oldProgramme.links || []);
        const newLinks = JSON.stringify(newProgramme.links || []);
        if (oldLinks !== newLinks) {
            changes.push({
                type: 'programme_modified',
                programme: newProgramme,
                field: 'links',
                oldValue: oldProgramme.links,
                newValue: newProgramme.links,
                description: `${newProgramme.title}: liens modifiés`
            });
        }

        return changes;
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFDataExtractor;
} else {
    window.PDFDataExtractor = PDFDataExtractor;
}
