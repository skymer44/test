/**
 * ANALYSEUR DE DOCUMENTS PDF
 * 
 * Outils pour analyser les nouveaux documents PDF et détecter les changements
 * par rapport à la baseline de référence.
 */

window.PDFAnalyzer = {
    
    /**
     * Patterns de reconnaissance pour extraire les données des PDFs
     */
    patterns: {
        // Reconnaître les titres de concerts
        concertTitle: /^([A-Z].*?)(?:\s*\(.*?\))?$/gm,
        
        // Reconnaître les pièces musicales
        pieceEntry: /^(.+?)\s*[-–]\s*(.+?)(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/gm,
        
        // Reconnaître les compositeurs
        composer: /(?:par|de|arr\.|arrangé par)\s*([A-Z][^,\n]*)/gi,
        
        // Reconnaître les durées
        duration: /(\d{1,2}:\d{2}|\d+\s*min)/g,
        
        // Reconnaître les informations/commentaires
        info: /(?:info|note|commentaire):\s*(.+)/gi,
        
        // Sections de financement
        financingSection: /financement|subvention|budget/gi
    },
    
    /**
     * Analyse un texte extrait d'un PDF pour identifier la structure
     */
    analyzePDFText: function(text) {
        const result = {
            concerts: [],
            pieces: [],
            financing: null,
            metadata: {
                analysisDate: new Date().toISOString(),
                textLength: text.length,
                confidence: 0
            }
        };
        
        // Diviser le texte en sections
        const sections = this.identifySections(text);
        
        // Analyser chaque section
        sections.forEach(section => {
            if (this.isFinancingSection(section.content)) {
                result.financing = this.extractFinancingData(section.content);
            } else {
                const concert = this.extractConcertData(section);
                if (concert && concert.pieces.length > 0) {
                    result.concerts.push(concert);
                    result.pieces.push(...concert.pieces);
                }
            }
        });
        
        // Calculer un score de confiance
        result.metadata.confidence = this.calculateConfidence(result, text);
        
        return result;
    },
    
    /**
     * Identifie les sections principales dans le texte
     */
    identifySections: function(text) {
        const sections = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentSection = { title: '', content: '', startLine: 0 };
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Détecter un nouveau titre de section (ligne en majuscules ou avec mots-clés)
            if (this.isSectionTitle(trimmedLine)) {
                if (currentSection.content) {
                    sections.push({ ...currentSection });
                }
                currentSection = {
                    title: trimmedLine,
                    content: '',
                    startLine: index
                };
            } else {
                currentSection.content += line + '\n';
            }
        });
        
        // Ajouter la dernière section
        if (currentSection.content) {
            sections.push(currentSection);
        }
        
        return sections;
    },
    
    /**
     * Détermine si une ligne est un titre de section
     */
    isSectionTitle: function(line) {
        // Titre en majuscules
        if (line === line.toUpperCase() && line.length > 5) return true;
        
        // Contient des mots-clés de concerts
        const concertKeywords = /concert|programme|festival|récital|spectacle/gi;
        if (concertKeywords.test(line) && line.length < 100) return true;
        
        // Contient des mots-clés de financement
        const financingKeywords = /financement|budget|subvention|coût/gi;
        if (financingKeywords.test(line) && line.length < 100) return true;
        
        return false;
    },
    
    /**
     * Détermine si une section concerne le financement
     */
    isFinancingSection: function(content) {
        return this.patterns.financingSection.test(content);
    },
    
    /**
     * Extrait les données d'un concert à partir d'une section
     */
    extractConcertData: function(section) {
        const concert = {
            id: this.generateId(section.title),
            title: section.title,
            duration: this.extractDuration(section.title),
            pieces: []
        };
        
        // Extraire les pièces de cette section
        const pieces = this.extractPieces(section.content);
        concert.pieces = pieces.map(piece => ({
            ...piece,
            concertId: concert.id,
            concertTitle: concert.title
        }));
        
        return concert;
    },
    
    /**
     * Extrait les pièces musicales d'un texte
     */
    extractPieces: function(text) {
        const pieces = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
            const piece = this.parsePieceLine(line.trim());
            if (piece) {
                pieces.push(piece);
            }
        });
        
        return pieces;
    },
    
    /**
     * Parse une ligne pour extraire une pièce musicale
     */
    parsePieceLine: function(line) {
        // Ignorer les lignes trop courtes ou qui ne semblent pas être des pièces
        if (line.length < 3 || /^(page|section|\d+\.)/.test(line.toLowerCase())) {
            return null;
        }
        
        const piece = {
            title: '',
            composer: '',
            duration: '',
            info: '',
            links: {}
        };
        
        // Extraire le titre (première partie avant un séparateur)
        const titleMatch = line.match(/^([^-–\n]+?)(?:\s*[-–]|$)/);
        if (titleMatch) {
            piece.title = titleMatch[1].trim();
        } else {
            piece.title = line.split('\n')[0].trim();
        }
        
        // Extraire le compositeur
        const composerMatch = line.match(/(?:par|de|arr\.|compositeur|composer)\s*[:\-]?\s*([A-Z][^,\n\-–]+)/gi);
        if (composerMatch) {
            piece.composer = composerMatch[0].replace(/(?:par|de|arr\.|compositeur|composer)\s*[:\-]?\s*/gi, '').trim();
        }
        
        // Extraire la durée
        const durationMatch = line.match(/(\d{1,2}:\d{2}|\d+\s*min)/);
        if (durationMatch) {
            piece.duration = durationMatch[1];
        }
        
        // Extraire les informations/commentaires
        const infoMatch = line.match(/(?:info|note|commentaire)[:\-]?\s*(.+)/gi);
        if (infoMatch) {
            piece.info = infoMatch[0].replace(/(?:info|note|commentaire)[:\-]?\s*/gi, '').trim();
        }
        
        // Ne retourner que si on a au moins un titre valide
        return piece.title.length > 1 ? piece : null;
    },
    
    /**
     * Extrait la durée d'un titre de concert
     */
    extractDuration: function(title) {
        const match = title.match(/\(([^)]*(?:min|h|heure)[^)]*)\)/);
        return match ? match[1] : '';
    },
    
    /**
     * Génère un ID unique à partir d'un titre
     */
    generateId: function(title) {
        return title.toLowerCase()
                   .replace(/[àáâãäå]/g, 'a')
                   .replace(/[èéêë]/g, 'e')
                   .replace(/[ìíîï]/g, 'i')
                   .replace(/[òóôõö]/g, 'o')
                   .replace(/[ùúûü]/g, 'u')
                   .replace(/[^a-z0-9]/g, '-')
                   .replace(/-+/g, '-')
                   .replace(/^-|-$/g, '');
    },
    
    /**
     * Extrait les données de financement
     */
    extractFinancingData: function(text) {
        // Cette fonction sera développée selon le format spécifique des tableaux de financement
        return {
            schemes: [],
            extracted: true,
            rawText: text
        };
    },
    
    /**
     * Calcule un score de confiance pour l'analyse
     */
    calculateConfidence: function(result, originalText) {
        let score = 0;
        
        // Points pour les concerts trouvés
        score += result.concerts.length * 10;
        
        // Points pour les pièces trouvées
        score += result.pieces.length * 5;
        
        // Points pour les informations détaillées
        result.pieces.forEach(piece => {
            if (piece.composer) score += 3;
            if (piece.duration) score += 2;
            if (piece.info) score += 1;
        });
        
        // Normaliser sur 100
        return Math.min(100, score);
    },
    
    /**
     * Compare les nouvelles données avec la baseline
     */
    compareWithBaseline: function(newData) {
        if (!window.BASELINE_DATA) {
            throw new Error("Données de référence non chargées");
        }
        
        return window.DocumentAnalyzer.compareData(window.BASELINE_DATA, newData);
    },
    
    /**
     * Génère un rapport d'analyse complet
     */
    generateAnalysisReport: function(analysisResult, changes) {
        const report = [];
        
        report.push("📊 **RAPPORT D'ANALYSE PDF**");
        report.push("=" .repeat(30));
        report.push("");
        
        // Métadonnées
        report.push(`🕐 Analysé le: ${new Date(analysisResult.metadata.analysisDate).toLocaleString('fr-FR')}`);
        report.push(`🎯 Score de confiance: ${analysisResult.metadata.confidence}%`);
        report.push(`📄 Taille du texte: ${analysisResult.metadata.textLength} caractères`);
        report.push("");
        
        // Résumé des données trouvées
        report.push("📋 **DONNÉES EXTRAITES:**");
        report.push(`  - ${analysisResult.concerts.length} concert(s)`);
        report.push(`  - ${analysisResult.pieces.length} pièce(s) musicale(s)`);
        report.push("");
        
        // Changements détectés
        report.push(window.DocumentAnalyzer.generateChangeReport(changes));
        
        return report.join("\n");
    }
};

console.log("🔍 Analyseur PDF chargé et prêt");
