/**
 * Gestionnaire de mapping intelligent entre Notion et le site web
 * Détecte automatiquement les correspondances et transforme les données
 */

const fs = require('fs');
const path = require('path');
const { NOTION_MAPPING } = require('./structure-analysis.js');

class SmartMapper {
    constructor() {
        this.mappingCache = new Map();
        this.unknownProperties = new Set();
    }

    /**
     * Analyse une base Notion pour détecter sa structure
     */
    analyzeDatabaseStructure(database) {
        const analysis = {
            name: database.title[0]?.plain_text || 'Unknown',
            id: database.id,
            properties: {},
            detectedType: null,
            confidence: 0
        };

        // Analyse des propriétés
        for (const [key, prop] of Object.entries(database.properties)) {
            analysis.properties[key] = {
                type: prop.type,
                config: this.getPropertyConfig(prop)
            };
        }

        // Détection du type de base
        analysis.detectedType = this.detectDatabaseType(analysis.properties);
        analysis.confidence = this.calculateConfidence(analysis.properties, analysis.detectedType);

        return analysis;
    }

    /**
     * Détecte si c'est une base de concerts, pièces ou financement
     */
    detectDatabaseType(properties) {
        const keys = Object.keys(properties).map(k => k.toLowerCase());
        
        // Indicateurs pour chaque type
        const indicators = {
            concerts: ['concert', 'programme', 'date', 'événement', 'spectacle'],
            pieces: ['titre', 'compositeur', 'durée', 'pièce', 'musique', 'morceau'],
            financement: ['financement', 'dispositif', 'montant', 'subvention', 'aide']
        };

        let maxScore = 0;
        let detectedType = 'unknown';

        for (const [type, words] of Object.entries(indicators)) {
            const score = words.reduce((sum, word) => {
                return sum + keys.filter(key => key.includes(word)).length;
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                detectedType = type;
            }
        }

        return maxScore > 0 ? detectedType : 'unknown';
    }

    /**
     * Calcule la confiance de la détection
     */
    calculateConfidence(properties, type) {
        const totalProps = Object.keys(properties).length;
        const mappedProps = this.getMappableProperties(properties, type).length;
        return totalProps > 0 ? (mappedProps / totalProps) * 100 : 0;
    }

    /**
     * Trouve les propriétés mappables selon le type détecté
     */
    getMappableProperties(properties, type) {
        const mapping = type === 'concerts' ? NOTION_MAPPING.concerts : NOTION_MAPPING.pieces;
        return Object.keys(properties).filter(prop => 
            Object.keys(mapping).some(mappingKey => 
                prop.toLowerCase().includes(mappingKey.toLowerCase()) ||
                mappingKey.toLowerCase().includes(prop.toLowerCase())
            )
        );
    }

    /**
     * Mappe une page Notion vers la structure du site
     */
    mapNotionPage(page, databaseType) {
        const mapped = {};
        const mapping = databaseType === 'concerts' ? NOTION_MAPPING.concerts : NOTION_MAPPING.pieces;

        for (const [propName, propData] of Object.entries(page.properties)) {
            // Recherche du mapping
            const mappedKey = this.findMapping(propName, mapping);
            if (mappedKey) {
                const value = this.extractNotionValue(propData);
                if (value !== null && value !== undefined && value !== '') {
                    this.setNestedProperty(mapped, mappedKey, value);
                }
            } else {
                // Propriété non mappée
                this.unknownProperties.add(`${databaseType}:${propName}`);
            }
        }

        return mapped;
    }

    /**
     * Trouve le mapping correspondant pour une propriété
     */
    findMapping(propName, mapping) {
        // Recherche exacte
        if (mapping[propName]) return mapping[propName];

        // Recherche insensible à la casse
        const lowerPropName = propName.toLowerCase();
        for (const [key, value] of Object.entries(mapping)) {
            if (key.toLowerCase() === lowerPropName) return value;
        }

        // Recherche partielle
        for (const [key, value] of Object.entries(mapping)) {
            if (lowerPropName.includes(key.toLowerCase()) || 
                key.toLowerCase().includes(lowerPropName)) {
                return value;
            }
        }

        return null;
    }

    /**
     * Extrait la valeur d'une propriété Notion selon son type
     */
    extractNotionValue(property) {
        switch (property.type) {
            case 'title':
                return property.title.map(t => t.plain_text).join('');
            case 'rich_text':
                return property.rich_text.map(t => t.plain_text).join('');
            case 'number':
                return property.number;
            case 'select':
                return property.select?.name;
            case 'multi_select':
                return property.multi_select.map(s => s.name);
            case 'date':
                return property.date?.start;
            case 'checkbox':
                return property.checkbox;
            case 'url':
                return property.url;
            case 'email':
                return property.email;
            case 'phone_number':
                return property.phone_number;
            case 'relation':
                return property.relation.map(r => r.id);
            case 'rollup':
                return this.extractRollupValue(property.rollup);
            case 'formula':
                return this.extractFormulaValue(property.formula);
            default:
                console.warn(`Type de propriété non supporté: ${property.type}`);
                return null;
        }
    }

    /**
     * Extrait la valeur d'un rollup
     */
    extractRollupValue(rollup) {
        switch (rollup.type) {
            case 'number':
                return rollup.number;
            case 'array':
                return rollup.array.map(item => this.extractNotionValue(item));
            default:
                return rollup[rollup.type];
        }
    }

    /**
     * Extrait la valeur d'une formule
     */
    extractFormulaValue(formula) {
        switch (formula.type) {
            case 'string':
                return formula.string;
            case 'number':
                return formula.number;
            case 'boolean':
                return formula.boolean;
            case 'date':
                return formula.date?.start;
            default:
                return null;
        }
    }

    /**
     * Définit une propriété imbriquée (ex: "links.audio")
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Configuration d'une propriété Notion
     */
    getPropertyConfig(property) {
        switch (property.type) {
            case 'select':
                return { options: property.select.options.map(o => o.name) };
            case 'multi_select':
                return { options: property.multi_select.options.map(o => o.name) };
            case 'relation':
                return { database_id: property.relation.database_id };
            case 'rollup':
                return {
                    relation_property: property.rollup.relation_property_name,
                    rollup_property: property.rollup.rollup_property_name
                };
            case 'formula':
                return { expression: property.formula.expression };
            default:
                return {};
        }
    }

    /**
     * Génère un rapport de mapping
     */
    generateMappingReport() {
        const report = {
            timestamp: new Date().toISOString(),
            unknownProperties: Array.from(this.unknownProperties),
            suggestions: []
        };

        // Suggestions pour les propriétés non mappées
        for (const unknownProp of this.unknownProperties) {
            const [type, propName] = unknownProp.split(':');
            const suggestions = this.suggestMappings(propName, type);
            if (suggestions.length > 0) {
                report.suggestions.push({
                    property: propName,
                    type: type,
                    suggestions: suggestions
                });
            }
        }

        return report;
    }

    /**
     * Suggère des mappings pour une propriété non reconnue
     */
    suggestMappings(propName, type) {
        const mapping = type === 'concerts' ? NOTION_MAPPING.concerts : NOTION_MAPPING.pieces;
        const suggestions = [];
        const lowerProp = propName.toLowerCase();

        // Recherche par similarité
        for (const [key, value] of Object.entries(mapping)) {
            const similarity = this.calculateSimilarity(lowerProp, key.toLowerCase());
            if (similarity > 0.5) {
                suggestions.push({
                    mapping: value,
                    confidence: similarity,
                    reason: `Similarité avec "${key}"`
                });
            }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Calcule la similarité entre deux chaînes
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Distance de Levenshtein
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}

module.exports = SmartMapper;
